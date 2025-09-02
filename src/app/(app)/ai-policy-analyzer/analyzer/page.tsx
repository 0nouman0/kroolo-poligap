"use client";

import React, { useState } from "react";
import { Brain, Upload, FileText, AlertCircle, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface AnalysisResult {
  compliance: "high" | "medium" | "low";
  issues: Array<{
    type: "critical" | "warning" | "info";
    title: string;
    description: string;
    recommendation: string;
  }>;
  score: number;
  summary: string;
}

export default function PolicyAnalyzerTool() {
  const [policyText, setPolicyText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  const handleAnalyze = async () => {
    if (!policyText.trim()) {
      return;
    }

    setIsAnalyzing(true);
    setActiveTab("results");

    // Simulate API call - replace with actual API integration
    setTimeout(() => {
      // Mock analysis result
      const mockResult: AnalysisResult = {
        compliance: policyText.length > 500 ? "high" : policyText.length > 200 ? "medium" : "low",
        score: Math.floor(Math.random() * 40) + 60, // Score between 60-100
        summary: "The policy document has been analyzed for compliance, clarity, and completeness. Several recommendations have been identified to improve policy effectiveness.",
        issues: [
          {
            type: "critical",
            title: "Missing Data Retention Clause",
            description: "The policy lacks specific guidelines for data retention periods.",
            recommendation: "Add clear data retention periods for different types of data (e.g., 7 years for financial records, 3 years for employee data)."
          },
          {
            type: "warning", 
            title: "Vague Security Measures",
            description: "Security requirements are not detailed enough.",
            recommendation: "Specify technical security controls such as encryption standards, access controls, and monitoring requirements."
          },
          {
            type: "info",
            title: "Review Cycle Undefined",
            description: "No mention of policy review and update cycles.",
            recommendation: "Establish annual or bi-annual policy review cycles to ensure continued relevance and compliance."
          }
        ]
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getComplianceBadgeColor = (compliance: string) => {
    switch (compliance) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Link href="/ai-policy-analyzer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to AI Policy Suite
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Policy Analyzer</h1>
        </div>
        <p className="text-muted-foreground">
          Analyze your organizational policies for compliance, clarity, and effectiveness using AI-powered insights.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Policy Input</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Policy Document Input
              </CardTitle>
              <CardDescription>
                Paste your policy document text below or upload a file for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="policy-text" className="text-sm font-medium">
                  Policy Text
                </label>
                <Textarea
                  id="policy-text"
                  placeholder="Paste your policy document content here..."
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  className="min-h-[400px] resize-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!policyText.trim() || isAnalyzing}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Policy"}
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>Or drag and drop a file here</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {isAnalyzing ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Brain className="h-12 w-12 text-primary mx-auto animate-pulse" />
                  <div>
                    <h3 className="text-lg font-medium">Analyzing Policy...</h3>
                    <p className="text-muted-foreground">Our AI is reviewing your policy document</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : analysisResult ? (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Analysis Summary</CardTitle>
                    <div className="flex items-center gap-4">
                      <Badge className={getComplianceBadgeColor(analysisResult.compliance)}>
                        {analysisResult.compliance.toUpperCase()} COMPLIANCE
                      </Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{analysisResult.score}/100</div>
                        <div className="text-sm text-muted-foreground">Policy Score</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{analysisResult.summary}</p>
                </CardContent>
              </Card>

              {/* Issues and Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Issues and Recommendations</CardTitle>
                  <CardDescription>
                    Detailed analysis findings with actionable recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.issues.map((issue, index) => (
                    <Alert key={index} className={
                      issue.type === "critical" ? "border-red-200 bg-red-50" :
                      issue.type === "warning" ? "border-yellow-200 bg-yellow-50" :
                      "border-blue-200 bg-blue-50"
                    }>
                      <div className="flex items-start gap-3">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{issue.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {issue.type.toUpperCase()}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm">
                            <strong>Issue:</strong> {issue.description}
                          </AlertDescription>
                          <AlertDescription className="text-sm">
                            <strong>Recommendation:</strong> {issue.recommendation}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">No Analysis Yet</h3>
                    <p className="text-muted-foreground">
                      Go to Policy Input tab to analyze a document
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
