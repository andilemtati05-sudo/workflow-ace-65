import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, RefreshCw, Scissors, Sparkle, Wand2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { CopyButton, ExampleHint, OutputCard } from "@/components/output-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
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
import { Textarea } from "@/components/ui/textarea";
import { generateEmail, type EmailResult } from "@/lib/ai.functions";
import { useActivity, useSettings } from "@/lib/workspace-store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI WorkFlow" },
      {
        name: "description",
        content:
          "Generate professional workplace emails from a purpose, recipient context and key points, with tone control and one-click refinements.",
      },
      { property: "og:title", content: "Smart Email Generator — AI WorkFlow" },
      {
        property: "og:description",
        content: "Draft on-tone workplace email in seconds and edit it before sending.",
      },
    ],
  }),
  component: EmailPage,
});

type Tone = "formal" | "professional" | "friendly" | "persuasive";

function EmailPage() {
  const { settings } = useSettings();
  const { logActivity } = useActivity();
  const run = useServerFn(generateEmail);

  const [purpose, setPurpose] = useState("");
  const [context, setContext] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<Tone>(settings.defaultTone);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const canGenerate = purpose.trim().length > 3 && keyPoints.trim().length > 3;

  async function generate(adjustment: "shorter" | "more-professional" | null = null) {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await run({
        data: {
          purpose: adjustment ? `${purpose}\n\nPrevious draft to revise:\n${body}` : purpose,
          context,
          keyPoints,
          tone,
          adjustment,
        },
      });
      setResult(data);
      setSubject(data.subject);
      setBody(data.body);
      logActivity({
        kind: "email",
        title: data.subject || "Generated email",
        preview: data.body.slice(0, 140),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Smart Email Generator"
      description="Write clear, on-tone workplace email from a few key points"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Email brief</CardTitle>
            <CardDescription>
              Give the AI only real facts. It will not invent details — anything missing comes back
              as a bracketed placeholder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Email purpose</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Inform the client about a two-week delivery delay"
              />
              <ExampleHint>Request budget approval for two extra contractors in Q4.</ExampleHint>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Recipient / context</Label>
              <Textarea
                id="context"
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Thandi Mokoena, external client project sponsor. We have worked together for a year."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Key points to include</Label>
              <Textarea
                id="points"
                rows={6}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder={"- Delivery moves from 12 to 26 March\n- Cause: supplier hardware shortage\n- Mitigation: weekly progress calls\n- No change to project cost"}
              />
              <ExampleHint>One fact per line. Bullet points work best.</ExampleHint>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Choose a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" disabled={!canGenerate || loading} onClick={() => generate()}>
              <Wand2 className="size-4" />
              {loading ? "Generating…" : "Generate email"}
            </Button>
            {!canGenerate ? (
              <p className="text-xs text-muted-foreground">
                Add a purpose and at least one key point to enable generation.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          {loading ? <LoadingState label="Drafting your email…" /> : null}
          {!loading && error ? <ErrorState message={error} onRetry={() => generate()} /> : null}
          {!loading && !error && !result ? (
            <EmptyState
              icon={<Mail className="size-6" />}
              title="Your draft will appear here"
              description="Fill in the brief and generate. You can then edit the text, copy it, shorten it or raise the formality."
            />
          ) : null}

          {!loading && result ? (
            <OutputCard
              title="Generated email"
              description="Editable — refine anything before you send it."
              actions={
                <>
                  <CopyButton value={`Subject: ${subject}\n\n${body}`} label="Copy all" />
                  <Button size="sm" variant="outline" onClick={() => generate()}>
                    <RefreshCw className="size-4" /> Regenerate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => generate("shorter")}>
                    <Scissors className="size-4" /> Shorter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generate("more-professional")}
                  >
                    <Sparkle className="size-4" /> More professional
                  </Button>
                </>
              }
            >
              <div className="space-y-2">
                <Label htmlFor="out-subject">Subject</Label>
                <Input
                  id="out-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="out-body">Email body</Label>
                <Textarea
                  id="out-body"
                  rows={16}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="font-sans leading-relaxed"
                />
              </div>
              {result.missingInfo?.length ? (
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                  <p className="text-sm font-semibold text-warning-foreground">
                    Confirm before sending
                  </p>
                  <ul className="mt-1 list-inside list-disc text-sm text-warning-foreground/90">
                    {result.missingInfo.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </OutputCard>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
