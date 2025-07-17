"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data - in a real app, this would come from MongoDB
const activities = [
  {
    id: "1",
    website: "Website 1",
    action: "Updated meta title",
    timestamp: "2 hours ago",
    user: "Admin",
    userInitials: "AD",
  },
  {
    id: "2",
    website: "Website 3",
    action: "Added 301 redirect",
    timestamp: "3 hours ago",
    user: "Admin",
    userInitials: "AD",
  },
  {
    id: "3",
    website: "Website 2",
    action: "Updated slug",
    timestamp: "5 hours ago",
    user: "Admin",
    userInitials: "AD",
  },
  {
    id: "4",
    website: "Website 5",
    action: "Published blog post",
    timestamp: "1 day ago",
    user: "Admin",
    userInitials: "AD",
  },
  {
    id: "5",
    website: "Website 4",
    action: "Uploaded new image",
    timestamp: "1 day ago",
    user: "Admin",
    userInitials: "AD",
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div className="flex items-center" key={activity.id}>
          <Avatar className="h-9 w-9">
            <AvatarFallback>{activity.userInitials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.website}
            </p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <div className="ml-auto font-medium text-sm text-muted-foreground">
            {activity.timestamp}
          </div>
        </div>
      ))}
    </div>
  );
}
