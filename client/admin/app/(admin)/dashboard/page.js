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
          setLoading(false);
          return;
        }

        const [testsData, questionsData, , userStatsData] = await Promise.all([
          apiRequest("/tests", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => []),

          apiRequest("/questions", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => []),

          apiRequest("/full-length-exams", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => null),

          apiRequest("/users/stats", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => null),
        ]);

        setTests(Array.isArray(testsData) ? testsData : testsData?.tests || []);
        setQuestions(Array.isArray(questionsData) ? questionsData : questionsData?.questions || []);
        setUserStats({
          totalUsers: userStatsData?.totalUsers ?? userStatsData?.total ?? 0,
          activeUsers: userStatsData?.activeUsers ?? userStatsData?.active ?? 0,
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 selection:bg-emerald-500 selection:text-white">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Manage your tests, questions, and users.
            </p>
          </div>

          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">
            <Link href="/tests">
              <Plus className="h-4 w-4" />
              Create Test
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total Tests */}
          <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Total Tests
              </CardTitle>

              <FileText className="h-4 w-4 text-emerald-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalTests}
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                All created tests
              </p>
            </CardContent>
          </Card>

          {/* Published Tests */}
          <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Published Tests
              </CardTitle>

              <ClipboardCheck className="h-4 w-4 text-emerald-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : publishedTests}
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Currently available
              </p>
            </CardContent>
          </Card>

          {/* Draft Tests */}
          <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Draft Tests
              </CardTitle>

              <FileText className="h-4 w-4 text-zinc-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : draftTests}
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Not yet published
              </p>
            </CardContent>
          </Card>

          {/* Total Questions */}
          <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Total Questions
              </CardTitle>

              <CircleHelp className="h-4 w-4 text-emerald-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : totalQuestions}
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Across all tests
              </p>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Total Users
              </CardTitle>

              <Users className="h-4 w-4 text-emerald-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : userStats.totalUsers}
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Registered users
              </p>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Active Users
              </CardTitle>

              <Users className="h-4 w-4 text-emerald-400" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : userStats.activeUsers}
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Active in last 5 minutes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tests */}
        <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Tests</CardTitle>

              <p className="mt-1 text-sm text-zinc-400">
                Recently created tests.
              </p>
            </div>

            <Button variant="ghost" asChild className="gap-2 text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800 cursor-pointer">
              <Link href="/tests">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="py-4 text-sm text-zinc-400">
                Loading tests...
              </p>
            ) : recentTests.length === 0 ? (
              <p className="py-4 text-sm text-zinc-400">
                No tests found.
              </p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {recentTests.map((test) => (
                  <div
                    key={test._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-white">
                        {test.title}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        {test.category || "No category"}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${test.status === "published"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-400"
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
          <h2 className="mb-4 text-lg font-semibold text-white">
            Quick Actions
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40 transition hover:border-zinc-700">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-medium text-white">
                    Manage Tests
                  </h3>

                  <p className="mt-1 text-sm text-zinc-400">
                    Create, edit, publish, or delete tests.
                  </p>
                </div>

                <Button variant="outline" asChild className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white cursor-pointer">
                  <Link href="/tests">Open</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800/80 text-zinc-100 shadow-xl shadow-zinc-950/40 transition hover:border-zinc-700">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-medium text-white">
                    Manage Questions
                  </h3>

                  <p className="mt-1 text-sm text-zinc-400">
                    Add and manage questions for your tests.
                  </p>
                </div>

                <Button variant="outline" asChild className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white cursor-pointer">
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