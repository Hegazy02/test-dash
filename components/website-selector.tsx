"use client";

import { useEffect } from "react";
import { useWebsiteStore } from "@/lib/store/website-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export function WebsiteSelector() {
  const { websites, selectedWebsite, fetchWebsites, selectWebsite } =
    useWebsiteStore();

  useEffect(() => {
    if (websites.length === 0) {
      fetchWebsites();
    }
  }, [websites.length, fetchWebsites]);

  return (
    <Card>
      <CardContent className="py-4">
        <Select
          value={selectedWebsite?.id}
          onValueChange={(value) => selectWebsite(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a website" />
          </SelectTrigger>
          <SelectContent>
            {websites.map((website) => (
              <SelectItem key={website.id} value={website.id}>
                {website.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
