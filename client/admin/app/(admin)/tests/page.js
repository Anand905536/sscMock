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

      console.log("called", data.tests)

      setTests(data || []);
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
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tests
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage mock tests.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchTests}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button onClick={() => router.push("/tests/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </div>
      </div>

      {/* Tests table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tests</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading tests...
            </div>
          ) : error ? (
            <div className="py-10 text-center text-destructive">
              {error}
            </div>
          ) : tests.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">
                No tests found.
              </p>

              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create your first test
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test._id}>
                    <TableCell className="font-medium">
                      {test.title}
                    </TableCell>

                    <TableCell>
                      {test.category || "—"}
                    </TableCell>

                    <TableCell>
                      {test.durationMinutes} min
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          test.status === "published"
                            ? "default"
                            : "secondary"
                        }
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
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDelete(test._id)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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