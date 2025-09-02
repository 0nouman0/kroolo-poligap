import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ActivityItem {
  id: string;
  search: string;
  timeAgo: string;
  results: string;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  // Default activities if none provided
  const defaultActivities: ActivityItem[] = Array.from({ length: 5 }).map(
    (_, i) => ({
      id: i.toString(),
      search: "Search: quarterly report data",
      timeAgo: "2 hours ago",
      results: "12 results",
    })
  );

  const displayActivities = activities || defaultActivities;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-13 text-primary">Recent Activity</CardTitle>
        <CardDescription className="text-xs text-secondary">
          Your recent searches and interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div>
                <div className="text-xs font-medium">{activity.search}</div>
                <div className="text-xs text-muted-foreground">
                  {activity.timeAgo}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {activity.results}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 