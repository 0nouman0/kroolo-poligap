import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FlaggedIssue {
  id: string;
  userId: string;
  companyId: string;
  status: string;
  reason: string;
  name: string;
  email: string;
  note: string;
  date: string;
  link: string;
  title: string;
}

export default function ModerateFlaggedIssuesPage() {
  const [issues, setIssues] = useState<FlaggedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/flagged-issues");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setIssues(data);
      } catch (e) {
        setError("Failed to load flagged issues");
      } finally {
        setLoading(false);
      }
    }
    fetchIssues();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Flagged Issues Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : issues.length === 0 ? (
            <div className="text-muted-foreground">
              No flagged issues found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Link</th>
                    <th className="p-2 border">Reason</th>
                    <th className="p-2 border">Note</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">User Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">CompanyId</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id} className="border-b">
                      <td className="p-2 border">
                        {new Date(issue.date).toLocaleString()}
                      </td>
                      <td className="p-2 border">{issue.title}</td>
                      <td className="p-2 border">
                        <a
                          href={issue.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Link
                        </a>
                      </td>
                      <td className="p-2 border">{issue.reason}</td>
                      <td className="p-2 border">{issue.note}</td>
                      <td className="p-2 border">{issue.status}</td>
                      <td className="p-2 border">{issue.name}</td>
                      <td className="p-2 border">{issue.email}</td>
                      <td className="p-2 border">{issue.companyId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
