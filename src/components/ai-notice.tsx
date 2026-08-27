import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export const RESPONSIBLE_AI_TEXT =
  "AI-generated content may contain errors or inaccuracies. Always review AI outputs before using them in workplace communications or making important decisions. Do not enter confidential, personal, or sensitive information.";

export function ResponsibleAINotice({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-warning-foreground",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className={cn("leading-relaxed", compact ? "text-xs" : "text-sm")}>
        <span className="font-semibold">Responsible AI: </span>
        {RESPONSIBLE_AI_TEXT}
      </p>
    </div>
  );
}
