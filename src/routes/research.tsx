import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw, Search, Wand2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { BulletList, CopyButton, ExampleHint, OutputCard } from "@/components/output-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { runResearch, type ResearchResult } from "@/lib/ai.functions";
import { useActivity } from "@/lib/workspace-store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI WorkFlow" },
      {
        name: "description",
        content:
          "Generate structured workplace briefings with insights, benefits, risks, recommendations and follow-up questions.",
      },
      { property: "og:title", content: "AI Research Assistant — AI WorkFlow" },
      {
        property: "og:description",
        content: "Decision-ready research briefings for workplace topics and questions.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const { logActivity } = useActivity();
  const run = useServerFn(runResearch);

  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const canRun = topic.trim().length > 5;

  async function generate() {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    try {
      const data = await run({ data: { topic, context } });
      setResult(data);
      logActivity({
        kind: "research",
        title: `Research: ${topic.slice(0, 50)}`,
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
        `KEY INSIGHTS\n${result.keyInsights.map((p) => `- ${p}`).join("\n")}`,
        `BENEFITS\n${result.benefits.map((p) => `- ${p}`).join("\n")}`,
        `RISKS\n${result.risks.map((p) => `- ${p}`).join("\n")}`,
        `RECOMMENDATIONS\n${result.recommendations.map((p) => `- ${p}`).join("\n")}`,
        `FURTHER QUESTIONS\n${result.furtherQuestions.map((p) => `- ${p}`).join("\n")}`,
      ].join("\n\n")
    : "";

  return (
    <AppShell
      title="AI Research Assistant"
      description="Turn a topic or question into a structured decision-ready briefing"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Research brief</CardTitle>
            <CardDescription>
              The AI analyses general knowledge only. It will flag anything that needs real-world
              verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or question</Label>
              <Textarea
                id="topic"
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Should we switch to a four-day work week?"
              />
              <ExampleHint>What are the trade-offs of moving our customer support to AI chatbots?</ExampleHint>
            </div>

            <div className="space-y-2">
              <Label htmlFor="research-context">Context (optional)</Label>
              <Textarea
                id="research-context"
                rows={5}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="We are a 60-person logistics company. Decision deadline is end of quarter. Budget is constrained."
              />
              <ExampleHint>
                Include your team size, industry, constraints and what the decision depends on.
              </ExampleHint>
            </div>

            <Button disabled={!canRun || loading} onClick={generate}>
              <Wand2 className="size-4" />
              {loading ? "Researching…" : "Generate briefing"}
            </Button>
            {!canRun ? (
              <p className="text-xs text-muted-foreground">
                Enter a topic or question to start researching.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          {loading ? <LoadingState label="Building your briefing…" /> : null}
          {!loading && error ? <ErrorState message={error} onRetry={generate} /> : null}
          {!loading && !error && !result ? (
            <EmptyState
              icon={<Search className="size-6" />}
              title="No briefing yet"
              description="Enter a topic and generate to get a structured briefing with insights, benefits, risks and recommendations."
            />
          ) : null}

          {!loading && result ? (
            <OutputCard
              title="Research briefing"
              actions={
                <>
                  <CopyButton value={plainText} label="Copy briefing" />
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
                <h3 className="text-sm font-semibold">Key insights</h3>
                <BulletList items={result.keyInsights} empty="No key insights identified." />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Benefits</h3>
                <BulletList items={result.benefits} empty="No benefits identified." />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Risks</h3>
                <BulletList items={result.risks} empty="No risks identified." />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Recommendations</h3>
                <BulletList
                  items={result.recommendations}
                  empty="No recommendations generated."
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Further questions</h3>
                <BulletList
                  items={result.furtherQuestions}
                  empty="No further questions identified."
                />
              </section>
            </OutputCard>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
