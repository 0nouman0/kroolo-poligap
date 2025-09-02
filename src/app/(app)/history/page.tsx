"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { History as HistoryIcon, AlertTriangle, CheckCircle, FileText, Calendar, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ComplianceStatus = 'compliant' | 'non-compliant' | 'partial';

interface ComplianceGap {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
  recommendation?: string;
  section?: string;
}

interface AuditLog {
  _id: string;
  fileName: string;
  standards: string[];
  score: number;
  status: ComplianceStatus;
  gapsCount: number;
  analysisDate: string;
  fileSize: number;
  analysisMethod?: string;
  snapshot?: {
    gaps?: ComplianceGap[];
    suggestions?: string[];
  };
}

function statusColor(status: ComplianceStatus) {
  switch (status) {
    case 'compliant':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const issuesRef = useRef<HTMLDivElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const resp = await fetch('/api/audit-logs');
        const data = await resp.json();
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      } catch (e) {
        console.error('Failed to load history logs', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Auto-open by logId and optional tab focus (use dialog)
  useEffect(() => {
    const id = searchParams.get('logId');
    const tab = searchParams.get('tab');
    if (!id || logs.length === 0) return;
    const found = logs.find(l => l._id === id);
    if (found) {
      setSelected(found);
      setOpen(true);
      // Slight delay to allow dialog content to mount
      setTimeout(() => {
        if (tab === 'issues') issuesRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (tab === 'suggestions') suggestionsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [logs, searchParams]);

  const filteredGaps = useMemo(() => {
    if (!selected?.snapshot?.gaps) return [] as ComplianceGap[];
    return selected.snapshot.gaps.filter(g => {
      const matchesPriority = priorityFilter === 'all' || g.priority === priorityFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q);
      return matchesPriority && matchesQuery;
    });
  }, [selected, priorityFilter, query]);

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HistoryIcon className="h-7 w-7" />
          History
        </h1>
        <Button variant="outline" onClick={async () => {
          // Refresh
          try {
            setLoading(true);
            const resp = await fetch('/api/audit-logs');
            const data = await resp.json();
            setLogs(Array.isArray(data.logs) ? data.logs : []);
          } finally {
            setLoading(false);
          }
        }}>Refresh</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : logs.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No history yet. Run a compliance analysis to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map((log) => (
            <Card key={log._id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelected(log); setOpen(true); }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base truncate" title={log.fileName}>{log.fileName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(log.analysisDate).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={statusColor(log.status)} variant="secondary">{log.status}</Badge>
                  <Badge variant="outline">{log.score}%</Badge>
                  {log.standards.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s.toUpperCase()}</Badge>
                  ))}
                  {log.standards.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{log.standards.length - 3}</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Issues: {log.gapsCount}</div>
                <div className="flex gap-2">
                  <Link href={`/history?logId=${log._id}&tab=issues`}><Button size="sm" variant="ghost">Open Full Issues</Button></Link>
                  <Link href={`/history?logId=${log._id}&tab=suggestions`}><Button size="sm" variant="ghost">Open Full Suggestions</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-screen min-w-[720px] max-w-none p-0" aria-label="Detailed analysis report" aria-describedby="history-dialog-desc">
          {/* Sticky header for context */}
          <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-5">
            <SheetHeader className="p-0">
              <SheetTitle className="text-2xl text-purple-600">Audit Details</SheetTitle>
              <SheetDescription id="history-dialog-desc">Historical compliance result snapshot</SheetDescription>
            </SheetHeader>
            {selected && (
              <div className="mt-3 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-lg">{selected.fileName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(selected.analysisDate).toLocaleString()} • {selected.standards.map(s => s.toUpperCase()).join(', ')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColor(selected.status)} ring-1 ring-purple-200`} aria-label={`Status ${selected.status}`}>{selected.status}</Badge>
                  <Badge variant="outline" className="ring-1 ring-purple-200" aria-label={`Score ${selected.score} percent`}>{selected.score}%</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable body with two columns */}
          {selected && (
            <div className="h-[calc(100vh-5rem)] overflow-hidden px-8 py-5">
              <div className="grid grid-cols-1 gap-6 h-full overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* Issues (top) */}
                <section ref={issuesRef} aria-label="Issues list" className="border rounded-md p-4 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2 text-purple-700"><AlertTriangle className="h-4 w-4" />Issues ({selected.gapsCount})</h4>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                        <Input aria-label="Search issues" className="pl-8 w-64" placeholder="Search issues..." value={query} onChange={(e)=>setQuery(e.target.value)} />
                      </div>
                      <Select value={priorityFilter} onValueChange={(v)=>setPriorityFilter(v as any)}>
                        <SelectTrigger className="w-[160px]" aria-label="Priority filter">
                          <SelectValue placeholder="All priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All priorities</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {filteredGaps.length > 0 ? (
                      <div className="space-y-3">
                        {filteredGaps.map((gap) => (
                          <Card key={gap.id} className="hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-purple-500">
                            <CardContent className="p-4">
                              <div className="text-sm font-semibold">{gap.title}</div>
                              <div className="text-xs text-muted-foreground">{gap.description}</div>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{gap.priority}</Badge>
                                {gap.category && <Badge variant="outline" className="text-xs">{gap.category}</Badge>}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No issues match your filters.</p>
                    )}
                  </div>
                </section>

                {/* Suggestions (bottom) */}
                <section ref={suggestionsRef} aria-label="Suggested fixes" className="border rounded-md p-4 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col min-h-0">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-300"><CheckCircle className="h-4 w-4" />Suggested Fixes</h4>
                  <div className="flex-1 overflow-y-auto pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {selected.snapshot?.suggestions && selected.snapshot.suggestions.length > 0 ? (
                      <ul className="space-y-3">
                        {selected.snapshot.suggestions.map((s, i) => (
                          <li key={i} className="text-sm leading-relaxed border border-emerald-200 dark:border-emerald-800 rounded-md p-3 bg-white/70 dark:bg-emerald-900/20">
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No suggestions snapshot stored.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

        </SheetContent>
      </Sheet>
    </div>
  );
}
