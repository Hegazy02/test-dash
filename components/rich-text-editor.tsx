"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Undo,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dir?: "ltr" | "rtl" | "auto";
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  dir = "auto",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [isInitialized, value]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const handleH2 = () => execCommand("formatBlock", "<h2>");
  const handleH3 = () => execCommand("formatBlock", "<h3>");
  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCommand("createLink", url);
  };
  const handleUnorderedList = () => execCommand("insertUnorderedList");
  const handleOrderedList = () => execCommand("insertOrderedList");
  const handleUndo = () => document.execCommand("undo");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;

    // Handle Enter key in lists
    if (e.key === "Enter") {
      if (parentElement?.tagName === "LI") {
        if (e.shiftKey) {
          // Insert line break on Shift+Enter
          document.execCommand("insertLineBreak");
          e.preventDefault();
        } else {
          // Normal Enter behavior in lists
          return;
        }
      }
    }

    // Handle Backspace in empty list item
    if (e.key === "Backspace" && parentElement?.tagName === "LI") {
      if (parentElement.textContent === "") {
        const list = parentElement.parentElement;
        if (list?.tagName === "UL" || list?.tagName === "OL") {
          list.removeChild(parentElement);
          if (list.children.length === 0) {
            list.remove();
          }
          e.preventDefault();
        }
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <TooltipProvider>
        <div className="flex flex-wrap gap-1 rounded-t-md border bg-muted/50 p-1">
          {/* Tooltip Buttons for Formatting */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleH2}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleH3}
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBold}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleItalic}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleLink}
              >
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Link</TooltipContent>
          </Tooltip>

          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleUnorderedList}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleOrderedList}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip> */}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleUndo}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div
        ref={editorRef}
        contentEditable
        dir={dir}
        className={cn(
          "min-h-[200px] rounded-b-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isFocused && "ring-2 ring-ring ring-offset-2",
        )}
        style={{
          unicodeBidi: "plaintext",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}
