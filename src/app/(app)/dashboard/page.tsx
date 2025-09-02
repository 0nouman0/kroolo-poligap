"use client";

import React from "react";
import { Shield, FileText, Upload, Bot, CheckCircle, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const features = [
    {
      title: "Upload any doc and does compliance check against all standards like HIPAA, NISP, GDPR, ISO...",
      description: "Comprehensive compliance analysis against multiple regulatory standards",
      icon: Shield,
      href: "/compliance-check",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      title: "Upload any doc and basis existing knowledge base, highlights key gaps / suggestions in the doc",
      description: "AI-powered document analysis with gap identification and improvement suggestions",
      icon: FileText,
      href: "/contract-review",
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
    },
    {
      title: "Check Kroolo, add a few legal agents",
      description: "Deploy specialized AI agents for automated legal and compliance tasks",
      icon: Bot,
      href: "/ai-agents",
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    }
  ];

  // Dynamic stats that will be calculated from actual data
  const [stats, setStats] = React.useState({
    documentsAnalyzed: 0,
    complianceIssues: 0,
    activeAgents: 0,
    tasksCompleted: 0
  });

  const quickStats = [
    { label: "Documents Analyzed", value: stats.documentsAnalyzed.toString(), change: "" },
    { label: "Compliance Issues Found", value: stats.complianceIssues.toString(), change: "" },
    { label: "Active AI Agents", value: stats.activeAgents.toString(), change: "" },
    { label: "Tasks Completed", value: stats.tasksCompleted.toString(), change: "" }
  ];

  return (
    <div className="w-full max-w-none p-6 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Check Kroolo
        </h1>
        <p className="text-lg text-muted-foreground">
          AI-powered legal compliance and contract analysis platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                {stat.change && (
                  <div className="text-sm text-green-600 font-medium">
                    {stat.change}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Key Features
        </h2>
        <div className="grid gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href={feature.href}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/compliance-check">
            <Button className="w-full h-16 flex flex-col gap-2">
              <Upload className="h-5 w-5" />
              <span>Upload Document</span>
            </Button>
          </Link>
          <Link href="/ai-agents">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
              <Plus className="h-5 w-5" />
              <span>Add AI Agent</span>
            </Button>
          </Link>
          <Link href="/my-tasks">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>View Tasks</span>
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" className="w-full h-16 flex flex-col gap-2">
              <Shield className="h-5 w-5" />
              <span>Manage Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest compliance checks and contract reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="p-4 rounded-full bg-muted/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Recent Activity</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by uploading documents for compliance checks or contract reviews
                </p>
                <div className="flex gap-2 justify-center">
                  <Link href="/compliance-check">
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </Link>
                  <Link href="/ai-agents">
                    <Button variant="outline" size="sm">
                      <Bot className="h-4 w-4 mr-2" />
                      Create AI Agent
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
