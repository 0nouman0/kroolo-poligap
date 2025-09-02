import { BarChart3, LineChart, PieChart } from "lucide-react";
import StatsCard from "./StatsCard";

export default function StatsGrid() {
  const statsData = [
    {
      title: "Total Searches",
      description: "Monthly searches",
      value: "2,345",
      icon: BarChart3,
      changeValue: "+12.5%",
      changeText: "from last month",
      isPositive: true,
    },
    {
      title: "Active Chats",
      description: "Weekly active chats",
      value: "189",
      icon: LineChart,
      changeValue: "+5.2%",
      changeText: "from last week",
      isPositive: true,
    },
    {
      title: "Knowledge Base",
      description: "Total documents",
      value: "1,024",
      icon: PieChart,
      changeValue: "+8",
      changeText: "documents this week",
      isPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statsData.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
} 