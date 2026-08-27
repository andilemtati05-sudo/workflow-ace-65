import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Check,
  CheckCircle2,
  ListChecks,
  Plus,
  RefreshCw,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { CopyButton, OutputCard } from "@/components/output-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { planTasks, type PlannerResult } from "@/lib/ai.functions";
import { useActivity, useSettings, useTasks, type WorkTask } from "@/lib/workspace-store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI WorkFlow" },
      {
        name: "description",
        content:
          "Prioritise your day or week with AI-powered task scheduling, deadline-aware ordering and workload warnings.",
      },
      { property: "og:title", content: "AI Task Planner — AI WorkFlow" },
      {
        property: "og:description",
        content: "Turn your task list into a realistic schedule with reasons for every priority.",
      },
    ],
  }),
  component: TasksPage,
});

type Priority = "low" | "medium" | "high";

const emptyTask: Omit<WorkTask, "id" | "completed"> = {
  name: "",
  deadline: "",
  duration: "",
  importance: "medium",
  urgency: "medium",
};

function TasksPage() {
  const { settings } = useSettings();
  const { tasks, setTasks } = useTasks();
  const { logActivity } = useActivity();
  const run = useServerFn(planTasks);

  const [horizon, setHorizon] = useState<"day" | "week">("week");
  const [newTask, setNewTask] = useState(emptyTask);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlannerResult | null>(null);

  function addTask() {
    if (!newTask.name.trim()) return;
    const task: WorkTask = {
      ...newTask,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      completed: false,
    };
    setTasks((prev) => [task, ...prev]);
    setNewTask(emptyTask);
    setShowForm(false);
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  async function generatePlan() {
    if (tasks.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await run({
        data: {
          horizon,
          workingHours: settings.workingHours,
          tasks: tasks.map((t) => ({
            name: t.name,
            deadline: t.deadline,
            duration: t.duration,
            importance: t.importance,
            urgency: t.urgency,
          })),
        },
      });
      setResult(data);
      logActivity({
        kind: "planner",
        title: `${horizon === "day" ? "Day" : "Week"} plan — ${data.schedule.length} tasks`,
        preview: data.strategy.slice(0, 140),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const plainText = result
    ? [
        `STRATEGY\n${result.strategy}`,
        `SCHEDULE\n${result.schedule
          .map(
            (s) =>
              `${s.priority}. ${s.task}\n   Suggested: ${s.suggestedTime} | Due: ${s.deadline}\n   Why: ${s.reason}`,
          )
          .join("\n\n")}`,
        result.warnings.length ? `WARNINGS\n${result.warnings.map((w) => `- ${w}`).join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    : "";

  const done = tasks.filter((t) => t.completed).length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <AppShell
      title="AI Task Planner"
      description="Build a realistic, deadline-aware schedule from your workload"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Your tasks</CardTitle>
            <CardDescription>
              Add what you need to get done. The AI will order them around your working hours and
              deadlines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                {done}/{tasks.length} complete · {completion}%
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
                <Plus className="size-4" /> Add task
              </Button>
            </div>

            {showForm ? (
              <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-3">
                <div className="space-y-2">
                  <Label htmlFor="task-name">Task name</Label>
                  <Input
                    id="task-name"
                    value={newTask.name}
                    onChange={(e) => setNewTask((t) => ({ ...t, name: e.target.value }))}
                    placeholder="Draft Q3 operations report"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="task-deadline">Deadline</Label>
                    <Input
                      id="task-deadline"
                      type="date"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask((t) => ({ ...t, deadline: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-duration">Estimated duration</Label>
                    <Input
                      id="task-duration"
                      value={newTask.duration}
                      onChange={(e) => setNewTask((t) => ({ ...t, duration: e.target.value }))}
                      placeholder="2h"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="task-importance">Importance</Label>
                    <Select
                      value={newTask.importance}
                      onValueChange={(v) =>
                        setNewTask((t) => ({ ...t, importance: v as Priority }))
                      }
                    >
                      <SelectTrigger id="task-importance">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-urgency">Urgency</Label>
                    <Select
                      value={newTask.urgency}
                      onValueChange={(v) => setNewTask((t) => ({ ...t, urgency: v as Priority }))}
                    >
                      <SelectTrigger id="task-urgency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                    <X className="size-4" /> Cancel
                  </Button>
                  <Button size="sm" onClick={addTask} disabled={!newTask.name.trim()}>
                    <Check className="size-4" /> Save
                  </Button>
                </div>
              </div>
            ) : null}

            {tasks.length === 0 ? (
              <EmptyState
                icon={<ListChecks className="size-6" />}
                title="No tasks yet"
                description="Add a few tasks, then ask the AI to build your day or week plan."
              />
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      aria-label={`Mark ${task.name} as ${task.completed ? "incomplete" : "complete"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          task.completed
                            ? "text-sm line-through text-muted-foreground"
                            : "text-sm font-medium"
                        }
                      >
                        {task.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {task.deadline ? <span>Due {task.deadline}</span> : null}
                        {task.duration ? <span>· {task.duration}</span> : null}
                        <Badge variant="outline" className="text-[10px]">
                          I: {task.importance}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          U: {task.urgency}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => removeTask(task.id)}
                      aria-label={`Remove ${task.name}`}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              <Label htmlFor="horizon">Plan horizon</Label>
              <Select
                value={horizon}
                onValueChange={(v) => setHorizon(v as "day" | "week")}
              >
                <SelectTrigger id="horizon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                disabled={tasks.length === 0 || loading}
                onClick={generatePlan}
              >
                <Wand2 className="size-4" />
                {loading ? "Planning…" : `Plan my ${horizon === "day" ? "day" : "week"}`}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          {loading ? <LoadingState label="Building your schedule…" /> : null}
          {!loading && error ? <ErrorState message={error} onRetry={generatePlan} /> : null}
          {!loading && !error && !result ? (
            <EmptyState
              icon={<CheckCircle2 className="size-6" />}
              title="Your AI plan will appear here"
              description="Add tasks on the left and generate a plan to see a prioritised schedule with reasons for each slot."
            />
          ) : null}

          {!loading && result ? (
            <OutputCard
              title={`${horizon === "day" ? "Day" : "Week"} plan`}
              description={result.strategy}
              actions={
                <>
                  <CopyButton value={plainText} label="Copy plan" />
                  <Button size="sm" variant="outline" onClick={generatePlan}>
                    <RefreshCw className="size-4" /> Regenerate
                  </Button>
                </>
              }
            >
              {result.warnings.length ? (
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                  <p className="text-sm font-semibold text-warning-foreground">Heads up</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-warning-foreground/90">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="space-y-3">
                {result.schedule.map((item) => (
                  <div key={item.priority} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                          {item.priority}
                        </span>
                        <p className="text-sm font-medium">{item.task}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {item.suggestedTime}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Deadline: {item.deadline}</p>
                  </div>
                ))}
              </div>
            </OutputCard>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
