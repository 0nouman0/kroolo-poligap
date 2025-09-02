import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const stats = [
  {
    value: "82%",
    title: "Third-Party Risk",
    description:
      "of compliance leaders faced third-party risk consequences in the past year.",
    source: "Gartner 2025",
  },
  {
    value: "50%",
    title: "Responsible AI Regulation",
    description:
      "of governments will enforce responsible AI regulations by 2026.",
    source: "Gartner 2024",
  },
  {
    value: "Critical",
    title: "AI Governance",
    description:
      "Effective AI governance and risk management are key to avoid project failures and reputational damage.",
    source: "Gartner 2024",
  },
];

export default function BentoStatsSection() {
  return (
    <section className="w-full flex flex-col items-center py-8">
      <div className="max-w-xl w-full grid gap-6">
        {stats.map((stat, idx) => (
          <Card
            key={stat.title}
            className={`flex flex-row items-center gap-6 p-6 shadow-lg rounded-2xl border-l-8 border-primary bg-gradient-to-br from-muted/80 to-background/80 ${
              idx === 0
                ? "animate-fade-in"
                : idx === 1
                ? "animate-slide-in"
                : "animate-fade-in"
            }`}
          >
            <div className="flex-shrink-0 text-primary text-4xl font-extrabold drop-shadow-lg">
              {stat.value}
            </div>
            <div>
              <CardHeader className="p-0 mb-1">
                <CardTitle className="text-lg font-bold mb-1">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardDescription className="mb-1 text-base">
                {stat.description}
              </CardDescription>
              <span className="text-xs text-muted-foreground italic">
                ({stat.source})
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
