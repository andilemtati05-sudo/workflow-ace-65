import { useCallback, useEffect, useState } from "react";

/** Browser-local workspace state for AI WorkFlow (no backend storage). */

export type ActivityKind = "email" | "meeting" | "planner" | "research" | "chat";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  preview: string;
  createdAt: string;
};

export type WorkTask = {
  id: string;
  name: string;
  deadline: string;
  duration: string;
  importance: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  completed: boolean;
};

export type Settings = {
  displayName: string;
  role: string;
  workingHours: string;
  defaultTone: "formal" | "professional" | "friendly" | "persuasive";
};

const KEYS = {
  activity: "aiworkflow.activity",
  tasks: "aiworkflow.tasks",
  settings: "aiworkflow.settings",
} as const;

export const DEFAULT_SETTINGS: Settings = {
  displayName: "Andile",
  role: "Operations Lead",
  workingHours: "08:30-17:00, Monday to Friday",
  defaultTone: "professional",
};

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const hoursAgo = (n: number) => new Date(Date.now() - n * 3600_000).toISOString();

export const SAMPLE_TASKS: WorkTask[] = [
  {
    id: "t1",
    name: "Finalise Q3 operations report",
    deadline: daysFromNow(2),
    duration: "3h",
    importance: "high",
    urgency: "high",
    completed: false,
  },
  {
    id: "t2",
    name: "Review supplier contract renewal",
    deadline: daysFromNow(5),
    duration: "1h 30m",
    importance: "high",
    urgency: "medium",
    completed: false,
  },
  {
    id: "t3",
    name: "Prepare onboarding pack for new analyst",
    deadline: daysFromNow(7),
    duration: "2h",
    importance: "medium",
    urgency: "low",
    completed: false,
  },
  {
    id: "t4",
    name: "Send weekly stakeholder update",
    deadline: daysFromNow(1),
    duration: "45m",
    importance: "medium",
    urgency: "high",
    completed: true,
  },
];

export const SAMPLE_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    kind: "email",
    title: "Project delay notice to client",
    preview: "Professional tone email explaining the revised delivery window and next steps.",
    createdAt: hoursAgo(3),
  },
  {
    id: "a2",
    kind: "meeting",
    title: "Weekly operations sync",
    preview: "5 key points, 2 decisions, 4 action items with owners and deadlines.",
    createdAt: hoursAgo(21),
  },
  {
    id: "a3",
    kind: "research",
    title: "Hybrid work policy trade-offs",
    preview: "Benefits, risks and recommended next actions for the leadership review.",
    createdAt: hoursAgo(28),
  },
  {
    id: "a4",
    kind: "planner",
    title: "Week plan — 6 tasks scheduled",
    preview: "Deadline-driven ordering with buffer time on Thursday afternoon.",
    createdAt: hoursAgo(50),
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return { value, setValue: update, hydrated };
}

export function useActivity() {
  const { value, setValue, hydrated } = useLocalState<ActivityItem[]>(
    KEYS.activity,
    SAMPLE_ACTIVITY,
  );

  const logActivity = useCallback(
    (item: Omit<ActivityItem, "id" | "createdAt">) => {
      setValue((prev) =>
        [
          {
            ...item,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 30),
      );
    },
    [setValue],
  );

  const clearActivity = useCallback(() => setValue([]), [setValue]);

  return { activity: value, logActivity, clearActivity, hydrated };
}

export function useTasks() {
  const { value, setValue, hydrated } = useLocalState<WorkTask[]>(KEYS.tasks, SAMPLE_TASKS);
  return { tasks: value, setTasks: setValue, hydrated };
}

export function useSettings() {
  const { value, setValue, hydrated } = useLocalState<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  return { settings: value, setSettings: setValue, hydrated };
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
