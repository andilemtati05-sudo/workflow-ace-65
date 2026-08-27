import { createFileRoute } from "@tanstack/react-router";
import { Save, Settings as SettingsIcon, Trash2, User } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActivity, useSettings, useTasks } from "@/lib/workspace-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI WorkFlow" },
      {
        name: "description",
        content: "Manage your AI WorkFlow profile, default email tone and workspace data.",
      },
      { property: "og:title", content: "Settings — AI WorkFlow" },
      {
        property: "og:description",
        content: "Personalise your AI WorkFlow experience and manage local workspace data.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const { setTasks } = useTasks();
  const { clearActivity } = useActivity();

  const [form, setForm] = useState(settings);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSettings(form);
  }

  function resetWorkspace() {
    if (confirm("This will delete all local tasks and activity history. Continue?")) {
      setTasks([]);
      clearActivity();
      window.localStorage.removeItem("aiworkflow.chat-messages");
    }
  }

  return (
    <AppShell title="Settings" description="Personalise your AI WorkFlow workspace">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4" /> Profile
              </CardTitle>
              <CardDescription>
                These details are used for greetings and planning. They stay in this browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={save} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input
                      id="displayName"
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      placeholder="Andile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      placeholder="Operations Lead"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingHours">Working hours</Label>
                  <Input
                    id="workingHours"
                    value={form.workingHours}
                    onChange={(e) => setForm((f) => ({ ...f, workingHours: e.target.value }))}
                    placeholder="08:30-17:00, Monday to Friday"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used by the AI Task Planner to schedule your day or week.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultTone">Default email tone</Label>
                  <Select
                    value={form.defaultTone}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        defaultTone: v as "formal" | "professional" | "friendly" | "persuasive",
                      }))
                    }
                  >
                    <SelectTrigger id="defaultTone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit">
                  <Save className="size-4" /> Save changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SettingsIcon className="size-4" /> Data
              </CardTitle>
              <CardDescription>
                AI WorkFlow stores tasks, activity and chat history locally in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={resetWorkspace}>
                <Trash2 className="size-4" /> Reset workspace data
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                This clears tasks, activity history and the assistant chat. It cannot be undone.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">About AI WorkFlow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              AI WorkFlow is a unified workplace productivity platform. Everything runs in your
              browser unless you connect a backend.
            </p>
            <p>
              AI outputs are generated from your input only. Always review before sending anything
              externally.
            </p>
            <p className="text-xs">
              Built with TanStack Start, React 19, Tailwind CSS and the Lovable AI Gateway.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
