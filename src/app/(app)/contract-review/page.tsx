"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText, Upload, Eye, Download, AlertTriangle, CheckCircle, Clock, User, ChevronRight, ChevronLeft, Building, Users, Shield, Handshake, Award, Home, TrendingUp, Car, ShoppingCart, Truck, Crown, Network, Search, Filter, Briefcase, Globe, Heart, Zap, Wifi, Database, Code, Palette, Music, Camera, Plane, Ship, Factory, Hammer, Wrench, Cog, Book, GraduationCap, Stethoscope, Scale, Gavel, DollarSign, CreditCard, PiggyBank, Landmark, Info, FolderOpen, BookOpen, Library, Edit3, RotateCcw, Save, X, NotebookPen, FileUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AssetPicker } from "@/components/AssetPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
<<<<<<< Updated upstream
import { Switch } from "@/components/ui/switch";
=======
import { extractTextFromPdf } from "@/lib/pdf";
import { diff_match_patch, DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL } from "diff-match-patch";
>>>>>>> Stashed changes

interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  sections: TemplateSection[];
  lastUpdated: string;
  isBaseline: boolean;
  sources: string[];
}

interface TemplateSection {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
  priority: "critical" | "high" | "medium" | "low";
  guidelines: string[];
}

interface DocumentGap {
  id: string;
  sectionTitle: string;
  gapType: "missing" | "weak" | "incomplete" | "non-compliant";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  recommendation: string;
  startIndex: number;
  endIndex: number;
  originalText?: string;
  suggestedText?: string;
}

interface ExtractedDocument {
  id: string;
  fileName: string;
  fullText: string;
  sections: DocumentSection[];
  gaps: DocumentGap[];
  overallScore: number;
  templateId: string;
}

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
  hasGaps: boolean;
  gapIds: string[];
}

interface ContractReview {
  id: string;
  fileName: string;
  contractType: string;
  status: "pending" | "in-review" | "completed" | "requires-attention";
  riskLevel: "low" | "medium" | "high";
  score: number;
  gaps: string[];
  suggestions: string[];
  reviewer: string;
  uploadDate: string;
  reviewDate?: string;
}

// Dynamic reviews will be loaded from API or user uploads
const initialReviews: ContractReview[] = [];

