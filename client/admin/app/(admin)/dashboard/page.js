import Link from "next/link";
import {
  FileText,
  CircleHelp,
  Users,
  ClipboardCheck,
  Plus,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

const stats = [
  {
    title: "Total Tests",
    value: "12",
    description: "All created tests",
    icon: FileText,
  },
  {
    title: "Published Tests",
    value: "8",
    description: "Currently available",
    icon: ClipboardCheck,
  },
  {
    title: "Total Questions",
    value: "240",
    description: "Across all tests",
    icon: CircleHelp,
  },
  {
    title: "Total Users",
    value: "156",
    description: "Registered users",
    icon: Users,
  },
];

const recentTests = [
  {
    title: "SSC CGL Mock Test 1",
    category: "SSC CGL",
    questions: 25,
    status: "Published",
  },
  {
    title: "SSC CHSL Practice Set",
    category: "SSC CHSL",
    questions: 30,
    status: "Published",
  },
  {
    title: "General Knowledge Test",
    category: "GK",
    questions: 20,
    status: "Draft",
  },
];

export default function DashboardPage() {
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>

                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>

                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Tests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tests</CardTitle>

              <p className="mt-1 text-sm text-gray-500">
                Overview of recently created tests.
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
            <div className="divide-y">
              {recentTests.map((test) => (
                <div
                  key={test.title}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {test.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {test.category} · {test.questions} questions
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                      test.status === "Published"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
              ))}
            </div>
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