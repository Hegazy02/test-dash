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

interface WebsiteSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function WebsiteSelector({ value, onChange }: WebsiteSelectorProps) {
  const [open, setOpen] = useState(false);
  const { websites, selectedWebsite, fetchWebsites, selectWebsite, isLoading } =
    useWebsiteStore();

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  // Set the first website as default if none is selected
  useEffect(() => {
    if (!value && websites.length > 0) {
      onChange(websites[0].id);
    }
  }, [websites, value, onChange]);

  // Update the selected website in the store when the value changes
  useEffect(() => {
    if (value) {
      selectWebsite(value);
    }
  }, [value, selectWebsite]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading
            ? "Loading websites..."
            : value
              ? websites.find((website) => website.id === value)?.name ||
                "Select website..."
              : "Select website..."}
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
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === website.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {website.name} ({website.domain})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
