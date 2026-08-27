import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  CalendarCheck,
  LayoutDashboard,
  ListChecks,
  Mail,
  Menu,
  Search,
  Settings as SettingsIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import logo from "@/assets/workflow-logo.png";
import { ResponsibleAINotice } from "@/components/ai-notice";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/workspace-store";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: CalendarCheck },
  { to: "/tasks", label: "Task Planner", icon: ListChecks },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-3 py-1">
      <img
        src={logo}
        alt="AI WorkFlow logo"
        width={512}
        height={512}
        className="size-9 rounded-lg bg-sidebar-accent/60 p-1"
      />
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold text-sidebar-foreground">AI WorkFlow</p>
        <p className="text-xs text-sidebar-foreground/60">Workplace AI platform</p>
      </div>
    </div>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4">
      <Brand />
      <div className="flex-1 overflow-y-auto">
        <NavList onNavigate={onNavigate} />
      </div>
      <div className="rounded-xl bg-sidebar-accent/50 p-3 text-xs leading-relaxed text-sidebar-foreground/75">
        <p className="font-semibold text-sidebar-foreground">Review before you send</p>
        <p className="mt-1">
          Every output is AI-generated. Check facts and never paste confidential information.
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();
  const initials = settings.displayName.trim().slice(0, 2).toUpperCase() || "AW";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarInner />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarInner onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
            <p className="hidden truncate text-sm text-muted-foreground sm:block">{description}</p>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <div
              className="flex size-9 items-center justify-center rounded-full brand-gradient text-xs font-semibold text-primary-foreground"
              title={`${settings.displayName} · ${settings.role}`}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>

        <footer className="px-4 pb-8 md:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <ResponsibleAINotice compact />
          </div>
        </footer>
      </div>
    </div>
  );
}
