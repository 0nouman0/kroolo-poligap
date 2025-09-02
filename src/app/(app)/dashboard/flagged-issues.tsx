import { Skeleton } from "@/components/ui/skeleton";
import { useFlaggedIssues } from "@/lib/queries/useFlaggedIssues";
import { useCompanyStore } from "@/stores/company-store";
import {
  AlertCircle,
  BellElectric,
  Check,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { NotificationAdd } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function FlaggedIssuesTable() {
  const companyId = useCompanyStore((s) => s.selectedCompany?.companyId);
  const { data, isLoading, error } = useFlaggedIssues();
  const issues = data || [];
  const queryClient = useQueryClient();

  // Optimistic update for marking all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/flagged-issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["flagged-issues", companyId],
      });
      const previous = queryClient.getQueryData(["flagged-issues", companyId]);
      queryClient.setQueryData(["flagged-issues", companyId], (old: any) =>
        (old || []).map((issue: any) =>
          issue.status === "new" ? { ...issue, status: "viewed" } : issue
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["flagged-issues", companyId],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["flagged-issues", companyId],
      });
    },
  });

  // Optimistic update for marking one as read
  const markOneAsRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/flagged-issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: ["flagged-issues", companyId],
      });
      const previous = queryClient.getQueryData(["flagged-issues", companyId]);
      queryClient.setQueryData(["flagged-issues", companyId], (old: any) =>
        (old || []).map((issue: any) =>
          issue._id === id ? { ...issue, status: "viewed" } : issue
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["flagged-issues", companyId],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["flagged-issues", companyId],
      });
    },
  });

  return (
    <div>
      <Table className="bg-background rounded-lg border-t border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
        <TableHeader className="text-13">
          <TableRow className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent h-7">
            <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
              Status
            </TableHead>
            <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
              Reason
            </TableHead>
            <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
              Reporter Name
            </TableHead>
            <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
              Note
            </TableHead>
            <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
              Date
            </TableHead>
            <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
              Go To
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow
                key={i}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent"
              >
                <TableCell colSpan={6} className="px-3 py-1">
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent">
              <TableCell colSpan={6} className="text-red-500 px-3 py-1">
                Failed to load flagged issues.
              </TableCell>
            </TableRow>
          ) : !issues.length ? (
            <TableRow className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent">
              <TableCell
                colSpan={6}
                className="text-muted-foreground px-3 py-1"
              >
                No flagged issues found.
              </TableCell>
            </TableRow>
          ) : (
            issues.map((issue: any, idx: number) => (
              <TableRow
                key={issue._id || idx}
                className={
                  issue.status === "new"
                    ? "bg-blue-50 dark:bg-blue-950 dark:text-white border-b border-gray-100 dark:border-gray-700 hover:bg-transparent"
                    : "border-b border-gray-100 dark:border-gray-700 hover:bg-transparent"
                }
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (issue.status === "new") markOneAsRead.mutate(issue._id);
                }}
              >
                <TableCell className="px-3 py-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                      issue.status === "new"
                        ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {issue.status === "new" ? (
                      <>
                        <NotificationAdd
                          className="mr-2"
                          sx={{ fontSize: 16 }}
                        />
                        New
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Viewed
                      </>
                    )}
                  </span>
                </TableCell>
                <TableCell className="px-3 py-1 text-gray-900 dark:text-gray-100">
                  {issue.reason}
                </TableCell>
                <TableCell className="px-3 py-1 text-gray-900 dark:text-gray-100">
                  {issue.name}
                </TableCell>
                <TableCell className="px-3 py-1 text-gray-900 dark:text-gray-100">
                  {issue.email} flagged: {issue.note}
                </TableCell>
                <TableCell className="px-3 py-1 text-gray-900 dark:text-gray-100">
                  {new Date(issue.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="px-3 py-1">
                  <Link
                    href={issue.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 inline-flex items-center hover:text-blue-800 dark:hover:text-blue-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
