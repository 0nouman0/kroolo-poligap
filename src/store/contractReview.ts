"use client";

import { create } from "zustand";
import { extractTextFromPdf } from "@/lib/pdf";

export type StructuredDoc = {
  title: string;
  meta: {
    counterparties?: string[];
    effectiveDate?: string;
    governingLaw?: string;
  };
  sections: Array<{
    key: string;
    title: string;
    paragraphs: string[];
  }>;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  location?: string; // section key or hint
  resolved: boolean;
  fix: (doc: StructuredDoc) => StructuredDoc;
};

function toBoilerplate(raw: string): StructuredDoc {
  // Normalize whitespace but preserve sentence boundaries
  const text = raw
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .trim();

  // Extract lightweight metadata when present
  const titleMatch = text.match(/(service|software|master|consulting|license)\s+agreement/i);
  const partiesMatch = text.match(/between\s+(.+?)\s+and\s+(.+?)(?:[\.,;]|\s)/i);
  const effectiveMatch = text.match(/effective\s+date\s*[:\-]?\s*(\w+\s+\d{1,2},\s*\d{4}|\d{4}-\d{2}-\d{2})/i);

  const parties = partiesMatch ? [partiesMatch[1].trim(), partiesMatch[2].trim()] : undefined;
  const effectiveDate = effectiveMatch ? effectiveMatch[1] : undefined;

  // Split into sentences and paragraphs
  const sentences = text.split(/(?<=[\.!?])\s+(?=[A-Z0-9\[\(])/).map((s) => s.trim());
  const paragraphize = (arr: string[], maxPerPara = 4) => {
    const paras: string[] = [];
    for (let i = 0; i < arr.length; i += maxPerPara) {
      paras.push(arr.slice(i, i + maxPerPara).join(" "));
    }
    return paras;
  };

  // Map sentences to canonical sections via keyword heuristics; keep most of the content
  type BucketKey =
    | "intro"
    | "definitions"
    | "scope"
    | "fees"
    | "term"
    | "confidentiality"
    | "ip"
    | "warranty"
    | "indemnity"
    | "liability"
    | "law"
    | "compliance"
    | "privacy"
    | "misc";
  const buckets: Record<BucketKey, string[]> = {
    intro: [],
    definitions: [],
    scope: [],
    fees: [],
    term: [],
    confidentiality: [],
    ip: [],
    warranty: [],
    indemnity: [],
    liability: [],
    law: [],
    compliance: [],
    privacy: [],
    misc: [],
  };

  const assign = (s: string) => {
    const l = s.toLowerCase();
    if (/scope|services?|deliverables?|sla|statement\s+of\s+work/.test(l)) return buckets.scope.push(s);
    if (/fee|payment|invoice|billing|price|consideration/.test(l)) return buckets.fees.push(s);
    if (/term|termination|expire|renew/.test(l)) return buckets.term.push(s);
    if (/confidential|non\-disclosure|nda|trade\s+secret/.test(l)) return buckets.confidentiality.push(s);
    if (/(intellectual\s+property|ip|ownership|license)/.test(l)) return buckets.ip.push(s);
    if (/representations?|warrant(y|ies)|as\s+is/.test(l)) return buckets.warranty.push(s);
    if (/indemnif(y|ication)|hold\s+harmless|defend/.test(l)) return buckets.indemnity.push(s);
    if (/limitation\s+of\s+liability|consequential|indirect\s+damages/.test(l)) return buckets.liability.push(s);
    if (/governing\s+law|venue|jurisdiction/.test(l)) return buckets.law.push(s);
    if (/compliance|regulation|lawful|anti\-bribery|sanctions/.test(l)) return buckets.compliance.push(s);
    if (/privacy|personal\s+data|gdpr|hipaa/.test(l)) return buckets.privacy.push(s);
    if (/definition|means\s+/.test(l)) return buckets.definitions.push(s);
    if (/agreement\s+is\s+made|between\s+.*\s+and\s+/.test(l)) return buckets.intro.push(s);
    return buckets.misc.push(s);
  };
  sentences.forEach(assign);

  const sectionMeta = [
    { key: "intro", title: "Introduction" },
    { key: "definitions", title: "Definitions" },
    { key: "scope", title: "Scope of Services" },
    { key: "fees", title: "Fees and Payment" },
    { key: "term", title: "Term and Termination" },
    { key: "confidentiality", title: "Confidentiality" },
    { key: "ip", title: "Intellectual Property" },
    { key: "warranty", title: "Representations and Warranties" },
    { key: "indemnity", title: "Indemnification" },
    { key: "liability", title: "Limitation of Liability" },
    { key: "privacy", title: "Data Protection and Privacy" },
    { key: "compliance", title: "Compliance" },
    { key: "law", title: "Governing Law" },
    { key: "misc", title: "Miscellaneous" },
  ] as const;

  // Rough target length for 1–3 pages depending on viewport; retain large portion of content
  const MAX_SENTENCES = Math.min(Math.max(sentences.length, 80), 300);

  const sections = sectionMeta.map((m) => {
    const pool = buckets[m.key as BucketKey];
    const selected = pool.slice(0, Math.ceil((pool.length / sentences.length) * MAX_SENTENCES) || pool.length);
    const paragraphs = paragraphize(selected.length ? selected : pool, 4).filter((p) => p && p.trim().length > 0);
    return { key: m.key, title: m.title, paragraphs };
  });

  return {
    title: titleMatch ? titleMatch[0] : "Standardized Agreement",
    meta: {
      counterparties: parties,
      effectiveDate,
    },
    sections,
  };
}

function detectIssues(doc: StructuredDoc): Issue[] {
  const issues: Issue[] = [];

  // Issue: best efforts phrasing
  const hasBestEfforts = doc.sections.some((s) => s.paragraphs.join(" ").match(/best\s+efforts/i));
  if (hasBestEfforts) {
    issues.push({
      id: "best-efforts",
      title: "Ambiguous 'best efforts' phrasing",
      description: "Replace 'best efforts' with 'commercially reasonable efforts' to clarify obligations.",
      location: "misc",
      resolved: false,
      fix: (d) => ({
        ...d,
        sections: d.sections.map((s) => ({
          ...s,
          paragraphs: s.paragraphs.map((p) => p.replace(/best\s+efforts/gi, "commercially reasonable efforts")),
        })),
      }),
    });
  }

  // Issue: missing governing law
  const lawSec = doc.sections.find((s) => s.key === "law");
  const hasLaw = lawSec && lawSec.paragraphs.length > 0;
  if (!hasLaw) {
    issues.push({
      id: "governing-law-missing",
      title: "Missing Governing Law section",
      description: "Add a standard governing law clause (placeholder: Delaware).",
      location: "law",
      resolved: false,
      fix: (d) => ({
        ...d,
        meta: { ...d.meta, governingLaw: d.meta.governingLaw || "Delaware" },
        sections: d.sections.map((s) =>
          s.key === "law"
            ? {
                ...s,
                paragraphs: [
                  "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.",
                ],
              }
            : s
        ),
      }),
    });
  }

  // Issue: missing confidentiality content
  const conf = doc.sections.find((s) => s.key === "confidentiality");
  if (!conf || conf.paragraphs.length === 0) {
    issues.push({
      id: "confidentiality-missing",
      title: "Missing Confidentiality section",
      description: "Insert a baseline confidentiality clause.",
      location: "confidentiality",
      resolved: false,
      fix: (d) => ({
        ...d,
        sections: d.sections.map((s) =>
          s.key === "confidentiality"
            ? {
                ...s,
                paragraphs: [
                  "Each party agrees to keep confidential and not disclose any non-public information received from the other party, except as required by law or with prior written consent.",
                ],
              }
            : s
        ),
      }),
    });
  }

  // Issue: overbroad indemnity
  const indemnity = doc.sections.find((s) => s.key === "indemnity");
  const overbroad = indemnity && indemnity.paragraphs.join(" ").match(/indemnif(y|ies)\s+.*?from\s+all\s+claims/i);
  if (overbroad) {
    issues.push({
      id: "indemnity-overbroad",
      title: "Overbroad indemnification",
      description: "Limit indemnity to third-party claims arising from breach, negligence, or willful misconduct.",
      location: "indemnity",
      resolved: false,
      fix: (d) => ({
        ...d,
        sections: d.sections.map((s) =>
          s.key === "indemnity"
            ? {
                ...s,
                paragraphs: [
                  "Each party shall indemnify, defend, and hold harmless the other party from third-party claims to the extent arising from its breach of this Agreement, negligence, or willful misconduct.",
                ],
              }
            : s
        ),
      }),
    });
  }

  // Issue: Termination missing
  const term = doc.sections.find((s) => s.key === "term");
  if (!term || term.paragraphs.length === 0) {
    issues.push({
      id: "termination-missing",
      title: "Missing termination clause",
      description: "Add standard termination for convenience and for cause.",
      location: "term",
      resolved: false,
      fix: (d) => ({
        ...d,
        sections: d.sections.map((s) =>
          s.key === "term"
            ? {
                ...s,
                paragraphs: [
                  "This Agreement commences on the Effective Date and continues unless terminated. Either party may terminate for material breach not cured within 30 days' notice. Either party may also terminate for convenience upon 30 days' written notice.",
                ],
              }
            : s
        ),
      }),
    });
  }

  return issues;
}

type StoreState = {
  isLoading: boolean;
  rawText: string | null;
  structuredDoc: StructuredDoc | null;
  issues: Issue[];
  error: string | null;
  ingestPdf: (file: File) => Promise<void>;
  applyFix: (issueId: string) => void;
};

export const useContractReviewStore = create<StoreState>((set, get) => ({
  isLoading: false,
  rawText: null,
  structuredDoc: null,
  issues: [],
  error: null,
  ingestPdf: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const text = await extractTextFromPdf(file);
      const doc = toBoilerplate(text);
      const issues = detectIssues(doc);
      set({ rawText: text, structuredDoc: doc, issues, error: null });
    } catch (e) {
      console.error("PDF ingestion failed", e);
      const message = e instanceof Error ? e.message : "Failed to parse PDF";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
  applyFix: (issueId: string) => {
    const { structuredDoc, issues } = get();
    if (!structuredDoc) return;
    const issue = issues.find((i) => i.id === issueId);
    if (!issue || issue.resolved) return;
    const updated = issue.fix(structuredDoc);
    const nextIssues = issues.map((i) => (i.id === issueId ? { ...i, resolved: true } : i));
    set({ structuredDoc: updated, issues: nextIssues });
  },
}));
