"use client";

import React, { useState } from "react";
import { Sparkles, ArrowLeft, Download, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function PolicyGenerator() {
  const [policyType, setPolicyType] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState("");

  const handleGenerate = async () => {
    if (!policyType || !industry) {
      return;
    }

    setIsGenerating(true);

    // Simulate API call - replace with actual API integration
    setTimeout(() => {
      const mockPolicy = `
# ${policyType} Policy

## 1. Purpose and Scope

This ${policyType.toLowerCase()} policy establishes guidelines and procedures for ${industry} organizations to ensure compliance with industry standards and regulatory requirements.

## 2. Policy Statement

[Company Name] is committed to maintaining the highest standards of ${policyType.toLowerCase()} practices across all operations.

## 3. Responsibilities

### 3.1 Management
- Ensure policy implementation and compliance
- Provide necessary resources for policy execution
- Review and update policy annually

### 3.2 Employees
- Understand and follow policy guidelines
- Report any violations or concerns
- Participate in required training programs

## 4. Procedures

### 4.1 Implementation
- All departments must implement these guidelines within 30 days
- Compliance monitoring will be conducted quarterly
- Training sessions will be provided to all staff

### 4.2 Compliance Monitoring
- Regular audits will be conducted
- Non-compliance will result in corrective actions
- Documentation of all compliance activities is required

## 5. Training and Awareness

- Initial training for all new employees
- Annual refresher training for existing staff
- Specialized training for managers and supervisors

## 6. Review and Updates

This policy will be reviewed annually and updated as necessary to reflect changes in:
- Industry regulations
- Business operations
- Best practices

## 7. Enforcement

Violations of this policy may result in:
- Verbal or written warnings
- Additional training requirements
- Disciplinary action up to and including termination

## 8. Contact Information

For questions or concerns regarding this policy, contact:
- Policy Administrator: [Contact Information]
- HR Department: [Contact Information]
- Legal Department: [Contact Information]

---

*This policy was generated using AI and should be reviewed by legal counsel before implementation.*
      `.trim();

      setGeneratedPolicy(mockPolicy);
      setIsGenerating(false);
    }, 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPolicy);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedPolicy], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policyType}-policy.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Policy Generator</h1>
        </div>
        <p className="text-muted-foreground">
          Generate comprehensive organizational policies tailored to your industry and requirements using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Configuration</CardTitle>
            <CardDescription>
              Provide details about the policy you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="policy-type">Policy Type *</Label>
              <Select value={policyType} onValueChange={setPolicyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Data Privacy">Data Privacy</SelectItem>
                  <SelectItem value="Information Security">Information Security</SelectItem>
                  <SelectItem value="Code of Conduct">Code of Conduct</SelectItem>
                  <SelectItem value="Remote Work">Remote Work</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Anti-Harassment">Anti-Harassment</SelectItem>
                  <SelectItem value="Expense Management">Expense Management</SelectItem>
                  <SelectItem value="Leave Policy">Leave Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-size">Company Size</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-1000">201-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Specific Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Enter any specific requirements or guidelines you want included in the policy..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!policyType || !industry || isGenerating}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating Policy..." : "Generate Policy"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Policy</CardTitle>
                <CardDescription>
                  AI-generated policy based on your specifications
                </CardDescription>
              </div>
              {generatedPolicy && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin" />
                  <div>
                    <h3 className="text-lg font-medium">Generating Policy...</h3>
                    <p className="text-muted-foreground">AI is creating your custom policy</p>
                  </div>
                </div>
              </div>
            ) : generatedPolicy ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedPolicy}
                  onChange={(e) => setGeneratedPolicy(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Generated policy will appear here..."
                />
                <div className="text-xs text-muted-foreground">
                  * This policy was generated using AI. Please review and customize as needed before implementation.
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Ready to Generate</h3>
                    <p className="text-muted-foreground">
                      Fill in the policy details and click Generate Policy
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
