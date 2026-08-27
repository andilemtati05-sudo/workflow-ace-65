import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck, RefreshCw, Wand2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { BulletList, CopyButton, ExampleHint, OutputCard } from "@/components/output-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting, type MeetingResult } from "@/lib/ai.functions";
import { useActivity } from "@/lib/workspace-store";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI WorkFlow" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into an executive summary, key points, decisions, owned action items and follow-up questions.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — AI WorkFlow" },
      {
        property: "og:description",
        content: "Structured meeting records with owners and deadlines, generated in seconds.",
      },
    ],
  }),
  component: MeetingsPage,
});

const SAMPLE = `Ops sync 14 March, attendees: Andile, Thandi, Sipho, Lerato.
Sipho: warehouse scanner rollout is 2 weeks behind, vendor firmware issue.
Lerato: Q1 returns up 8% vs Q4, mostly courier damage.
Decision: pause scanner rollout until vendor confirms firmware fix.
Decision: move to new courier for fragile items from 1 April.
Thandi to draft courier comparison by 21 March.
Andile to update the exec deck before Friday.
Open question: does the new courier cover rural routes?`;

function MeetingsPage() {
  const { logActivity } = useActivity();
  const run = useServerFn(summarizeMeeting);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingResult | null>(null);

  const canRun = notes.trim().length > 40;

  async function generate() {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    try {
      const data = await run({ data: { notes } });
      setResult(data);
      logActivity({
        kind: "meeting",
        title: "Meeting summary",
        preview: data.executiveSummary.slice(0, 140),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const plainText = result
    ? [
        `EXECUTIVE SUMMARY\n${result.executiveSummary}`,
        `KEY POINTS\n${result.keyPoints.map((p) => `- ${p}`).join("\n")}`,
        `DECISIONS\n${result.decisions.map((p) => `- ${p}`).join("\n")}`,
        `ACTION ITEMS\n${result.actionItems
          .map((a) => `- ${a.task} — ${a.owner} — due ${a.deadline}`)
          .join("\n")}`,
        `FOLLOW-UP QUESTIONS\n${result.followUpQuestions.map((p) => `- ${p}`).join("\n")}`,
      ].join("\n\n")
    : "";

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      description="Raw notes in, structured meeting record out"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Paste your notes</CardTitle>
            <CardDescription>
              Messy, abbreviated notes are fine. Owners and deadlines are only assigned when your
              notes state them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Meeting notes</Label>
              <Textarea
                id="notes"
                rows={16}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste the full notes or transcript here…"
              />
              <ExampleHint>
                Include attendees, what was discussed, what was decided and who committed to what.
              </ExampleHint>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={!canRun || loading} onClick={generate}>
                <Wand2 className="size-4" />
                {loading ? "Summarising…" : "Summarise meeting"}
              </Button>
              <Button variant="outline" onClick={() => setNotes(SAMPLE)} disabled={loading}>
                Load example
              </Button>
            </div>
            {!canRun ? (
              <p className="text-xs text-muted-foreground">
                Paste at least a short paragraph of notes to enable summarising.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          {loading ? <LoadingState label="Structuring your meeting record…" /> : null}
          {!loading && error ? <ErrorState message={error} onRetry={generate} /> : null}
          {!loading && !error && !result ? (
            <EmptyState
              icon={<CalendarCheck className="size-6" />}
              title="No summary yet"
              description="Paste notes and summarise to get an executive summary, decisions and action items with owners."
            />
          ) : null}

          {!loading && result ? (
            <OutputCard
              title="Meeting record"
              actions={
                <>
                  <CopyButton value={plainText} label="Copy record" />
                  <Button size="sm" variant="outline" onClick={generate}>
                    <RefreshCw className="size-4" /> Regenerate
                  </Button>
                </>
              }
            >
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Executive summary</h3>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {result.executiveSummary}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Key discussion points</h3>
                <BulletList items={result.keyPoints} empty="No distinct discussion points found." />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Decisions</h3>
                <BulletList items={result.decisions} empty="No decisions were recorded." />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Action items</h3>
                {result.actionItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No action items were recorded.</p>
                ) : (
                  <div className="grid gap-3">
                    {result.actionItems.map((item, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="text-sm font-medium">{item.task}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">Owner: {item.owner}</Badge>
                          <Badge variant="outline">Due: {item.deadline}</Badge>
                        </div>
                        {item.notes ? (
                          <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Follow-up questions</h3>
                <BulletList
                  items={result.followUpQuestions}
                  empty="No open questions were identified."
                />
              </section>
            </OutputCard>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
