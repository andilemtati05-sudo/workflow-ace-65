import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ListChecks,
  Mail,
  Search,
  Sparkle,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { relativeTime, useActivity, useSettings, useTasks } from "@/lib/workspace-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI WorkFlow" },
      {
        name: "description",
        content:
          "Your AI workplace productivity overview: recent AI activity, task progress and quick access to every AI WorkFlow tool.",
      },
      { property: "og:title", content: "Dashboard — AI WorkFlow" },
      {
        property: "og:description",
        content: "One unified AI workplace assistant for email, meetings, planning and research.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    body: "Turn a purpose and a few key points into a polished, on-tone email.",
  },
  {
    to: "/meetings",
    icon: CalendarCheck,
    title: "Meeting Notes Summarizer",
    body: "Convert messy notes into summaries, decisions and owned action items.",
  },
  {
    to: "/tasks",
    icon: ListChecks,
    title: "AI Task Planner",
    body: "Order your workload into a realistic day or week with reasons for each priority.",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    body: "Get a structured briefing with insights, risks and recommended next actions.",
  },
  {
    to: "/assistant",
    icon: Bot,
    title: "AI Workplace Assistant",
    body: "Chat through writing, planning and preparation, then jump into the right tool.",
  },
] as const;

const KIND_LABEL: Record<string, string> = {
  email: "Email",
  meeting: "Meeting",
  planner: "Planner",
  research: "Research",
  chat: "Assistant",
};

function Dashboard() {
  const { settings } = useSettings();
  const { tasks } = useTasks();
  const { activity } = useActivity();

  const done = tasks.filter((t) => t.completed).length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const dueSoon = tasks.filter(
    (t) => !t.completed && t.deadline && new Date(t.deadline).getTime() - Date.now() < 3 * 86400000,
  );
  const generatedThisWeek = activity.filter(
    (a) => Date.now() - new Date(a.createdAt).getTime() < 7 * 86400000,
  ).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell
      title="Dashboard"
      description="Your unified AI workplace productivity overview"
      actions={
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/assistant">
            <Bot className="size-4" /> Ask the assistant
          </Link>
        </Button>
      }
    >
      <section className="overflow-hidden rounded-2xl brand-gradient p-6 text-primary-foreground md:p-8">
        <Badge className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
          <Sparkle className="size-3" /> One platform, five AI tools
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
          {greeting}, {settings.displayName}.
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-primary-foreground/85 md:text-base">
          Draft the email, summarise the meeting, plan the week and research the decision — without
          leaving AI WorkFlow. Start with a quick action below.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to="/email">
              <Mail className="size-4" /> Draft an email
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to="/meetings">
              <CalendarCheck className="size-4" /> Summarise notes
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to="/tasks">
              <ListChecks className="size-4" /> Plan my week
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to="/research">
              <Search className="size-4" /> Research a topic
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="Tasks completed"
          value={`${done}/${tasks.length}`}
          hint={`${completion}% of your current workload`}
          progress={completion}
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Due within 3 days"
          value={String(dueSoon.length)}
          hint={dueSoon[0] ? `Next: ${dueSoon[0].name}` : "Nothing urgent right now"}
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="AI outputs this week"
          value={String(generatedThisWeek)}
          hint="Across all five workplace tools"
        />
        <StatCard
          icon={<Sparkle className="size-4" />}
          label="Default tone"
          value={settings.defaultTone}
          hint="Change it in Settings"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Your AI toolkit</CardTitle>
            <CardDescription>
              Five connected tools that share your workspace context and history.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="font-medium">{tool.title}</span>
                  <span className="text-sm text-muted-foreground">{tool.body}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task overview</CardTitle>
            <CardDescription>Tracked locally in this browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 ? (
              <EmptyState
                title="No tasks yet"
                description="Add tasks in the AI Task Planner to see them here."
              />
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p
                      className={
                        task.completed
                          ? "truncate text-sm line-through text-muted-foreground"
                          : "truncate text-sm font-medium"
                      }
                    >
                      {task.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Due {task.deadline || "—"}</p>
                  </div>
                  <Badge variant={task.importance === "high" ? "default" : "secondary"}>
                    {task.importance}
                  </Badge>
                </div>
              ))
            )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/tasks">Open task planner</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent AI activity</CardTitle>
            <CardDescription>Recently generated content across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <EmptyState
                title="No AI activity yet"
                description="Generate an email, summary, plan or briefing and it will appear here."
              />
            ) : (
              activity.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{KIND_LABEL[item.kind] ?? item.kind}</Badge>
                      <p className="truncate text-sm font-medium">{item.title}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.preview}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeTime(item.createdAt)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  progress?: number;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-primary">{icon}</span>
          {label}
        </div>
        <p className="font-display text-2xl font-semibold capitalize">{value}</p>
        {typeof progress === "number" ? <Progress value={progress} className="h-1.5" /> : null}
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