// Mock knowledge base templates
const knowledgeBaseTemplates: ContractTemplate[] = [
  {
    id: "service-agreement",
    name: "Service Agreement Template",
    type: "service",
    description: "Baseline template for service agreements with all required clauses",
    sections: [
      {
        id: "parties",
        title: "Parties",
        content: "This Agreement is entered between [Company Name] and [Service Provider]",
        isRequired: true,
        priority: "critical",
        guidelines: ["Must clearly identify all parties", "Include legal entity names and addresses"]
      },
      {
        id: "scope",
        title: "Scope of Services",
        content: "Detailed description of services to be provided",
        isRequired: true,
        priority: "critical",
        guidelines: ["Must be specific and measurable", "Include deliverables and timelines"]
      },
      {
        id: "payment",
        title: "Payment Terms",
        content: "Payment schedule, amounts, and terms",
        isRequired: true,
        priority: "high",
        guidelines: ["Clear payment schedule", "Late payment penalties", "Currency specification"]
      },
      {
        id: "termination",
        title: "Termination Clause",
        content: "Conditions under which agreement can be terminated",
        isRequired: true,
        priority: "high",
        guidelines: ["Notice period requirements", "Termination for cause", "Post-termination obligations"]
      },
      {
        id: "liability",
        title: "Limitation of Liability",
        content: "Liability limitations and indemnification clauses",
        isRequired: true,
        priority: "critical",
        guidelines: ["Cap on damages", "Mutual indemnification", "Insurance requirements"]
      }
    ],
    lastUpdated: "2024-01-15",
    isBaseline: true,
    sources: ["Internal Legal KB", "Law Insider"]
  },
  { id: "msa", name: "Master Services Agreement", type: "service", description: "Standard MSA with SOWs", sections: [
      { id: "msa-def", title: "Definitions", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "msa-scope", title: "Scope of Services", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "msa-fees", title: "Fees & Payment", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "msa-term", title: "Term & Termination", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "msa-liability", title: "Limitation of Liability", content: "", isRequired: true, priority: "critical", guidelines: [] }
    ], lastUpdated: "2024-02-10", isBaseline: true, sources: ["Internal Legal KB", "Law Insider"] },
  { id: "sow", name: "Statement of Work (SOW)", type: "service", description: "Detailed work scope", sections: [
      { id: "sow-deliverables", title: "Deliverables", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "sow-milestones", title: "Milestones", content: "", isRequired: false, priority: "medium", guidelines: [] },
      { id: "sow-acceptance", title: "Acceptance Criteria", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-03-12", isBaseline: false, sources: ["Internal Legal KB"] },
  { id: "nda-mutual", name: "Mutual NDA", type: "legal", description: "Mutual confidentiality obligations", sections: [
      { id: "nda-def", title: "Definitions", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "nda-conf", title: "Confidential Information", content: "", isRequired: true, priority: "critical", guidelines: [] },
      { id: "nda-term", title: "Term", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "nda-excl", title: "Exclusions", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "nda-rem", title: "Remedies", content: "", isRequired: false, priority: "low", guidelines: [] }
    ], lastUpdated: "2024-01-28", isBaseline: true, sources: ["Cornell LII", "Law Insider"] },
  { id: "nda-oneway", name: "One-way NDA", type: "legal", description: "Disclosing party protections", sections: [
      { id: "ondadef", title: "Definitions", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "ondarecip", title: "Recipient Obligations", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "ondaterm", title: "Term & Return", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2023-12-05", isBaseline: false, sources: ["Cornell LII"] },
  { id: "dpa", name: "Data Processing Addendum", type: "technology", description: "GDPR/CCPA aligned DPA", sections: [
      { id: "dpa-roles", title: "Roles & Responsibilities", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "dpa-security", title: "Security Measures", content: "", isRequired: true, priority: "critical", guidelines: [] },
      { id: "dpa-sub", title: "Subprocessors", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "dpa-xfer", title: "Data Transfers", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "dpa-breach", title: "Breach Notification", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-04-02", isBaseline: true, sources: ["EDPB", "ICO"] },
  { id: "sla", name: "Service Level Agreement", type: "technology", description: "Uptime and remedies", sections: [
      { id: "sla-uptime", title: "Uptime Commitment", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "sla-credits", title: "Service Credits", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "sla-support", title: "Support Tiers", content: "", isRequired: false, priority: "low", guidelines: [] }
    ], lastUpdated: "2024-03-20", isBaseline: true, sources: ["Internal Legal KB"] },
  { id: "eula", name: "End User License Agreement", type: "technology", description: "Software licensing terms", sections: [
      { id: "eula-license", title: "License Grant", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "eula-restrict", title: "Restrictions", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "eula-warranty", title: "Disclaimer/Warranty", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-01-06", isBaseline: false, sources: ["Open Source Templates", "Law Insider"] },
  { id: "reseller", name: "Reseller Agreement", type: "commercial", description: "Channel partner terms", sections: [
      { id: "reseller-territory", title: "Territory", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "reseller-targets", title: "Sales Targets", content: "", isRequired: false, priority: "low", guidelines: [] },
      { id: "reseller-brand", title: "Branding & Compliance", content: "", isRequired: false, priority: "low", guidelines: [] }
    ], lastUpdated: "2024-02-14", isBaseline: false, sources: ["Law Insider"] },
  { id: "distribution", name: "Distribution Agreement", type: "commercial", description: "Territories and quotas", sections: [
      { id: "dist-territory", title: "Territory & Exclusivity", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "dist-min", title: "Minimum Commitments", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-03-01", isBaseline: false, sources: ["Law Insider"] },
  { id: "license-ip", name: "IP License Agreement", type: "legal", description: "Scope and exclusivity", sections: [
      { id: "ip-scope", title: "Scope of License", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "ip-royalty", title: "Royalties", content: "", isRequired: false, priority: "low", guidelines: [] }
    ], lastUpdated: "2024-01-19", isBaseline: true, sources: ["WIPO", "Law Insider"] },
  { id: "subprocessing", name: "Sub-processor Agreement", type: "technology", description: "Downstream obligations", sections: [
      { id: "sub-contract", title: "Contractual Flowdown", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-02-27", isBaseline: false, sources: ["EDPB"] },
  { id: "consulting", name: "Consulting Agreement", type: "business", description: "Advisory scope and fees", sections: [
      { id: "consult-scope", title: "Scope", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "consult-fees", title: "Fees", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-02-08", isBaseline: false, sources: ["Internal Legal KB"] },
  { id: "employment", name: "Employment Agreement", type: "legal", description: "Employee terms and IP", sections: [
      { id: "emp-role", title: "Role & Duties", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "emp-comp", title: "Compensation", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "emp-ip", title: "IP Assignment", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-03-11", isBaseline: true, sources: ["SHRM", "Law Insider"] },
  { id: "contractor", name: "Independent Contractor", type: "legal", description: "Contractor engagement terms", sections: [
      { id: "ctr-scope", title: "Scope", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "ctr-ip", title: "IP & Ownership", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-03-05", isBaseline: true, sources: ["SHRM"] },
  { id: "partners", name: "Partnership Agreement", type: "business", description: "Governance and capital", sections: [
      { id: "part-cap", title: "Capital Contributions", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "part-govern", title: "Governance", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-02-01", isBaseline: false, sources: ["Law Insider"] },
  { id: "jv", name: "Joint Venture Agreement", type: "business", description: "JV structure and exits", sections: [
      { id: "jv-structure", title: "Structure", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-01-30", isBaseline: false, sources: ["Law Insider"] },
  { id: "franchise", name: "Franchise Agreement", type: "business", description: "Franchise operations", sections: [
      { id: "fran-fees", title: "Fees", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-01-22", isBaseline: false, sources: ["FTC Franchise Guide"] },
  { id: "lease-commercial", name: "Commercial Lease", type: "property", description: "Premises and rent", sections: [
      { id: "lease-term", title: "Term", content: "", isRequired: true, priority: "medium", guidelines: [] },
      { id: "lease-rent", title: "Rent & Escalation", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-03-25", isBaseline: true, sources: ["Law Insider"] },
  { id: "lease-equipment", name: "Equipment Lease", type: "property", description: "Equipment rental terms", sections: [
      { id: "el-term", title: "Term & Ownership", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-01-18", isBaseline: false, sources: ["Law Insider"] },
  { id: "purchase", name: "Purchase Agreement", type: "commercial", description: "Sale of goods terms", sections: [
      { id: "po-goods", title: "Goods & Delivery", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "po-inspect", title: "Inspection & Acceptance", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-02-21", isBaseline: true, sources: ["UCC", "Law Insider"] },
  { id: "supply", name: "Supply Agreement", type: "commercial", description: "Supply commitments", sections: [
      { id: "supply-forecast", title: "Forecast & Orders", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-02-26", isBaseline: false, sources: ["Law Insider"] },
  { id: "manufacturing", name: "Manufacturing Agreement", type: "commercial", description: "Production and quality", sections: [
      { id: "mfg-quality", title: "Quality & Audits", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-03-02", isBaseline: false, sources: ["ISO", "Law Insider"] },
  { id: "maintenance", name: "Maintenance Agreement", type: "service", description: "Support and repairs", sections: [
      { id: "maint-scope", title: "Scope & SLAs", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-03-08", isBaseline: false, sources: ["Internal Legal KB"] },
  { id: "warranty", name: "Warranty Agreement", type: "commercial", description: "Warranty scope/limits", sections: [
      { id: "warr-scope", title: "Scope & Duration", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-01-26", isBaseline: false, sources: ["Manufacturing Templates"] },
  { id: "software-license", name: "Software License", type: "technology", description: "On-prem license terms", sections: [
      { id: "swl-grant", title: "Grant & Restrictions", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-02-02", isBaseline: true, sources: ["Open Source Templates", "Law Insider"] },
  { id: "saas", name: "SaaS Subscription", type: "technology", description: "Cloud subscription terms", sections: [
      { id: "saas-sub", title: "Subscription & Term", content: "", isRequired: true, priority: "high", guidelines: [] },
      { id: "saas-data", title: "Data & Privacy", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-02-12", isBaseline: true, sources: ["Internal Legal KB"] },
  { id: "hosting", name: "Hosting Agreement", type: "technology", description: "Hosting obligations", sections: [
      { id: "host-availability", title: "Availability & Support", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-02-18", isBaseline: false, sources: ["Internal Legal KB"] },
  { id: "api", name: "API Terms", type: "technology", description: "API usage and limits", sections: [
      { id: "api-keys", title: "API Keys & Limits", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-02-24", isBaseline: false, sources: ["Developer Docs Samples"] },
  { id: "privacy", name: "Privacy Policy", type: "legal", description: "Data privacy disclosures", sections: [
      { id: "pp-collect", title: "Collection & Use", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-03-14", isBaseline: true, sources: ["ICO", "OECD"] },
  { id: "terms", name: "Terms of Service", type: "legal", description: "Website/app terms", sections: [
      { id: "tos-use", title: "Acceptable Use", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-03-19", isBaseline: true, sources: ["Internal Legal KB"] },
  { id: "affiliate", name: "Affiliate Agreement", type: "commercial", description: "Affiliate payouts", sections: [
      { id: "aff-payouts", title: "Payouts & Tracking", content: "", isRequired: false, priority: "low", guidelines: [] }
    ], lastUpdated: "2024-03-23", isBaseline: false, sources: ["Marketing Templates"] },
  { id: "influencer", name: "Influencer Agreement", type: "commercial", description: "Creator campaigns", sections: [
      { id: "inf-deliverables", title: "Deliverables & IP", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-03-28", isBaseline: false, sources: ["Marketing Templates"] },
  { id: "sponsorship", name: "Sponsorship Agreement", type: "commercial", description: "Event sponsorship", sections: [
      { id: "spon-rights", title: "Sponsorship Rights", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-04-03", isBaseline: false, sources: ["Event Templates"] },
  { id: "merger", name: "Merger Agreement", type: "business", description: "M&A transaction doc", sections: [
      { id: "mna-reps", title: "Reps & Warranties", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-04-06", isBaseline: false, sources: ["ABA Model Docs"] },
  { id: "asset-sale", name: "Asset Purchase Agreement", type: "business", description: "Asset transfer terms", sections: [
      { id: "apa-assets", title: "Assets & Liabilities", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-04-09", isBaseline: false, sources: ["ABA Model Docs"] },
  { id: "shareholders", name: "Shareholders Agreement", type: "business", description: "Shareholder rights", sections: [
      { id: "sha-rights", title: "Rights & Restrictions", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-04-12", isBaseline: true, sources: ["Internal Legal KB"] },
  { id: "bylaws", name: "Company Bylaws", type: "business", description: "Corporate governance", sections: [
      { id: "bylaws-board", title: "Board & Meetings", content: "", isRequired: true, priority: "medium", guidelines: [] }
    ], lastUpdated: "2024-04-15", isBaseline: false, sources: ["Internal Legal KB"] },
  { id: "gdpr", name: "GDPR Addendum", type: "technology", description: "EU data compliance", sections: [
      { id: "gdpr-basis", title: "Legal Basis", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-04-18", isBaseline: true, sources: ["EDPB", "ICO"] },
  { id: "hipaa", name: "HIPAA BAA", type: "healthcare", description: "Protected health info", sections: [
      { id: "hipaa-safeguards", title: "Safeguards & PHI", content: "", isRequired: true, priority: "high", guidelines: [] }
    ], lastUpdated: "2024-04-20", isBaseline: true, sources: ["HHS"] }
];

// Severity color configuration
const severityConfig = {
  critical: {
    bg: "bg-red-100 dark:bg-red-950",
    border: "border-red-300 dark:border-red-700",
    text: "text-red-900 dark:text-red-100",
    highlight: "bg-red-500"
  },
  high: {
    bg: "bg-orange-100 dark:bg-orange-950",
    border: "border-orange-300 dark:border-orange-700",
    text: "text-orange-900 dark:text-orange-100",
    highlight: "bg-orange-500"
  },
  medium: {
    bg: "bg-yellow-100 dark:bg-yellow-950",
    border: "border-yellow-300 dark:border-yellow-700",
    text: "text-yellow-900 dark:text-yellow-100",
    highlight: "bg-yellow-500"
  },
  low: {
    bg: "bg-blue-100 dark:bg-blue-950",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-900 dark:text-blue-100",
    highlight: "bg-blue-500"
  }
};

export default function ContractReview() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [extractedDocument, setExtractedDocument] = useState<ExtractedDocument | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editedText, setEditedText] = useState("");
  // Preserve the original extracted text; do not mutate it. Build edits separately
  const [originalExtractedText, setOriginalExtractedText] = useState<string>("");
  // Track per-gap decision: pending | accepted | rejected
  const [patchStates, setPatchStates] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({});
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [reviews, setReviews] = useState<ContractReview[]>(initialReviews);
  const [selectedContractTypes, setSelectedContractTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // New: template boilerplate mode and custom template upload state
  const [templateMode, setTemplateMode] = useState<'standard' | 'knowledge'>('standard');
  const [customTemplateName, setCustomTemplateName] = useState<string>("");
  // New: allow free-form custom template text via notepad
  const [customTemplateText, setCustomTemplateText] = useState<string>("");
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const extractedTextRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
<<<<<<< Updated upstream
  const [applyRuleBase, setApplyRuleBase] = useState(false);
=======
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);
  const [currentGapIndex, setCurrentGapIndex] = useState(0);
>>>>>>> Stashed changes
  
  // Audit logs state for selected template
  const [templateLogs, setTemplateLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  
  const templatesContainerRef = useRef<HTMLDivElement>(null);
  // Track any ongoing analysis timer to allow cleanup/cancel
  const analyzeTimerRef = useRef<number | null>(null);

  const scrollTemplates = (direction: 'left' | 'right') => {
    const el = templatesContainerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // New: custom template upload handler for Knowledge Base Templates mode
  const handleCustomTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomTemplateName(file.name);
    }
  };

  // Drag & Drop handlers for custom template
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCustomTemplateName(file.name);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const openFilePicker = () => fileInputRef.current?.click();

  // Generate gaps from extracted text using heuristics
  const generateGapsFromText = (text: string, template: ContractTemplate | null): DocumentGap[] => {
    const gaps: DocumentGap[] = [];
    const lowerText = text.toLowerCase();
    
    // Check for missing parties details
    if (lowerText.includes('abc corp') || lowerText.includes('xyz services') || !lowerText.match(/\b\w+\s+corp\b|\b\w+\s+llc\b|\b\w+\s+inc\b/)) {
      gaps.push({
        id: "gap-parties",
        sectionTitle: "Parties",
        gapType: "incomplete",
        severity: "high",
        description: "Missing legal entity details and addresses",
        recommendation: "Include full legal names, addresses, and entity types",
        startIndex: text.indexOf("between") || 0,
        endIndex: text.indexOf("between") + 50 || 50,
        originalText: "Generic party names",
        suggestedText: "[Full Legal Name], a [State] [Entity Type], with its principal place of business at [Address]"
      });
    }

    // Check for vague scope
    if (lowerText.includes('as needed') || lowerText.includes('consulting services') && !lowerText.includes('deliverable')) {
      gaps.push({
        id: "gap-scope",
        sectionTitle: "Scope of Services",
        gapType: "weak",
        severity: "critical",
        description: "Vague scope definition lacks specificity",
        recommendation: "Define specific deliverables, timelines, and success criteria",
        startIndex: text.indexOf("scope") || text.indexOf("services") || 0,
        endIndex: (text.indexOf("scope") || text.indexOf("services") || 0) + 100,
        originalText: "consulting services as needed",
        suggestedText: "Provider shall deliver the following specific services: [List detailed deliverables with timelines and acceptance criteria]"
      });
    }

    // Check for missing liability limitation
    if (!lowerText.includes('limitation of liability') && !lowerText.includes('liable')) {
      gaps.push({
        id: "gap-liability",
        sectionTitle: "Limitation of Liability",
        gapType: "missing",
        severity: "critical",
        description: "Missing liability limitation clause",
        recommendation: "Add comprehensive liability limitation and indemnification clause",
        startIndex: -1,
        endIndex: -1,
        suggestedText: "IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, OR USE, INCURRED BY EITHER PARTY OR ANY THIRD PARTY."
      });
    }

    return gaps;
  };

  // Fetch audit logs helper and effect on template change
  const reloadTemplateLogs = async () => {
    if (!selectedTemplate) {
      setTemplateLogs([]);
      return;
    }
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await fetch(`/api/template-audit-logs?templateId=${encodeURIComponent(selectedTemplate.id)}&limit=20`);
      const data = await res.json();
      if (data?.success) {
        setTemplateLogs(data.logs || []);
      } else {
        setLogsError(data?.error || 'Failed to load logs');
      }
    } catch (err) {
      setLogsError('Failed to load logs');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    reloadTemplateLogs();
  }, [selectedTemplate]);

  // Cleanup on unmount: clear any pending timers and reset analyzing flag
  useEffect(() => {
    return () => {
      if (analyzeTimerRef.current) {
        clearTimeout(analyzeTimerRef.current);
        analyzeTimerRef.current = null;
      }
    };
  }, []);

  // Clear any ongoing analysis when navigating away from Step 4
  useEffect(() => {
    if (currentStep !== 4) {
      if (analyzeTimerRef.current) {
        clearTimeout(analyzeTimerRef.current);
        analyzeTimerRef.current = null;
      }
      // Always reset analyzing state when leaving Step 4 to prevent stuck UI
      setIsAnalyzing(false);
    }
  }, [currentStep]);

  // Keep editedText in sync with patchStates changes defensively
  useEffect(() => {
    if (!extractedDocument) return;
    const base = originalExtractedText || extractedDocument.fullText;
    const next = applyAcceptedGaps(base, extractedDocument.gaps, patchStates);
    setEditedText(next);
  }, [patchStates, extractedDocument]);


  const contractTypes = [
    // Business Contracts
    { id: "vendor", name: "Vendor Agreement", icon: Building, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    { id: "partnership", name: "Partnership Agreement", icon: Network, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    { id: "consulting", name: "Consulting Agreement", icon: TrendingUp, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" },
    { id: "franchise", name: "Franchise Agreement", icon: Crown, color: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300" },
    { id: "joint-venture", name: "Joint Venture Agreement", icon: Handshake, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
    { id: "merger", name: "Merger Agreement", icon: Briefcase, color: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300" },
    { id: "acquisition", name: "Acquisition Agreement", icon: Building, color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300" },
    { id: "outsourcing", name: "Outsourcing Agreement", icon: Globe, color: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300" },
    { id: "supply-chain", name: "Supply Chain Agreement", icon: Truck, color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
    { id: "manufacturing", name: "Manufacturing Agreement", icon: Factory, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },

    // Legal Contracts
    { id: "employment", name: "Employment Contract", icon: Users, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    { id: "nda", name: "Non-Disclosure Agreement", icon: Shield, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
    { id: "license", name: "License Agreement", icon: Award, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    { id: "confidentiality", name: "Confidentiality Agreement", icon: Shield, color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300" },
    { id: "non-compete", name: "Non-Compete Agreement", icon: Scale, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    { id: "settlement", name: "Settlement Agreement", icon: Gavel, color: "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-300" },
    { id: "arbitration", name: "Arbitration Agreement", icon: Scale, color: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-300" },
    { id: "power-attorney", name: "Power of Attorney", icon: Gavel, color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300" },

    // Property & Real Estate
    { id: "lease", name: "Lease Agreement", icon: Home, color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300" },
    { id: "rental", name: "Rental Agreement", icon: Home, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300" },
    { id: "property-sale", name: "Property Sale Agreement", icon: Home, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
    { id: "mortgage", name: "Mortgage Agreement", icon: Landmark, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    { id: "construction", name: "Construction Contract", icon: Hammer, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    { id: "maintenance", name: "Maintenance Agreement", icon: Wrench, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },

    // Commercial & Sales
    { id: "service", name: "Service Agreement", icon: Handshake, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    { id: "purchase", name: "Purchase Agreement", icon: ShoppingCart, color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300" },
    { id: "distribution", name: "Distribution Agreement", icon: Truck, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300" },
    { id: "sales", name: "Sales Agreement", icon: DollarSign, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    { id: "subscription", name: "Subscription Agreement", icon: CreditCard, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    { id: "warranty", name: "Warranty Agreement", icon: Shield, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },

    // Technology & IP
    { id: "software", name: "Software License Agreement", icon: Code, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" },
    { id: "saas", name: "SaaS Agreement", icon: Wifi, color: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300" },
    { id: "data-processing", name: "Data Processing Agreement", icon: Database, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    { id: "hosting", name: "Hosting Agreement", icon: Zap, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    { id: "development", name: "Development Agreement", icon: Code, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    { id: "api", name: "API Agreement", icon: Cog, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },

    // Specialized Services
    { id: "healthcare", name: "Healthcare Service Agreement", icon: Heart, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
    { id: "education", name: "Education Service Agreement", icon: GraduationCap, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    { id: "transportation", name: "Transportation Agreement", icon: Car, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    { id: "logistics", name: "Logistics Agreement", icon: Plane, color: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300" },
    { id: "insurance", name: "Insurance Agreement", icon: Shield, color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300" },
    { id: "financial", name: "Financial Services Agreement", icon: PiggyBank, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Helper: apply all accepted gaps to original text to compute proposed text
  const applyAcceptedGaps = (base: string, gaps: DocumentGap[], states: Record<string, 'pending' | 'accepted' | 'rejected'>) => {
    // Apply in reverse order of indices so slicing remains valid
    let updated = base;
    const ordered = [...gaps]
      .filter(g => states[g.id] === 'accepted' && g.suggestedText)
      .sort((a, b) => (a.startIndex ?? -1) - (b.startIndex ?? -1));
    for (let i = ordered.length - 1; i >= 0; i--) {
      const gap = ordered[i];
      if (!gap) continue;
      if (gap.startIndex >= 0 && gap.endIndex >= gap.startIndex) {
        const before = updated.substring(0, gap.startIndex);
        const after = updated.substring(gap.endIndex);
        updated = `${before}${gap.suggestedText}${after}`;
      } else {
        const sep = updated.endsWith("\n") ? "\n\n" : "\n\n";
        updated = `${updated}${sep}${gap.suggestedText}`;
      }
    }
    return updated;
  };

  // Accept a single gap suggestion (does not mutate original extracted text)
  const applyGapSuggestion = (gap: DocumentGap) => {
    if (!extractedDocument) return;
    setPatchStates(prev => {
      const next = { ...prev, [gap.id]: 'accepted' };
      const nextText = applyAcceptedGaps(originalExtractedText || extractedDocument.fullText, extractedDocument.gaps, next);
      setEditedText(nextText);
      return next;
    });
  };

  // Helpers: set/toggle gap state dynamically and keep editedText in sync
  const setGapState = (gapId: string, state: 'pending' | 'accepted' | 'rejected') => {
    if (!extractedDocument) return;
    setPatchStates((ps: Record<string, 'pending' | 'accepted' | 'rejected'>) => {
      const next: Record<string, 'pending' | 'accepted' | 'rejected'> = { ...ps, [gapId]: state };
      const base = originalExtractedText || extractedDocument.fullText;
      const nextText = applyAcceptedGaps(base, extractedDocument.gaps, next);
      setEditedText(nextText);
      return next;
    });
  };

  const toggleAccept = (gap: DocumentGap) => {
    const current = patchStates[gap.id] || 'pending';
    setGapState(gap.id, current === 'accepted' ? 'pending' : 'accepted');
  };

  const toggleReject = (gap: DocumentGap) => {
    const current = patchStates[gap.id] || 'pending';
    setGapState(gap.id, current === 'rejected' ? 'pending' : 'rejected');
  };

  // Render fullText with inline diffs per gap; shows insertions (green) and deletions (red)
  const highlightGaps = (fullText: string, gaps: DocumentGap[]) => {
    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    if (!gaps || gaps.length === 0) {
      return escapeHtml(fullText).replace(/\n/g, "<br/>");
    }

    const dmp = new diff_match_patch();
    const states = patchStates;
    const sorted = [...gaps]
      .filter(g => g.startIndex >= 0 && g.endIndex >= g.startIndex)
      .sort((a, b) => a.startIndex - b.startIndex);

    let cursor = 0;
    let html = "";
    // Always render from original text (do not mutate). Fallback to param.
    const baseText = originalExtractedText || fullText;
    const safe = escapeHtml(baseText);

    for (const g of sorted) {
      const start = Math.max(0, Math.min(g.startIndex, fullText.length));
      const end = Math.max(start, Math.min(g.endIndex, fullText.length));
      // Append non-highlighted segment
      html += safe.substring(cursor, start).replace(/\n/g, "<br/>");
      // Segment to render
      const originalSeg = baseText.substring(start, end);
      const status = states[g.id] || 'pending';
      let inner = "";
      if (status === 'accepted' && g.suggestedText) {
        // Accepted: show suggested text plainly (no green/red highlights)
        inner = escapeHtml(g.suggestedText).replace(/\n/g, "<br/>");
      } else if (status === 'rejected') {
        // Rejected: show original text plainly
        inner = escapeHtml(originalSeg).replace(/\n/g, "<br/>");
      } else {
        // Pending: show inline diffs (green insertions, red deletions)
        if (g.suggestedText) {
          const diffs = dmp.diff_main(originalSeg, g.suggestedText);
          dmp.diff_cleanupSemantic(diffs);
          for (const [op, data] of diffs as any) {
            const safeData = escapeHtml(String(data)).replace(/\n/g, "<br/>");
            if (op === DIFF_EQUAL) inner += `<span>${safeData}</span>`;
            else if (op === DIFF_DELETE) inner += `<span class="bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-200 line-through">${safeData}</span>`;
            else if (op === DIFF_INSERT) inner += `<span class="bg-green-200 dark:bg-green-900/60 text-green-900 dark:text-green-200 underline decoration-green-600">${safeData}</span>`;
          }
        } else {
          inner = escapeHtml(originalSeg).replace(/\n/g, "<br/>");
        }
      }
      // Only ring while pending to draw attention; no ring when resolved
      const ring = status === 'pending' ? 'ring-1 ring-primary/40' : '';
      html += `<span class="px-1 rounded transition-all duration-200 ${ring}" data-gap-id="${g.id}" title="${escapeHtml(g.sectionTitle)}: ${escapeHtml(g.description)}">${inner}</span>`;
      cursor = end;
    }
    // Append remaining tail
    html += safe.substring(cursor).replace(/\n/g, "<br/>");

    // Append any missing-clause suggestions at the end for visibility
    const missing = gaps.filter(g => g.startIndex < 0 || g.endIndex < 0);
    if (missing.length) {
      html += '<div class="mt-4 p-3 border rounded bg-muted">';
      html += '<div class="font-bold mb-2">Missing Clauses</div>';
      for (const m of missing) {
        const sev = m.severity;
        const color = sev === 'critical' ? 'text-red-700' : sev === 'high' ? 'text-orange-700' : sev === 'medium' ? 'text-amber-700' : 'text-blue-700';
        const status = (patchStates[m.id] || 'pending');
        const badge = status === 'accepted' ? '<span class="ml-2 text-xs text-green-700">(accepted)</span>' : status === 'rejected' ? '<span class="ml-2 text-xs text-red-700">(rejected)</span>' : '';
        html += `<div class="text-sm ${color}"><strong>${escapeHtml(m.sectionTitle)}</strong>: ${escapeHtml(m.description)}${badge}</div>`;
      }
      html += '</div>';
    }

    return html;
  };

  // Save on Step 4 and generate results -> triggers analyze flow
  const handleSaveDocument = () => {
    if (isAnalyzing) return;
    void handleAnalyze();
  };

  // Scroll to highlighted gap in extracted text
  const scrollToGap = (gap: DocumentGap) => {
    if (!extractedTextRef.current || gap.startIndex < 0) return;
    
    const gapElement = extractedTextRef.current.querySelector(`[data-gap-id="${gap.id}"]`);
    if (gapElement) {
      gapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary highlight effect
      gapElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
      setTimeout(() => {
        gapElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
      }, 2000);
    }
  };

  // Navigate between gaps with keyboard shortcuts
  const navigateToGap = (direction: 'next' | 'prev') => {
    if (!extractedDocument || extractedDocument.gaps.length === 0) return;
    
    const gaps = extractedDocument.gaps.filter(g => g.startIndex >= 0);
    if (gaps.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentGapIndex >= gaps.length - 1 ? 0 : currentGapIndex + 1;
    } else {
      newIndex = currentGapIndex <= 0 ? gaps.length - 1 : currentGapIndex - 1;
    }
    
    setCurrentGapIndex(newIndex);
    scrollToGap(gaps[newIndex]);
  };

  // Export reviewed contract
  const exportContract = () => {
    if (!extractedDocument) return;
    
    // Export the selectively edited text (accepted patches applied)
    const content = editedText || extractedDocument.fullText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviewed_${extractedDocument.fileName.replace('.pdf', '.txt')}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Undo last applied fix
  const undoLastFix = () => {
    if (appliedFixes.length === 0 || !extractedDocument) return;
    
    // For simplicity, we'll reload from the original extracted text
    // In a production app, you'd maintain a proper history stack
    const lastFixId = appliedFixes[appliedFixes.length - 1];
    setAppliedFixes(prev => prev.slice(0, -1));
    
    // Show feedback
    console.log(`Undoing fix: ${lastFixId}`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!extractedDocument || currentStep !== 4) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            navigateToGap('next');
            break;
          case 'ArrowUp':
            e.preventDefault();
            navigateToGap('prev');
            break;
          case 's':
            e.preventDefault();
            exportContract();
            break;
          case 'z':
            e.preventDefault();
            undoLastFix();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [extractedDocument, currentStep, currentGapIndex]);

  // Apply all suggestions (mark as accepted) without mutating original extracted text
  const acceptAllSuggestions = () => {
    if (!extractedDocument) return;
    const allAccepted: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
    for (const g of extractedDocument.gaps) allAccepted[g.id] = 'accepted';
    setPatchStates(allAccepted);
    const nextText = applyAcceptedGaps(originalExtractedText || extractedDocument.fullText, extractedDocument.gaps, allAccepted);
    setEditedText(nextText);
  };

  const handleAssetSelect = (asset: any) => {
    // Convert asset to File-like object for consistency with file upload
    const mockFile = {
      name: asset.name,
      size: asset.size || 0,
      type: asset.type || 'application/pdf',
      lastModified: asset.lastModified || Date.now()
    } as File;
    
    setUploadedFile(mockFile);
    setIsAssetPickerOpen(false);
  };

  const steps = [
    { id: 1, title: "Select Template", description: "Choose a baseline template from knowledge base" },
    { id: 2, title: "Template Boilerplate", description: "Review format or provide your own template" },
    { id: 3, title: "Upload Contract", description: "Upload your contract document" },
    { id: 4, title: "Review & Analyze", description: "Review extracted text with highlighted gaps" },
    { id: 5, title: "Make Corrections", description: "Edit and finalize the document" }
  ];

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
  };

  const handleDocumentExtraction = async () => {
    const hasTemplateContext = templateMode === 'standard'
      ? !!selectedTemplate
      : (!!customTemplateName || !!customTemplateText);
    if (!uploadedFile || !hasTemplateContext) return;
    // Ensure no stale analysis timers are running
    if (analyzeTimerRef.current) {
      clearTimeout(analyzeTimerRef.current);
      analyzeTimerRef.current = null;
    }
    setIsAnalyzing(true);
    try {
      // Real PDF extraction using our multi-extractor pipeline
      const extractedText = await extractTextFromPdf(uploadedFile);
      
      // Generate gaps based on extracted content
      const detectedGaps = generateGapsFromText(extractedText, selectedTemplate);

      const mockGaps: DocumentGap[] = [
        {
          id: "gap-1",
          sectionTitle: "Parties",
          gapType: "incomplete",
          severity: "high",
          description: "Missing legal entity details and addresses",
          recommendation: "Include full legal names, addresses, and entity types",
          startIndex: 45,
          endIndex: 85,
          originalText: "ABC Corp and XYZ Services",
          suggestedText: "ABC Corp, a Delaware corporation located at [Address], and XYZ Services LLC, a limited liability company located at [Address]"
        },
        {
          id: "gap-2",
          sectionTitle: "Scope of Services",
          gapType: "weak",
          severity: "critical",
          description: "Vague scope definition lacks specificity",
          recommendation: "Define specific deliverables, timelines, and success criteria",
          startIndex: 120,
          endIndex: 170,
          originalText: "Provider will deliver consulting services as needed",
          suggestedText: "Provider will deliver the following consulting services: [List specific services], with deliverables due on [specific dates], meeting the following criteria: [success metrics]"
        },
        {
          id: "gap-3",
          sectionTitle: "Limitation of Liability",
          gapType: "missing",
          severity: "critical",
          description: "Missing liability limitation clause",
          recommendation: "Add comprehensive liability limitation and indemnification clauses",
          startIndex: -1,
          endIndex: -1,
          suggestedText: "LIMITATION OF LIABILITY: Neither party shall be liable for indirect, incidental, or consequential damages. Total liability shall not exceed the amount paid under this agreement."
        }
      ];

      // Initialize original text and patch state (after gaps are known)
      setOriginalExtractedText(extractedText);
      const initialStates: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
      for (const g of [...detectedGaps, ...mockGaps]) initialStates[g.id] = 'pending';
      setPatchStates(initialStates);

      const doc: ExtractedDocument = {
        id: "doc-1",
        fileName: uploadedFile.name,
        fullText: extractedText, // keep original unchanged
        sections: [],
        gaps: [...detectedGaps, ...mockGaps],
        overallScore: 72,
        templateId: selectedTemplate?.id || "custom",
      };
      setExtractedDocument(doc);
      setEditedText(extractedText);
      setCurrentStep(4);
    } catch (error) {
      console.error('Document extraction failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    // Simulate analysis
    if (analyzeTimerRef.current) {
      clearTimeout(analyzeTimerRef.current);
      analyzeTimerRef.current = null;
    }
    analyzeTimerRef.current = window.setTimeout(() => {
      const newReview: ContractReview = {
        id: `rev-${Date.now()}`,
        fileName: uploadedFile!.name,
        contractType: selectedTemplate?.type || 'custom',
        status: "in-review",
        riskLevel: (extractedDocument && extractedDocument.overallScore < 50) ? "high" : "medium",
        score: extractedDocument?.overallScore ?? 72,
        gaps: extractedDocument?.gaps.map(g => g.id) ?? [],
        suggestions: extractedDocument?.gaps.map(g => g.recommendation) ?? [],
        reviewer: "Auto Analyzer",
        uploadDate: new Date().toISOString(),
        reviewDate: new Date().toISOString()
      };

      setReviews(prev => [newReview, ...prev]);
      try {
        // Optional: log analysis event
        void fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'analyze', file: uploadedFile!.name, template: selectedTemplate?.id || 'custom' })
        });
      } catch (_) {
        // ignore logging errors
      }
      setIsAnalyzing(false);
      setCurrentStep(5);
      analyzeTimerRef.current = null;
    }, 3000);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContractTypeToggle = (typeId: string) => {
    setSelectedContractTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const filterCategories = [
    { id: "all", name: "All Categories" },
    { id: "business", name: "Business" },
    { id: "legal", name: "Legal" },
    { id: "property", name: "Property & Real Estate" },
    { id: "commercial", name: "Commercial & Sales" },
    { id: "technology", name: "Technology & IP" },
    { id: "specialized", name: "Specialized Services" }
  ];

  const getContractCategory = (contractId: string) => {
    const businessTypes = ["vendor", "partnership", "consulting", "franchise", "joint-venture", "merger", "acquisition", "outsourcing", "supply-chain", "manufacturing"];
    const legalTypes = ["employment", "nda", "license", "confidentiality", "non-compete", "settlement", "arbitration", "power-attorney"];
    const propertyTypes = ["lease", "rental", "property-sale", "mortgage", "construction", "maintenance"];
    const commercialTypes = ["service", "purchase", "distribution", "sales", "subscription", "warranty"];
    const technologyTypes = ["software", "saas", "data-processing", "hosting", "development", "api"];
    const specializedTypes = ["healthcare", "education", "transportation", "logistics", "insurance", "financial"];

    if (businessTypes.includes(contractId)) return "business";
    if (legalTypes.includes(contractId)) return "legal";
    if (propertyTypes.includes(contractId)) return "property";
    if (commercialTypes.includes(contractId)) return "commercial";
    if (technologyTypes.includes(contractId)) return "technology";
    if (specializedTypes.includes(contractId)) return "specialized";
    return "business";
  };

  const filteredContractTypes = contractTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || getContractCategory(type.id) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const canProceedToStep2 = !!selectedTemplate || selectedContractTypes.length > 0;
  // From new Step 2 -> Step 3
  const canProceedToStep3 = templateMode === 'standard' ? !!selectedTemplate : (!!customTemplateName || !!customTemplateText);
  // From Step 3 -> Step 4 (must have a document uploaded)
  const canProceedToStep4 = uploadedFile !== null;
  const canAnalyze = (templateMode === 'standard' ? !!selectedTemplate : (!!customTemplateName || !!customTemplateText)) && uploadedFile !== null;
  const canExtract = (templateMode === 'standard' ? !!selectedTemplate : (!!customTemplateName || !!customTemplateText)) && uploadedFile !== null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in-review": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "requires-attention": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in-review": return <Clock className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "requires-attention": return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <FileText className="h-8 w-8" />
          Contract Review
        </h1>
        <p className="text-muted-foreground">
          Upload contracts and get AI-powered analysis against reference templates
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep >= step.id
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-muted-foreground text-muted-foreground'
              }`}>
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 transition-all ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">{steps[currentStep - 1]?.title}</h2>
        <p className="text-muted-foreground text-lg">{steps[currentStep - 1]?.description}</p>
      </div>

      {/* Step Content */}
      <Card className="min-h-[600px]">
        <CardContent className="p-10">

          {/* Step 1: Select Template from Knowledge Base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Library className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Knowledge Base Templates</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Select a baseline template that has been reviewed and approved by legal experts. 
                  Your uploaded contract will be compared against this template to identify gaps and weaknesses.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-muted-foreground">{knowledgeBaseTemplates.length} templates</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => scrollTemplates('left')} aria-label="Scroll left">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => scrollTemplates('right')} aria-label="Scroll right">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div
                  ref={templatesContainerRef}
                  className="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  <div className="flex gap-4 pr-2">
                    {knowledgeBaseTemplates.map((template) => {
                      const selected = selectedTemplate?.id === template.id;
                      const dimNonSelected = !!selectedTemplate && !selected;
                      return (
                        <Card
                          key={template.id}
                          className={`min-w-[300px] max-w-[300px] cursor-pointer transition-all border-2 ${
                            selected ? 'border-primary bg-primary/5 shadow-lg' : 'border-muted hover:border-primary/50'
                          } ${dimNonSelected ? 'opacity-80' : ''}`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <BookOpen className="h-8 w-8 text-primary" />
                              {template.isBaseline && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  <Award className="h-3 w-3 mr-1" />
                                  Baseline
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg truncate" title={template.name}>{template.name}</CardTitle>
                            <CardDescription className="overflow-hidden text-ellipsis whitespace-nowrap" title={template.description}>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-sm text-muted-foreground">
                                <strong>Sections:</strong> {template.sections.length}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <strong>Sources:</strong> {template.sources.join(', ')}
                              </div>
                              {template.sections.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {template.sections.slice(0, 3).map((section) => (
                                    <Badge key={section.id} variant="outline" className="text-xs">
                                      {section.title}
                                    </Badge>
                                  ))}
                                  {template.sections.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{template.sections.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>

              {selectedTemplate && (
                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                      <Info className="h-5 w-5" />
                      Selected Template: {selectedTemplate.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Required Sections:</h4>
                        <ul className="space-y-1">
                          {selectedTemplate.sections.filter(s => s.isRequired).map((section) => (
                            <li key={section.id} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{section.title}</span>
                              <Badge className={`text-xs ${
                                section.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                section.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              }`}>
                                {section.priority}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">What We'll Check:</h4>
                        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                          <li>• Missing required sections</li>
                          <li>• Weak or incomplete clauses</li>
                          <li>• Non-compliant language</li>
                          <li>• Risk exposure areas</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedTemplate && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Audit Logs
                    </CardTitle>
                    <CardDescription>
                      Recent activity for template "{selectedTemplate.name}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {logsLoading && (
                      <div className="text-sm text-muted-foreground">Loading logs…</div>
                    )}
                    {!logsLoading && logsError && (
                      <div className="text-sm text-red-600 dark:text-red-400">{logsError}</div>
                    )}
                    {!logsLoading && !logsError && templateLogs.filter(l => l.action !== 'selected').length === 0 && (
                      <div className="text-sm text-muted-foreground">No logs yet for this template.</div>
                    )}
                    {!logsLoading && !logsError && templateLogs.filter(l => l.action !== 'selected').length > 0 && (
                      <div className="space-y-3">
                        {templateLogs.filter(l => l.action !== 'selected').map((log) => (
                          <div
                            key={log._id}
                            className="flex items-center justify-between border rounded-md p-3 bg-muted/40 dark:bg-muted/30 hover:bg-muted/60 transition-colors border-border dark:border-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {log.status ? `Result: ${log.status}` : (log.action === 'analyzed' ? 'Analysis completed' : 'Event')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(log.analysisDate).toLocaleString()} {log.fileName ? `• ${log.fileName}` : ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {typeof log.score === 'number' && (
                                <Badge variant="outline" className="text-xs border-primary/40 text-primary">Score: {log.score}</Badge>
                              )}
                              {typeof log.gapsCount === 'number' && (
                                <Badge variant="outline" className="text-xs border-blue-400/40 text-blue-700 dark:text-blue-300">Gaps: {log.gapsCount}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Template Boilerplate or Custom Template */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <Card>
                <CardContent>
                  {/* Mode toggle centered */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Button
                      variant={templateMode === 'standard' ? 'default' : 'outline'}
                      onClick={() => {
                        setTemplateMode('standard');
                      }}
                    >
                      Use Knowledge Base
                    </Button>
                    <Button
                      variant={templateMode !== 'standard' ? 'default' : 'outline'}
                      onClick={() => {
                        setTemplateMode('knowledge');
                      }}
                    >
                      Upload Custom Template
                    </Button>
                  </div>
                  {templateMode === 'standard' ? (
                    <div className="space-y-6">
                      {selectedTemplate ? (
                        <>
                          <h4 className="text-base font-semibold mb-2">Key sections that will be checked</h4>
                          <ul className="space-y-2 text-sm">
                            {selectedTemplate.sections.slice(0, 6).map((s) => (
                              <li key={s.id} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>{s.title}</span>
                                <Badge variant="outline" className="ml-auto text-xs">{s.priority}</Badge>
                              </li>
                            ))}
                            {selectedTemplate.sections.length > 6 && (
                              <li className="text-muted-foreground">+{selectedTemplate.sections.length - 6} more…</li>
                            )}
                          </ul>

                          {/* Brief template format preview */}
                          <div className="space-y-2">
                            <h4 className="text-base font-semibold">Template format preview (brief)</h4>
                            <div className="prose dark:prose-invert max-w-none border rounded-md p-4 text-sm">
                              {selectedTemplate.sections.slice(0, 3).map((s) => {
                                const sec: any = s as any;
                                const preview = sec?.snippet ?? sec?.content ?? '';
                                return (
                                  <div key={s.id} className="mb-3">
                                    <div className="font-semibold">{s.title}</div>
                                    <div className="text-muted-foreground">{preview || '—'}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Sources */}
                          {(() => {
                            const sources = (selectedTemplate as any)?.sources as string[] | undefined;
                            return sources && sources.length > 0;
                          })() && (
                            <div className="space-y-2">
                              <h4 className="text-base font-semibold">Sources</h4>
                              <div className="flex flex-wrap gap-2">
                                {((selectedTemplate as any)?.sources as string[]).map((src) => (
                                  <Badge key={src} variant="outline">{src}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">No template selected. Go back to Step 1 to choose a template.</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Provide a custom template</div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsNotepadOpen(true)}
                                className="gap-2"
                                aria-label="Open Notepad"
                              >
                                <NotebookPen className="h-4 w-4" /> Notepad
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Paste your own template
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Animated Dropzone */}
                      <div
                        onClick={openFilePicker}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        className={`group relative w-full rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5 shadow-lg' : 'border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30'} ${customTemplateName ? 'border-green-500/60 bg-green-50 dark:bg-green-950/20' : ''}`}
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className={`rounded-full p-3 ${isDragging ? 'bg-primary/10' : 'bg-muted'} transition-colors`}>
                            <FileUp className={`h-6 w-6 ${isDragging ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Drag & drop</span> your template here
                            <span className="text-muted-foreground"> or click to browse</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Accepted: .pdf, .doc, .docx, .txt</div>
                          {(customTemplateName || customTemplateText) && (
                            <div className="mt-2 text-sm">
                              {customTemplateName ? (
                                <>Selected file: <span className="font-medium">{customTemplateName}</span></>
                              ) : (
                                <span className="font-medium text-emerald-600">Typed template provided</span>
                              )}
                            </div>
                          )}
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          className="hidden"
                          onChange={handleCustomTemplateUpload}
                        />
                      </div>

                      {/* Notepad Modal */}
                      {isNotepadOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                          <div className="absolute inset-0 bg-black/50" onClick={() => setIsNotepadOpen(false)} />
                          <div className="relative z-10 w-full max-w-3xl">
                            <Card className="shadow-xl bg-white dark:bg-neutral-900">
                              <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                  <CardTitle>Custom Template Notepad</CardTitle>
                                  <CardDescription>Paste or type your template text</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsNotepadOpen(false)}>
                                  <X className="h-5 w-5" />
                                </Button>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <Textarea
                                  value={customTemplateText}
                                  onChange={(e) => setCustomTemplateText(e.target.value)}
                                  placeholder="e.g., Parties, Scope, Payment Terms, Termination..."
                                  className="min-h-[280px] font-mono text-sm"
                                />
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-muted-foreground">Tip: You can provide headings and clauses in your preferred format.</div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setCustomTemplateText("")}>Clear</Button>
                                    <Button onClick={() => setIsNotepadOpen(false)}>
                                      <Save className="h-4 w-4 mr-2" /> Save
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Upload Contract */}
          {currentStep === 3 && (
            <div className="space-y-8">
              {/* Upload Options */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload from Device</CardTitle>
                    <CardDescription>Upload a contract document from your computer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
                      <div className="text-center">
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                        {uploadedFile && (
                          <p className="text-sm text-muted-foreground mt-2">Selected: {uploadedFile.name}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Use Existing Asset</CardTitle>
                    <CardDescription>Select a file from your assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
                      <div className="text-center">
                        <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <Button variant="secondary" onClick={() => setIsAssetPickerOpen(true)}>
                          Open Asset Picker
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Tips */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                  For best results, upload clear, text-based documents. Scanned PDFs may require OCR.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 4: Review & Analyze */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Apply RuleBase</div>
                      <div className="text-sm text-muted-foreground">Use your custom company rules during analysis</div>
                    </div>
                    <Switch checked={applyRuleBase} onCheckedChange={setApplyRuleBase} />
                  </div>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Selected Template / Contract Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTemplate ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span className="text-sm font-bold">{selectedTemplate.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{selectedTemplate.type}</Badge>
                          {selectedTemplate.isBaseline && (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">Baseline</Badge>
                          )}
                          <span>Updated: {selectedTemplate.lastUpdated}</span>
                        </div>
                      </div>
                    ) : selectedContractTypes.length > 0 ? (
                      <div className="space-y-2">
                        {selectedContractTypes.map(typeId => {
                          const selectedType = contractTypes.find(t => t.id === typeId);
                          if (!selectedType) return null;
                          const Icon = selectedType.icon;
                          return (
                            <div key={typeId} className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-primary" />
                              <span className="text-sm font-bold">{selectedType.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No template or contract type selected</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {uploadedFile ? (
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-bold">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No file selected</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                      <span className="text-primary font-bold">Analyzing Contract...</span>
                    </div>
                  </div>
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Analysis Progress</span>
                      <span>Processing...</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      AI is reviewing your contract against reference templates
                    </p>
                  </div>
                </div>
              )}

              {/* Guidance panel to utilize space when idle */}
              {!isAnalyzing && !extractedDocument && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Before you proceed</AlertTitle>
                  <AlertDescription>
                    Ensure the selected template matches your document. Click "Extract & Analyze" to detect gaps and risks. Sensitive data should be reviewed before sharing.
                  </AlertDescription>
                </Alert>
              )}

              {/* Extracted text with highlighted gaps */}
              {extractedDocument && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Extracted Text (Highlighted)
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Issues are highlighted in the text below</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={exportContract} disabled={!extractedDocument}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      <div className="h-96 overflow-y-auto border border-border rounded-lg m-4" ref={extractedTextRef}>
                        <div 
                          className="prose dark:prose-invert max-w-none p-4 text-sm leading-relaxed" 
                          dangerouslySetInnerHTML={{ __html: highlightGaps(extractedDocument.fullText, extractedDocument.gaps) }} 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Identified Gaps
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {extractedDocument.gaps.length} issue{extractedDocument.gaps.length !== 1 ? 's' : ''} found
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {extractedDocument.gaps.filter(g => g.startIndex >= 0).length > 1 && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => navigateToGap('prev')}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => navigateToGap('next')}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {appliedFixes.length > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={undoLastFix}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Undo
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={acceptAllSuggestions} 
                            disabled={!extractedDocument.gaps.length}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept All
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      <div className="h-96 overflow-y-auto m-4">
                        {extractedDocument.gaps.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-center">
                            <div>
                              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                              <p className="text-sm font-medium">No gaps detected</p>
                              <p className="text-xs text-muted-foreground">Your contract looks good!</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 pr-2">
                            {extractedDocument.gaps.map((gap) => {
                              const cfg = severityConfig[gap.severity];
                              return (
                                <div key={gap.id} className={`rounded-lg overflow-hidden ${cfg.border} ${cfg.bg} transition-all hover:shadow-sm`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-sm font-bold capitalize ${cfg.text} flex items-center gap-2`}>
                                        <div className={`w-2 h-2 rounded-full ${cfg.highlight}`}></div>
                                        {gap.severity} • {gap.gapType.replace('-', ' ')}
                                        {gap.startIndex >= 0 && (
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-5 w-5 p-0 ml-auto" 
                                            onClick={() => scrollToGap(gap)}
                                            title="Jump to text"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                      <div className="mt-2 space-y-2">
                                        <div className="font-semibold text-sm">{gap.sectionTitle}</div>
                                        <div className="text-sm text-foreground">{gap.description}</div>
                                        <div className="text-xs text-muted-foreground">
                                          <span className="font-medium">Recommendation:</span> {gap.recommendation}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      {gap.suggestedText && (
                                        <Button 
                                          size="sm" 
                                          variant={(patchStates[gap.id] || 'pending') === 'accepted' ? 'default' : 'outline'} 
                                          onClick={() => toggleAccept(gap)}
                                          aria-pressed={(patchStates[gap.id] || 'pending') === 'accepted'}
                                          className="transition-all duration-200 hover:scale-105"
                                        >
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          {(patchStates[gap.id] || 'pending') === 'accepted' ? 'Accepted' : 'Accept'}
                                        </Button>
                                      )}
                                      {gap.suggestedText && (
                                        <Button 
                                          size="sm" 
                                          variant={(patchStates[gap.id] || 'pending') === 'rejected' ? 'destructive' : 'outline'} 
                                          onClick={() => toggleReject(gap)}
                                          aria-pressed={(patchStates[gap.id] || 'pending') === 'rejected'}
                                          className="transition-all duration-200"
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          {(patchStates[gap.id] || 'pending') === 'rejected' ? 'Rejected' : 'Reject'}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Results */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No analysis results</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete the analysis to see contract review results
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {review.fileName}
                          </h3>
                          <p className="text-muted-foreground">
                            {review.contractType} • Analyzed on {new Date(review.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(review.status)}>
                            {getStatusIcon(review.status)}
                            <span className="ml-1">{review.status.replace("-", " ")}</span>
                          </Badge>
                          <Badge className={getRiskColor(review.riskLevel)}>
                            Risk: {review.riskLevel}
                          </Badge>
                          <Badge variant="outline">{review.score}% Score</Badge>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Contract Quality Score</span>
                          <span>{review.score}%</span>
                        </div>
                        <Progress value={review.score} className="h-3" />
                      </div>

                      {/* Severity Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(() => {
                          const counts = { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>;
                          // Prefer extractedDocument counts if available
                          if (extractedDocument?.gaps) {
                            extractedDocument.gaps.forEach(g => counts[g.severity] = (counts[g.severity] || 0) + 1);
                          }
                          const tiles = [
                            { key: 'critical', label: 'Critical Issues', color: 'bg-red-600', icon: AlertTriangle },
                            { key: 'high', label: 'High Priority', color: 'bg-orange-600', icon: AlertTriangle },
                            { key: 'medium', label: 'Medium Risk', color: 'bg-amber-600', icon: FileText },
                            { key: 'low', label: 'Low Priority', color: 'bg-green-600', icon: CheckCircle },
                          ];
                          return tiles.map(({ key, label, color, icon: Icon }) => (
                            <div key={key} className={`rounded-xl p-4 text-white shadow-md ${color}`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-2xl font-extrabold leading-none">{counts[key] || 0}</div>
                                  <div className="text-sm font-semibold opacity-95 mt-1">{label}</div>
                                </div>
                                <Icon className="h-5 w-5 opacity-90" />
                              </div>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Issues and Suggestions stacked vertically */}
                      <div className="space-y-6 mt-4">
                        {review.gaps.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                Issues
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-3">
                                {extractedDocument?.gaps && extractedDocument.gaps.length > 0 ? (
                                  extractedDocument.gaps.map((g) => {
                                    const color = g.severity === 'critical' ? 'bg-red-600' : g.severity === 'high' ? 'bg-orange-600' : g.severity === 'medium' ? 'bg-amber-600' : 'bg-green-600';
                                    return (
                                      <li key={g.id} className="rounded-lg overflow-hidden">
                                        <div className={`${color} text-white px-3 py-1 text-xs font-bold uppercase tracking-wide`}>{g.severity}</div>
                                        <div className="p-3 border border-t-0 rounded-b-lg">
                                          <div className="text-sm font-semibold">{g.sectionTitle} • {g.gapType.replace('-', ' ')}</div>
                                          <div className="text-sm text-muted-foreground mt-1">{g.description}</div>
                                        </div>
                                      </li>
                                    );
                                  })
                                ) : (
                                  review.gaps.map((gap, index) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                      <span className="text-red-600 mt-1">•</span>
                                      {gap}
                                    </li>
                                  ))
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {review.suggestions.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Suggestions
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {review.suggestions.map((suggestion, index) => (
                                  <li key={index} className="text-sm flex items-start gap-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentStep(1);
                            setReviews([]);
                            setSelectedContractTypes([]);
                            setUploadedFile(null);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Analyze New Contract
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === 4 && !extractedDocument && (
            <Button
              onClick={handleDocumentExtraction}
              disabled={!canExtract || isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Extract
                </>
              )}
            </Button>
          )}

          {currentStep === 4 && extractedDocument && (
            <Button
              onClick={handleSaveDocument}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save & Generate Results
            </Button>
          )}

          {currentStep < 4 && (
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3) ||
                (currentStep === 3 && !canProceedToStep4)
              }
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPicker
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        onSelect={handleAssetSelect}
        title="Select Contract Document"
        description="Choose a document from your assets to review"
      />
    </div>
  );
}
