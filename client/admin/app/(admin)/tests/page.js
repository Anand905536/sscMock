"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";

import { apiRequest } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Admin login token not found. Please login again.");
        return;
      }

      const data = await apiRequest("/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("called", data.tests)

      setTests(Array.isArray(data) ? data : data.tests || []);
    } catch (err) {
      setError(err.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDelete = async (testId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this test?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await apiRequest(`/tests/${testId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTests();
    } catch (err) {
      alert(err.message || "Failed to delete test");
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-zinc-950 p-6 md:p-8 text-zinc-100 selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tests
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Create and manage mock tests.
          </p>
        </div>

        <div className="flex gap-2.5">
          <Button
            variant="outline"
            onClick={fetchTests}
            disabled={loading}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={() => router.push("/tests/new")}
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold cursor-pointer shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </div>
      </div>

      {/* Tests table */}
      <Card className="border-zinc-800/80 bg-zinc-900 text-zinc-100 shadow-xl shadow-zinc-950/40">
        <CardHeader className="border-b border-zinc-800/80">
          <CardTitle className="text-white text-base font-bold">
            All Tests
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {loading ? (
            <div className="py-10 text-center text-zinc-400 text-sm">
              Loading tests...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-rose-400 text-sm">
              {error}
            </div>
          ) : tests.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-zinc-400 text-sm">
                No tests found.
              </p>

              <Button
                onClick={() => router.push("/tests/new")}
                className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700 font-bold cursor-pointer text-xs"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first test
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/80 hover:bg-transparent">
                  <TableHead className="text-zinc-400 text-xs font-semibold">Title</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-semibold">Duration</TableHead>
                  <TableHead className="text-zinc-400 text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-right text-zinc-400 text-xs font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-zinc-800/60">
                {tests.map((test) => (
                  <TableRow
                    key={test._id}
                    className="border-zinc-800/60 transition-colors hover:bg-zinc-800/50"
                  >
                    <TableCell className="font-medium text-white text-sm">
                      {test.title}
                    </TableCell>

                    <TableCell className="text-zinc-300 text-sm">
                      {test.category || "—"}
                    </TableCell>

                    <TableCell className="text-zinc-300 text-sm font-mono">
                      {test.durationMinutes} min
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`font-semibold text-[11px] ${
                          test.status === "published"
                            ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15"
                            : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {test.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tests/${test._id}/edit`)}
                          className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer h-8 text-xs font-semibold"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(test._id)}
                          className="border-rose-500/30 bg-rose-500/10 text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer h-8 text-xs font-semibold"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}