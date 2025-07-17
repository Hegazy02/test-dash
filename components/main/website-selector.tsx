"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWebsiteStore } from "@/lib/store/website-store";

export function WebsiteSelector() {
  const [open, setOpen] = useState(false);
  const { websites, selectedWebsite, fetchWebsites, selectWebsite, isLoading } =
    useWebsiteStore();

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  if (isLoading) {
    return (
      <div className="mb-6 w-full">
        <Button variant="outline" disabled className="w-full justify-between">
          Loading websites...
        </Button>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="mb-6 w-full">
        <Button variant="outline" disabled className="w-full justify-between">
          No websites available
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedWebsite ? selectedWebsite.name : "Select website..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search website..." />
            <CommandList>
              <CommandEmpty>No website found.</CommandEmpty>
              <CommandGroup>
                {websites.map((website) => (
                  <CommandItem
                    key={website.id}
                    value={website.id}
                    onSelect={(websiteId) => {
                      selectWebsite(websiteId);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedWebsite?.id === website.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {website.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
