"use client";

import React, { useState } from "react";
import { BookOpen, Filter, Search, Shield, Building, Lock, DollarSign, Users, Globe, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  compliance: string;
  icon: React.ElementType;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lastUpdated: string;
  audience: string;
}

const policies: Policy[] = [
  // --- Existing 20 policies, now with audience field added ---
  {
    id: "gdpr",
    title: "GDPR Compliance",
    description: "European General Data Protection Regulation guidelines for data privacy and protection.",
    category: "privacy",
    compliance: "EU",
    icon: Shield,
    tags: ["data protection", "privacy", "EU"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-15",
    audience: "All companies and organizations processing personal data of EU residents"
  },
  {
    id: "ccpa",
    title: "CCPA Framework",
    description: "California Consumer Privacy Act requirements for consumer data rights.",
    category: "privacy",
    compliance: "US",
    icon: Lock,
    tags: ["consumer rights", "privacy", "California"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-10",
    audience: "Businesses handling personal data of California residents"
  },
  {
    id: "hipaa",
    title: "HIPAA Security",
    description: "Health Insurance Portability and Accountability Act for healthcare data protection.",
    category: "data collection",
    compliance: "US",
    icon: FileText,
    tags: ["healthcare", "data security", "PHI"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-20",
    audience: "US healthcare providers, insurers, and business associates"
  },
  {
    id: "iso27001",
    title: "ISO 27001",
    description: "International standard for information security management systems.",
    category: "data collection",
    compliance: "Global",
    icon: Globe,
    tags: ["security", "management", "ISO"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-12",
    audience: "Organizations seeking global information security certification"
  },
  {
    id: "sox",
    title: "SOX Compliance",
    description: "Sarbanes-Oxley Act requirements for financial reporting and corporate governance.",
    category: "finance",
    compliance: "US",
    icon: DollarSign,
    tags: ["financial", "reporting", "governance"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-08",
    audience: "Public companies operating in the United States"
  },
  {
    id: "pci-dss",
    title: "PCI DSS",
    description: "Payment Card Industry Data Security Standard for secure payment processing.",
    category: "finance",
    compliance: "Global",
    icon: Shield,
    tags: ["payments", "security", "PCI"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-18",
    audience: "Any business handling credit card transactions"
  },
  {
    id: "workplace-safety",
    title: "Workplace Safety",
    description: "Comprehensive workplace safety policies and emergency procedures.",
    category: "workplace",
    compliance: "Global",
    icon: AlertTriangle,
    tags: ["safety", "emergency", "procedures"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-14",
    audience: "All employers and employees"
  },
  {
    id: "remote-work",
    title: "Remote Work Policy",
    description: "Guidelines for remote work arrangements and digital collaboration.",
    category: "workplace",
    compliance: "Global",
    icon: Users,
    tags: ["remote", "collaboration", "digital"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-16",
    audience: "Organizations with remote or hybrid workforce"
  },
  {
    id: "data-retention",
    title: "Data Retention",
    description: "Policies for data lifecycle management and retention schedules.",
    category: "data collection",
    compliance: "Global",
    icon: FileText,
    tags: ["retention", "lifecycle", "management"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-11",
    audience: "Organizations managing large volumes of data"
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Framework",
    description: "Comprehensive cybersecurity policies and incident response procedures.",
    category: "data collection",
    compliance: "Global",
    icon: Shield,
    tags: ["cybersecurity", "incident", "response"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-19",
    audience: "All organizations handling digital assets"
  },
  {
    id: "anti-money-laundering",
    title: "AML Compliance",
    description: "Anti-Money Laundering policies and transaction monitoring procedures.",
    category: "finance",
    compliance: "Global",
    icon: DollarSign,
    tags: ["AML", "monitoring", "compliance"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-13",
    audience: "Financial institutions, banks, fintech companies"
  },
  {
    id: "diversity-inclusion",
    title: "Diversity & Inclusion",
    description: "Workplace diversity, equity, and inclusion policies and best practices.",
    category: "workplace",
    compliance: "Global",
    icon: Users,
    tags: ["diversity", "inclusion", "equity"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-17",
    audience: "All organizations and HR departments"
  },
  {
    id: "vendor-management",
    title: "Vendor Management",
    description: "Third-party vendor assessment and management policies.",
    category: "privacy",
    compliance: "Global",
    icon: Building,
    tags: ["vendor", "third-party", "assessment"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-09",
    audience: "Companies working with external vendors"
  },
  {
    id: "business-continuity",
    title: "Business Continuity",
    description: "Business continuity planning and disaster recovery procedures.",
    category: "workplace",
    compliance: "Global",
    icon: CheckCircle,
    tags: ["continuity", "disaster", "recovery"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-21",
    audience: "All organizations seeking operational resilience"
  },
  {
    id: "environmental",
    title: "Environmental Policy",
    description: "Environmental sustainability and corporate responsibility guidelines.",
    category: "workplace",
    compliance: "Global",
    icon: Globe,
    tags: ["environment", "sustainability", "responsibility"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-07",
    audience: "Corporates, manufacturers, and public sector organizations"
  },
  {
    id: "intellectual-property",
    title: "IP Protection",
    description: "Intellectual property protection and trademark management policies.",
    category: "privacy",
    compliance: "Global",
    icon: Lock,
    tags: ["IP", "trademark", "protection"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-06",
    audience: "Businesses and individuals with IP assets"
  },
  {
    id: "financial-reporting",
    title: "Financial Reporting",
    description: "Financial reporting standards and accounting policy guidelines.",
    category: "finance",
    compliance: "Global",
    icon: DollarSign,
    tags: ["reporting", "accounting", "standards"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-05",
    audience: "Finance teams and accountants"
  },
  {
    id: "code-of-conduct",
    title: "Code of Conduct",
    description: "Employee code of conduct and ethical behavior guidelines.",
    category: "workplace",
    compliance: "Global",
    icon: Users,
    tags: ["conduct", "ethics", "behavior"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-04",
    audience: "All employees and managers"
  },
  {
    id: "data-classification",
    title: "Data Classification",
    description: "Data classification schemes and handling procedures for sensitive information.",
    category: "data collection",
    compliance: "Global",
    icon: FileText,
    tags: ["classification", "sensitive", "handling"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-03",
    audience: "Organizations handling sensitive or regulated data"
  },
  {
    id: "procurement",
    title: "Procurement Policy",
    description: "Procurement processes and supplier evaluation criteria.",
    category: "finance",
    compliance: "Global",
    icon: Building,
    tags: ["procurement", "supplier", "evaluation"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-02",
    audience: "Procurement teams and supply chain managers"
  },
  // --- More policies to be added in next batch ---
  {
    id: "pdpa-singapore",
    title: "Singapore PDPA",
    description: "Personal Data Protection Act for Singapore, governing collection, use, and disclosure of personal data.",
    category: "privacy",
    compliance: "Singapore",
    icon: Shield,
    tags: ["data protection", "privacy", "Singapore"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-22",
    audience: "Businesses collecting or processing personal data in Singapore"
  },
  {
    id: "it-act-india",
    title: "India IT Act",
    description: "Information Technology Act, 2000, with rules for data protection and cybercrime in India.",
    category: "privacy",
    compliance: "India",
    icon: Lock,
    tags: ["cyber law", "privacy", "India"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-23",
    audience: "Indian companies, IT service providers, fintechs"
  },
  {
    id: "dpdp-india",
    title: "India DPDP Act",
    description: "Digital Personal Data Protection Act, 2023, India's comprehensive data privacy law.",
    category: "privacy",
    compliance: "India",
    icon: Shield,
    tags: ["data privacy", "DPDP", "India"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-24",
    audience: "All businesses processing personal data of Indian citizens"
  },
  {
    id: "pdpb-malaysia",
    title: "Malaysia PDPA",
    description: "Personal Data Protection Act for Malaysia, regulating processing of personal data in commercial transactions.",
    category: "privacy",
    compliance: "Malaysia",
    icon: Shield,
    tags: ["data protection", "privacy", "Malaysia"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-25",
    audience: "Malaysian businesses and service providers"
  },
  {
    id: "popea-philippines",
    title: "Philippines DPA",
    description: "Data Privacy Act for the Philippines, protecting personal information in information and communications systems.",
    category: "privacy",
    compliance: "Philippines",
    icon: Shield,
    tags: ["data privacy", "Philippines", "compliance"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-26",
    audience: "Philippine companies, BPOs, and government agencies"
  },
  {
    id: "gdpb-gulf",
    title: "GCC Data Protection",
    description: "Gulf Cooperation Council (GCC) data protection and privacy regulations across member states.",
    category: "privacy",
    compliance: "GCC/Gulf",
    icon: Globe,
    tags: ["Gulf", "privacy", "GCC"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-27",
    audience: "Businesses operating in Gulf states (UAE, KSA, Qatar, etc.)"
  },
  {
    id: "dpl-uae",
    title: "UAE Data Protection Law",
    description: "UAE's Federal Decree-Law No. 45 of 2021 on Personal Data Protection.",
    category: "privacy",
    compliance: "UAE",
    icon: Shield,
    tags: ["UAE", "data protection", "privacy"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-28",
    audience: "Companies and government entities in the UAE"
  },
  {
    id: "ksa-cyber-law",
    title: "KSA Cyber Law",
    description: "Kingdom of Saudi Arabia's Cybersecurity and Data Protection regulations.",
    category: "privacy",
    compliance: "KSA",
    icon: Shield,
    tags: ["KSA", "cybersecurity", "privacy"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-29",
    audience: "Saudi Arabian businesses and public sector"
  },
  {
    id: "china-csl",
    title: "China Cybersecurity Law",
    description: "China's Cybersecurity Law and Personal Information Protection Law (PIPL).",
    category: "privacy",
    compliance: "China",
    icon: Shield,
    tags: ["China", "cybersecurity", "PIPL"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-30",
    audience: "Chinese companies and multinationals in China"
  },
  {
    id: "japan-apipa",
    title: "Japan APPI",
    description: "Act on the Protection of Personal Information (APPI), Japan's main data privacy law.",
    category: "privacy",
    compliance: "Japan",
    icon: Shield,
    tags: ["Japan", "APPI", "privacy"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-31",
    audience: "Japanese businesses and global companies handling Japanese data"
  },
  {
    id: "korea-pipa",
    title: "Korea PIPA",
    description: "Personal Information Protection Act (PIPA), Korea's comprehensive data privacy law.",
    category: "privacy",
    compliance: "South Korea",
    icon: Shield,
    tags: ["Korea", "PIPA", "privacy"],
    difficulty: "Advanced",
    lastUpdated: "2024-02-01",
    audience: "Korean companies and international firms in Korea"
  },
  {
    id: "australia-privacy-act",
    title: "Australia Privacy Act",
    description: "Australia's Privacy Act 1988, regulating handling of personal information.",
    category: "privacy",
    compliance: "Australia",
    icon: Shield,
    tags: ["Australia", "privacy", "compliance"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-02",
    audience: "Australian businesses and government agencies"
  },
  {
    id: "thailand-pdpa",
    title: "Thailand PDPA",
    description: "Personal Data Protection Act (PDPA), Thailand's data privacy law.",
    category: "privacy",
    compliance: "Thailand",
    icon: Shield,
    tags: ["Thailand", "PDPA", "privacy"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-03",
    audience: "Thai companies and foreign entities in Thailand"
  },
  {
    id: "vietnam-cyber-law",
    title: "Vietnam Cyber Law",
    description: "Vietnam's Law on Cyber Information Security and Cybersecurity Law.",
    category: "privacy",
    compliance: "Vietnam",
    icon: Shield,
    tags: ["Vietnam", "cybersecurity", "privacy"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-04",
    audience: "Vietnamese businesses and tech companies"
  },
  {
    id: "brunei-pdpa",
    title: "Brunei PDPA",
    description: "Brunei's Personal Data Protection Act for regulating personal data handling.",
    category: "privacy",
    compliance: "Brunei",
    icon: Shield,
    tags: ["Brunei", "PDPA", "privacy"],
    difficulty: "Beginner",
    lastUpdated: "2024-02-05",
    audience: "Brunei businesses and organizations"
  },
  {
    id: "oman-data-protection",
    title: "Oman Data Protection Law",
    description: "Oman's Personal Data Protection Law for safeguarding personal data.",
    category: "privacy",
    compliance: "Oman",
    icon: Shield,
    tags: ["Oman", "privacy", "data protection"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-06",
    audience: "Omani companies and international organizations in Oman"
  },
  {
    id: "bahrain-data-protection",
    title: "Bahrain Data Protection Law",
    description: "Bahrain's Law No. 30 of 2018 with Respect to Personal Data Protection.",
    category: "privacy",
    compliance: "Bahrain",
    icon: Shield,
    tags: ["Bahrain", "privacy", "data protection"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-07",
    audience: "Bahraini companies and government entities"
  },
  {
    id: "qatar-data-protection",
    title: "Qatar Data Protection Law",
    description: "Qatar's Personal Data Privacy Protection Law (Law No. 13 of 2016).",
    category: "privacy",
    compliance: "Qatar",
    icon: Shield,
    tags: ["Qatar", "privacy", "data protection"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-08",
    audience: "Qatari companies and international firms in Qatar"
  },
  {
    id: "kuwait-data-protection",
    title: "Kuwait Data Protection Law",
    description: "Kuwait's data protection and privacy rules for personal information.",
    category: "privacy",
    compliance: "Kuwait",
    icon: Shield,
    tags: ["Kuwait", "privacy", "data protection"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-09",
    audience: "Kuwaiti businesses and organizations"
  },
  {
    id: "indonesia-pdp",
    title: "Indonesia PDP Law",
    description: "Personal Data Protection Law for Indonesia, regulating electronic and non-electronic data.",
    category: "privacy",
    compliance: "Indonesia",
    icon: Shield,
    tags: ["Indonesia", "PDP", "privacy"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-10",
    audience: "Indonesian companies and digital service providers"
  },
  {
    id: "hongkong-pdpo",
    title: "Hong Kong PDPO",
    description: "Personal Data (Privacy) Ordinance, Hong Kong's data privacy law.",
    category: "privacy",
    compliance: "Hong Kong",
    icon: Shield,
    tags: ["Hong Kong", "PDPO", "privacy"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-11",
    audience: "Hong Kong companies and public sector"
  },
  {
    id: "pakistan-data-protection",
    title: "Pakistan Data Protection Bill",
    description: "Pakistan's draft Personal Data Protection Bill for privacy and data security.",
    category: "privacy",
    compliance: "Pakistan",
    icon: Shield,
    tags: ["Pakistan", "privacy", "data protection"],
    difficulty: "Beginner",
    lastUpdated: "2024-02-12",
    audience: "Pakistani businesses and IT sector"
  },
  {
    id: "sri-lanka-data-protection",
    title: "Sri Lanka Data Protection Act",
    description: "Sri Lanka's Personal Data Protection Act for regulating processing of personal data.",
    category: "privacy",
    compliance: "Sri Lanka",
    icon: Shield,
    tags: ["Sri Lanka", "privacy", "data protection"],
    difficulty: "Beginner",
    lastUpdated: "2024-02-13",
    audience: "Sri Lankan companies and government entities"
  },
  {
    id: "nepal-data-protection",
    title: "Nepal Data Protection Bill",
    description: "Nepal's draft legislation for personal data protection and privacy.",
    category: "privacy",
    compliance: "Nepal",
    icon: Shield,
    tags: ["Nepal", "privacy", "data protection"],
    difficulty: "Beginner",
    lastUpdated: "2024-02-14",
    audience: "Nepalese businesses and organizations"
  },
  {
    id: "bangladesh-digital-security",
    title: "Bangladesh Digital Security Act",
    description: "Digital Security Act, 2018, for cybercrime and data protection in Bangladesh.",
    category: "privacy",
    compliance: "Bangladesh",
    icon: Shield,
    tags: ["Bangladesh", "cybersecurity", "privacy"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-15",
    audience: "Bangladeshi companies and tech sector"
  },
  {
    id: "mongolia-personal-info",
    title: "Mongolia Personal Info Law",
    description: "Mongolia's Law on Personal Information for privacy and data protection.",
    category: "privacy",
    compliance: "Mongolia",
    icon: Shield,
    tags: ["Mongolia", "privacy", "data protection"],
    difficulty: "Beginner",
    lastUpdated: "2024-02-16",
    audience: "Mongolian companies and organizations"
  },
  {
    id: "iran-cyber-law",
    title: "Iran Cyber Law",
    description: "Iran's Computer Crimes Law and data protection regulations.",
    category: "privacy",
    compliance: "Iran",
    icon: Shield,
    tags: ["Iran", "cyber law", "privacy"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-17",
    audience: "Iranian businesses and IT service providers"
  },
  {
    id: "turkey-data-protection",
    title: "Turkey Data Protection Law",
    description: "Turkey's Law on the Protection of Personal Data (KVKK).",
    category: "privacy",
    compliance: "Turkey",
    icon: Shield,
    tags: ["Turkey", "KVKK", "privacy"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-18",
    audience: "Turkish businesses and organizations"
  },
  {
    id: "uae-labour-law",
    title: "UAE Labour Law",
    description: "UAE's Federal Law No. 33 of 2021 regulating labour relations and employee rights.",
    category: "workplace",
    compliance: "UAE",
    icon: Users,
    tags: ["UAE", "labour", "workplace"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-19",
    audience: "Employers and employees in the UAE"
  },
  {
    id: "india-posh-act",
    title: "India POSH Act",
    description: "Prevention of Sexual Harassment (POSH) Act, 2013, for safe workplaces in India.",
    category: "workplace",
    compliance: "India",
    icon: Users,
    tags: ["POSH", "India", "workplace"],
    difficulty: "Intermediate",
    lastUpdated: "2024-02-20",
    audience: "Indian employers and HR departments"
  },
  {
    id: "gdpr",
    title: "GDPR Compliance",
    description: "European General Data Protection Regulation guidelines for data privacy and protection.",
    category: "privacy",
    compliance: "EU",
    icon: Shield,
    tags: ["data protection", "privacy", "EU"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-15"
  },
  {
    id: "ccpa",
    title: "CCPA Framework",
    description: "California Consumer Privacy Act requirements for consumer data rights.",
    category: "privacy",
    compliance: "US",
    icon: Lock,
    tags: ["consumer rights", "privacy", "California"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-10"
  },
  {
    id: "hipaa",
    title: "HIPAA Security",
    description: "Health Insurance Portability and Accountability Act for healthcare data protection.",
    category: "data collection",
    compliance: "US",
    icon: FileText,
    tags: ["healthcare", "data security", "PHI"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-20"
  },
  {
    id: "iso27001",
    title: "ISO 27001",
    description: "International standard for information security management systems.",
    category: "data collection",
    compliance: "Global",
    icon: Globe,
    tags: ["security", "management", "ISO"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-12"
  },
  {
    id: "sox",
    title: "SOX Compliance",
    description: "Sarbanes-Oxley Act requirements for financial reporting and corporate governance.",
    category: "finance",
    compliance: "US",
    icon: DollarSign,
    tags: ["financial", "reporting", "governance"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-08"
  },
  {
    id: "pci-dss",
    title: "PCI DSS",
    description: "Payment Card Industry Data Security Standard for secure payment processing.",
    category: "finance",
    compliance: "Global",
    icon: Shield,
    tags: ["payments", "security", "PCI"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-18"
  },
  {
    id: "workplace-safety",
    title: "Workplace Safety",
    description: "Comprehensive workplace safety policies and emergency procedures.",
    category: "workplace",
    compliance: "Global",
    icon: AlertTriangle,
    tags: ["safety", "emergency", "procedures"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-14"
  },
  {
    id: "remote-work",
    title: "Remote Work Policy",
    description: "Guidelines for remote work arrangements and digital collaboration.",
    category: "workplace",
    compliance: "Global",
    icon: Users,
    tags: ["remote", "collaboration", "digital"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-16"
  },
  {
    id: "data-retention",
    title: "Data Retention",
    description: "Policies for data lifecycle management and retention schedules.",
    category: "data collection",
    compliance: "Global",
    icon: FileText,
    tags: ["retention", "lifecycle", "management"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-11"
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Framework",
    description: "Comprehensive cybersecurity policies and incident response procedures.",
    category: "data collection",
    compliance: "Global",
    icon: Shield,
    tags: ["cybersecurity", "incident", "response"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-19"
  },
  {
    id: "anti-money-laundering",
    title: "AML Compliance",
    description: "Anti-Money Laundering policies and transaction monitoring procedures.",
    category: "finance",
    compliance: "Global",
    icon: DollarSign,
    tags: ["AML", "monitoring", "compliance"],
    difficulty: "Advanced",
    lastUpdated: "2024-01-13"
  },
  {
    id: "diversity-inclusion",
    title: "Diversity & Inclusion",
    description: "Workplace diversity, equity, and inclusion policies and best practices.",
    category: "workplace",
    compliance: "Global",
    icon: Users,
    tags: ["diversity", "inclusion", "equity"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-17"
  },
  {
    id: "vendor-management",
    title: "Vendor Management",
    description: "Third-party vendor assessment and management policies.",
    category: "privacy",
    compliance: "Global",
    icon: Building,
    tags: ["vendor", "third-party", "assessment"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-09"
  },
  {
    id: "business-continuity",
    title: "Business Continuity",
    description: "Business continuity planning and disaster recovery procedures.",
    category: "workplace",
    compliance: "Global",
    icon: CheckCircle,
    tags: ["continuity", "disaster", "recovery"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-21"
  },
  {
    id: "environmental",
    title: "Environmental Policy",
    description: "Environmental sustainability and corporate responsibility guidelines.",
    category: "workplace",
    compliance: "Global",
    icon: Globe,
    tags: ["environment", "sustainability", "responsibility"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-07"
  },
  {
    id: "intellectual-property",
    title: "IP Protection",
    description: "Intellectual property protection and trademark management policies.",
    category: "privacy",
    compliance: "Global",
    icon: Lock,
    tags: ["IP", "trademark", "protection"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-06"
  },
  {
    id: "financial-reporting",
    title: "Financial Reporting",
    description: "Financial reporting standards and accounting policy guidelines.",
    category: "finance",
    compliance: "Global",
    icon: DollarSign,
    tags: ["reporting", "accounting", "standards"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-05"
  },
  {
    id: "code-of-conduct",
    title: "Code of Conduct",
    description: "Employee code of conduct and ethical behavior guidelines.",
    category: "workplace",
    compliance: "Global",
    icon: Users,
    tags: ["conduct", "ethics", "behavior"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-04"
  },
  {
    id: "data-classification",
    title: "Data Classification",
    description: "Data classification schemes and handling procedures for sensitive information.",
    category: "data collection",
    compliance: "Global",
    icon: FileText,
    tags: ["classification", "sensitive", "handling"],
    difficulty: "Intermediate",
    lastUpdated: "2024-01-03"
  },
  {
    id: "procurement",
    title: "Procurement Policy",
    description: "Procurement processes and supplier evaluation criteria.",
    category: "finance",
    compliance: "Global",
    icon: Building,
    tags: ["procurement", "supplier", "evaluation"],
    difficulty: "Beginner",
    lastUpdated: "2024-01-02"
  }
];

const categories = [
  { id: "all", label: "All Categories", icon: BookOpen },
  { id: "data collection", label: "Data Collection", icon: FileText },
  { id: "workplace", label: "Workplace", icon: Users },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "finance", label: "Finance", icon: DollarSign }
];

const difficultyColors = {
  "Beginner": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Intermediate": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "Advanced": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

import { CommonModal } from "@/components/common/common-modal";

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const filteredPolicies = policies.filter(policy => {
    const matchesCategory = selectedCategory === "all" || policy.category === selectedCategory;
    const matchesSearch = policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         policy.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Policy Learning Center</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Access comprehensive policy templates, best practices, and regulatory guidelines.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPolicies.length} of {policies.length} policies
        </p>
      </div>

      {/* Policy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredPolicies.map((policy) => {
          const Icon = policy.icon;
          
          return (
            <Card 
              key={policy.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20 h-full flex flex-col"
            >
              <CardHeader className="pb-4 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${difficultyColors[policy.difficulty]}`}
                  >
                    {policy.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {policy.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 flex-grow flex flex-col">
                <CardDescription className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                  {policy.description}
                </CardDescription>
                
                <div className="space-y-3 mt-auto">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {policy.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {policy.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{policy.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Compliance and Last Updated */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {policy.compliance}
                    </span>
                    <span>Updated {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    View Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No policies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or category filters.
          </p>
        </div>
      )}
    {/* Policy Modal */}
    <CommonModal
      isOpen={!!selectedPolicy}
      onClose={() => setSelectedPolicy(null)}
      title={selectedPolicy?.title || ""}
      description={selectedPolicy?.description}
      maxWidth="lg"
      showCancel={true}
      cancelLabel="Close"
      actions={[]}
      showCloseButton={true}
    >
      {selectedPolicy && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <selectedPolicy.icon className="h-7 w-7 text-primary" />
            <span className="text-base font-semibold text-foreground">{selectedPolicy.compliance} Compliance</span>
            <span className={`ml-auto text-xs px-2 py-1 rounded ${difficultyColors[selectedPolicy.difficulty]}`}>{selectedPolicy.difficulty}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPolicy.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Last Updated:</strong> {new Date(selectedPolicy.lastUpdated).toLocaleDateString()}
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-foreground">Policy Overview</h4>
            <p className="leading-relaxed text-foreground">
              {selectedPolicy.description}
            </p>
            {/* Add more detailed content here if available */}
          </div>
        </div>
      )}
    </CommonModal>
    </div>
  );
}