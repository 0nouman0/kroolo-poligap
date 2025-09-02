import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  description: string;
  value: string;
  icon: LucideIcon;
  changeText: string;
  changeValue: string;
  isPositive?: boolean;
}

export default function StatsCard({
  title,
  description,
  value,
  icon: Icon,
  changeText,
  changeValue,
  isPositive = true,
}: StatsCardProps) {
  return (
    <Card className="gap-0 hover:scale-105 transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-13 font-medium">{title}</CardTitle>
        <CardDescription className="text-xs mb-1">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-l font-bold">{value}</div>
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <Icon className="mr-1 h-4 w-4" />
          <span
            className={`font-medium ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {changeValue}{" "}
          </span>
          &nbsp;{changeText}
        </div>
      </CardContent>
    </Card>
  );
} 