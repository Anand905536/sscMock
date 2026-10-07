"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  CircleHelp,
  Users,
  ClipboardCheck,
  Plus,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { apiRequest } from "../../../lib/api";

export default function DashboardPage() {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const [testsData, questionsData, userStatsData] = await Promise.all([
          apiRequest("/tests", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          apiRequest("/questions", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          apiRequest("/users/stats", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);


        setTests(testsData || []);
        setQuestions(questionsData || []);
        setUserStats(userStatsData || {
          totalUsers: 0,
          activeUsers: 0,
        });

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalTests = tests.length;

  const publishedTests = tests.filter(
    (test) => test.status === "published"
  ).length;

  const draftTests = tests.filter(
    (test) => test.status === "draft"
  ).length;

  const totalQuestions = questions.length;

  const recentTests = [...tests]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your tests, questions, and users.
            </p>
          </div>

          <Button asChild className="gap-2">
            <Link href="/tests">
              <Plus className="h-4 w-4" />
              Create Test
            </Link>
          </Button>
        </div>

        {/* Stats */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total Tests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Tests
              </CardTitle>

              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : totalTests}
              </div>

              <p className="mt-1 text-xs text-gray-500">
                All created tests
              </p>
            </CardContent>
          </Card>

          {/* Published Tests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Published Tests
              </CardTitle>

              <ClipboardCheck className="h-4 w-4 text-gray-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : publishedTests}
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Currently available
              </p>
            </CardContent>
          </Card>

          {/* Draft Tests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Draft Tests
              </CardTitle>

              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : draftTests}
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Not yet published
              </p>
            </CardContent>
          </Card>

          {/* Total Questions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Questions
              </CardTitle>

              <CircleHelp className="h-4 w-4 text-gray-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : totalQuestions}
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Across all tests
              </p>
            </CardContent>
          </Card>

          {/* Users - temporary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Users
              </CardTitle>

              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? "..." : userStats.totalUsers}
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Registered users
              </p>
            </CardContent>
          </Card>
             
              <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Users
            </CardTitle>

            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? "..." : userStats.activeUsers}
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Active in last 5 minutes
            </p>
          </CardContent>
        </Card>
        </div>

       

        {/* Recent Tests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tests</CardTitle>

              <p className="mt-1 text-sm text-gray-500">
                Recently created tests.
              </p>
            </div>

            <Button variant="ghost" asChild className="gap-2">
              <Link href="/tests">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="py-4 text-sm text-gray-500">
                Loading tests...
              </p>
            ) : recentTests.length === 0 ? (
              <p className="py-4 text-sm text-gray-500">
                No tests found.
              </p>
            ) : (
              <div className="divide-y">
                {recentTests.map((test) => (
                  <div
                    key={test._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {test.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {test.category || "No category"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${test.status === "published"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {test.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="transition hover:shadow-sm">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Manage Tests
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Create, edit, publish, or delete tests.
                  </p>
                </div>

                <Button variant="outline" asChild>
                  <Link href="/tests">Open</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="transition hover:shadow-sm">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Manage Questions
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Add and manage questions for your tests.
                  </p>
                </div>

                <Button variant="outline" asChild>
                  <Link href="/questions">Open</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}