"use client";

import React, { useEffect, useState } from "react";
import { CheckSquare, Plus, Filter, Check, RotateCcw, Trash2, Shield, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task {
  _id?: string;
  id?: string; // client convenience
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  assignee?: string;
  category?: string;
  source?: "compliance" | "contract" | "manual";
  sourceRef?: Record<string, any>;
}

// Dynamic tasks loaded from API
const initialTasks: Task[] = [];

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  // Extract only the suggested fix from mixed descriptions like
  // "<issue details>. Recommended: <fix text>" or "Suggested fix: <fix text>".
  const getSuggestedFix = (text?: string) => {
    if (!text) return "";
    const lower = text.toLowerCase();
    const keys = ["recommended:", "recommendation:", "suggested fix:", "suggestion:"];
    for (const k of keys) {
      const idx = lower.indexOf(k);
      if (idx !== -1) {
        return text.slice(idx + k.length).trim();
      }
    }
    // Fallback: if no marker found, return the original text
    return text;
  };
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskSource, setNewTaskSource] = useState<"manual" | "compliance" | "contract">("manual");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // status
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (activeTab !== "all") params.set("status", activeTab);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);

      const res = await fetch(`/api/tasks${params.toString() ? `?${params.toString()}` : ""}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load tasks");
      }
      const incoming: Task[] = (data.tasks || []).map((t: any) => ({ ...t, id: t._id || t.id }));
      // Deduplicate using a stable composite key
      const byKey = new Map<string, Task>();
      for (const t of incoming) {
        const key = t.sourceRef && (t.sourceRef.resultId || t.sourceRef.gapId)
          ? `${t.source || 'unknown'}:${t.title}:${t.sourceRef.resultId || ''}:${t.sourceRef.gapId || ''}`
          : (t._id || t.id || `${t.title}:${t.dueDate || ''}`);
        if (!byKey.has(key)) byKey.set(key, t);
      }
      setTasks(Array.from(byKey.values()));
    } catch (e: any) {
      setError(e.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, priorityFilter, sourceFilter]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm.trim() ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getSourceStyle = (source?: string) => {
    switch (source) {
      case "compliance": return { bar: "border-l-8 border-blue-500", pill: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", icon: <Shield className="h-3.5 w-3.5" /> };
      case "contract": return { bar: "border-l-8 border-purple-500", pill: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", icon: <FileText className="h-3.5 w-3.5" /> };
      default: return { bar: "border-l-8 border-gray-400", pill: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300", icon: <CheckSquare className="h-3.5 w-3.5" /> };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "medium": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const createTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: newTaskDescription.trim(),
          status: 'pending',
          priority: 'medium',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          category: 'General',
          source: newTaskSource
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create task');
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskSource('manual');
      setShowNewTaskForm(false);
      await loadTasks();
    } catch (e) {
      console.error('Create task failed', e);
    }
  };

  const updateTask = async (task: Task, updates: Partial<Task>) => {
    const id = task._id || task.id;
    if (!id) return;
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates })
    }).then(() => loadTasks());
  };

  const deleteTask = async (task: Task) => {
    const id = task._id || task.id;
    if (!id) return;
    await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      .then(() => loadTasks());
  };

  return (
    <div className="w-full max-w-none p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6" />
            My Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your compliance and contract review tasks
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowNewTaskForm(true)}
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadTasks}>Apply</Button>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Add a new compliance or contract review task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="taskTitle" className="text-sm font-medium">Task Title</label>
              <Input
                id="taskTitle"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="taskDescription" className="text-sm font-medium">Description</label>
              <Input
                id="taskDescription"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description..."
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Task Type</label>
              <Select value={newTaskSource} onValueChange={(v: any) => setNewTaskSource(v)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Compliance Gap</SelectItem>
                  <SelectItem value="contract">Contract Review</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={createTask} disabled={!newTaskTitle.trim()}>
                Create Task
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewTaskForm(false);
                  setNewTaskTitle("");
                  setNewTaskDescription("");
                  setNewTaskSource('manual');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">Loading tasks…</CardContent>
            </Card>
          )}
          {!!error && (
            <Card>
              <CardContent className="py-8 text-center text-red-600">{error}</CardContent>
            </Card>
          )}
          {!loading && !error && filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No tasks found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "Create your first task to get started"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredTasks.map((task) => {
                const s = getSourceStyle(task.source);
                const idKey = task._id || task.id;
                return (
                  <Card key={idKey} className={`hover:shadow-md transition-shadow ${s.bar}`}>
                    <CardHeader className="py-0.5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0">
                          <div className="flex items-center gap-1">
                            <div className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${s.pill}`}>
                              {s.icon}
                              <span className="capitalize">{task.source || 'manual'}</span>
                            </div>
                            <Badge className={`${getPriorityColor(task.priority)} text-[10px] px-1.5 py-0.5`}>{task.priority}</Badge>
                            <Badge className={`${getStatusColor(task.status)} text-[10px] px-1.5 py-0.5`}>{task.status.replace("-"," ")}</Badge>
                          </div>
                          <CardTitle className="text-base font-semibold leading-tight line-clamp-1 mt-0 mb-0">{task.title}</CardTitle>
                          <CardDescription className="text-sm leading-tight line-clamp-2 mt-0 mb-0">{getSuggestedFix(task.description)}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1 min-w-[84px]">
                          <div className="flex items-center gap-1">
                          {task.status !== 'completed' ? (
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateTask(task, { status: 'completed' })} title="Mark as complete">
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Complete</span>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateTask(task, { status: 'pending' })} title="Mark as pending">
                              <RotateCcw className="h-4 w-4" />
                              <span className="sr-only">Pending</span>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => deleteTask(task)} title="Delete task">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{task.category || "General"}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
