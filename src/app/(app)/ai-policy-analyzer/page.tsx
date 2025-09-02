"use client";

import React from "react";
import { Brain, FileText, BookOpen, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AIPolicyAnalyzer() {
  const services = [
    {
      id: "policy-analyzer",
      title: "Policy Analyzer",
      description: "Analyze your organizational policies for compliance, clarity, and effectiveness using AI-powered insights.",
      icon: Brain,
      color: "bg-blue-500",
      href: "/ai-policy-analyzer/analyzer",
      features: [
        "Compliance checking",
        "Risk assessment", 
        "Gap analysis",
        "Recommendation engine"
      ]
    },
    {
      id: "policy-generator",
      title: "Policy Generator",
      description: "Generate comprehensive organizational policies tailored to your industry and requirements using AI.",
      icon: Sparkles,
      color: "bg-purple-500",
      href: "/ai-policy-analyzer/generator",
      features: [
        "Custom policy creation",
        "Industry templates",
        "Legal compliance",
        "Multi-format export"
      ]
    },
    {
      id: "knowledge-base",
      title: "Learn",
      description: "Access a comprehensive repository of policy templates, best practices, and regulatory guidelines.",
      icon: BookOpen,
      color: "bg-green-500", 
      href: "/learn",
      features: [
        "Policy templates",
        "Best practices",
        "Regulatory updates",
        "Industry standards"
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AI Policy Suite</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Comprehensive AI-powered tools for policy management, analysis, and generation.
        </p>
      </div>

      {/* Welcome Message */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Thursday, August 7
        </h2>
        <h3 className="text-2xl font-bold text-foreground">
          Good afternoon, Nandan K S
        </h3>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          
          return (
            <Card 
              key={service.id} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${service.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-sm text-foreground">Key Features:</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-3 w-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={service.href} className="block">
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats or Additional Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-primary mb-2">50+</div>
          <div className="text-sm text-muted-foreground">Policy Templates</div>
        </div>
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-primary mb-2">99%</div>
          <div className="text-sm text-muted-foreground">Compliance Accuracy</div>
        </div>
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-primary mb-2">24/7</div>
          <div className="text-sm text-muted-foreground">AI Assistance</div>
        </div>
      </div>
    </div>
  );
}
