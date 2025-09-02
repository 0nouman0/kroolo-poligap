import { StatsGrid, RecentActivity } from "./components";
import Link from "next/link";

export default async function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="base-heading">Dashboard</h1>
      <StatsGrid />

      <div className="mt-4">
        <RecentActivity />
      </div>
    </div>
  );
}
