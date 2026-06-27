"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { X, User, Clock, FileText, Monitor, Copy, MoreVertical } from "lucide-react";
import type { EmailMessage } from "@/lib/types";

interface MessageViewProps {
  message: EmailMessage;
  onClose: () => void;
}

export function MessageView({ message, onClose }: MessageViewProps) {
  const [viewMode, setViewMode] = useState<"html" | "text">(
    message.body_html ? "html" : "text"
  );

  const handleCopySender = async () => {
    await navigator.clipboard.writeText(message.sender);
    toast.success("Sender copied!", { description: message.sender });
  };

  const handleCopyRecipient = async () => {
    await navigator.clipboard.writeText(message.recipient);
    toast.success("Recipient copied!", { description: message.recipient });
  };

  const handleCopySubject = async () => {
    await navigator.clipboard.writeText(message.subject);
    toast.success("Subject copied!", { description: message.subject });
  };

  const handleCopyBody = async () => {
    const text = viewMode === "html" ? message.body_text || "" : message.body_text || "";
    await navigator.clipboard.writeText(text);
    toast.success("Body copied!");
  };

  const handleCopyAll = async () => {
    const all = `From: ${message.sender}\nTo: ${message.recipient}\nSubject: ${message.subject}\n\n${message.body_text || ""}`;
    await navigator.clipboard.writeText(all);
    toast.success("Full message copied!");
  };

  return (
    <div className="h-full flex flex-col animate-[fade-in_0.2s_ease-out]">
      <div className="border-b px-4 sm:px-5 py-3 sm:py-4 flex items-start justify-between gap-3 shrink-0">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 sm:size-9 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-primary/25 to-primary/5 text-primary text-xs sm:text-sm font-semibold">
                {message.sender.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-semibold truncate leading-tight">
                {message.subject}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs text-muted-foreground ml-[42px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleCopySender} className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                  <User className="size-3" />
                  <span className="text-foreground/80 truncate max-w-28 sm:max-w-40">{message.sender}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy sender</TooltipContent>
            </Tooltip>
            <span className="inline-flex items-center gap-1">
              <span className="text-muted-foreground/50 hidden sm:inline">to</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleCopyRecipient} className="text-foreground/60 truncate max-w-24 sm:max-w-36 hover:text-foreground transition-colors cursor-pointer">
                    {message.recipient}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Copy recipient</TooltipContent>
              </Tooltip>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 shrink-0" />
              <span className="font-mono">
                {new Date(message.created_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="More options">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleCopySender}>
                <User className="size-4" />
                Copy sender
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyRecipient}>
                <Copy className="size-4" />
                Copy recipient
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopySubject}>
                <Copy className="size-4" />
                Copy subject
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyBody}>
                <FileText className="size-4" />
                Copy body
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyAll}>
                <Copy className="size-4" />
                Copy full message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {message.body_html && (
        <div className="border-b px-4 sm:px-5 py-2 shrink-0 overflow-x-auto">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "html" | "text")}>
            <TabsList className="h-8">
              <TabsTrigger value="html" className="text-xs gap-1.5 px-2.5 h-6">
                <Monitor className="size-3" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs gap-1.5 px-2.5 h-6">
                <FileText className="size-3" />
                Text
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-8">
        {viewMode === "html" && message.body_html ? (
          <div
            className="prose prose-invert prose-sm max-w-none [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary/30 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-border [&_blockquote]:border-l-primary [&_blockquote]:text-muted-foreground [&_code]:text-primary [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-card [&_pre]:border [&_pre]:border-border [&_hr]:border-border [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_td]:border [&_td]:border-border"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(message.body_html) }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-muted-foreground/90 leading-[1.7]">
            {message.body_text || (
              <span className="text-muted-foreground/50 italic">(empty)</span>
            )}
          </pre>
        )}
      </div>
    </div>
  );
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/on\w+=\w+/gi, "")
    .replace(/<base\b[^>]*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "");
}
