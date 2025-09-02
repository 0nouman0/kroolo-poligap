"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Plus, FileText, Tag, Trash2, Download, Search } from "lucide-react";

interface RuleItem {
  _id?: string;
  name: string;
  description?: string;
  tags?: string[];
  updatedAt?: string;
  sourceType?: "text" | "file";
  fileName?: string;
}

export default function RuleBasePage() {
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDesc, setNewRuleDesc] = useState("");
  const [newRuleTags, setNewRuleTags] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch("/api/rulebase");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setRules(Array.isArray(data?.rules) ? data.rules : []);
      } catch (e) {
        setRules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rules;
    return rules.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      (r.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [rules, searchTerm]);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", files[0]);
      const res = await fetch("/api/rulebase/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.rule) {
        setRules(prev => [data.rule, ...prev]);
      }
    } catch (e) {
      // swallow errors for now
    } finally {
      setUploading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!newRuleName.trim()) return;
    const payload = {
      name: newRuleName.trim(),
      description: newRuleDesc.trim(),
      tags: newRuleTags.split(",").map(t => t.trim()).filter(Boolean),
      sourceType: "text" as const,
    };
    try {
      const res = await fetch("/api/rulebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.rule) {
        setRules(prev => [data.rule, ...prev]);
        setIsCreateOpen(false);
        setNewRuleName("");
        setNewRuleDesc("");
        setNewRuleTags("");
      }
    } catch {}
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RuleBase</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage your company's custom compliance and contract rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer">
            <Upload className="h-4 w-4" />
            <span className="text-sm">Upload Rules File</span>
            <input
              type="file"
              className="hidden"
              accept=".txt,.md,.json,.csv,.yaml,.yml,.pdf,.doc,.docx"
              onChange={e => e.target.files && handleFileUpload(e.target.files)}
            />
          </label>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Rule</DialogTitle>
                <DialogDescription>Define a custom rule entry</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Rule name" value={newRuleName} onChange={e => setNewRuleName(e.target.value)} />
                <Textarea placeholder="Description / policy text" value={newRuleDesc} onChange={e => setNewRuleDesc(e.target.value)} />
                <Input placeholder="Tags (comma separated)" value={newRuleTags} onChange={e => setNewRuleTags(e.target.value)} />
                <div className="flex justify-end">
                  <Button onClick={handleCreateRule} disabled={!newRuleName.trim()}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Rules</CardTitle>
          <CardDescription>Search, view and manage uploaded or created rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search rules..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-10">Loading rules...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">No rules yet. Upload a file or create your first rule.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((rule, idx) => (
                <Card key={rule._id || idx}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-medium">{rule.name}</div>
                        {rule.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">{rule.description}</div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {(rule.tags || []).map((t, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                        {rule.updatedAt && (
                          <div className="text-xs text-muted-foreground">Updated {new Date(rule.updatedAt).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
