import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailInput = z.object({
  purpose: z.string(),
  context: z.string(),
  keyPoints: z.string(),
  tone: z.enum(["formal", "professional", "friendly", "persuasive"]),
  adjustment: z.enum(["shorter", "more-professional"]).nullable().optional(),
});

const meetingInput = z.object({ notes: z.string() });

const plannerInput = z.object({
  horizon: z.enum(["day", "week"]),
  workingHours: z.string(),
  tasks: z.array(
    z.object({
      name: z.string(),
      deadline: z.string().optional(),
      duration: z.string().optional(),
      importance: z.string().optional(),
      urgency: z.string().optional(),
    }),
  ),
});

const researchInput = z.object({ topic: z.string(), context: z.string() });

export type EmailResult = {
  subject: string;
  body: string;
  missingInfo: string[];
};

export type MeetingResult = {
  executiveSummary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: Array<{ task: string; owner: string; deadline: string; notes: string }>;
  followUpQuestions: string[];
};

export type PlannerResult = {
  strategy: string;
  schedule: Array<{
    priority: number;
    task: string;
    suggestedTime: string;
    deadline: string;
    reason: string;
  }>;
  warnings: string[];
};

export type ResearchResult = {
  executiveSummary: string;
  keyInsights: string[];
  benefits: string[];
  risks: string[];
  recommendations: string[];
  furtherQuestions: string[];
};

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }): Promise<EmailResult> => {
    const { runEmail } = await import("./ai-run.server");
    return runEmail(data);
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => meetingInput.parse(data))
  .handler(async ({ data }): Promise<MeetingResult> => {
    const { runMeeting } = await import("./ai-run.server");
    return runMeeting(data.notes);
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => plannerInput.parse(data))
  .handler(async ({ data }): Promise<PlannerResult> => {
    const { runPlanner } = await import("./ai-run.server");
    return runPlanner(data);
  });

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => researchInput.parse(data))
  .handler(async ({ data }): Promise<ResearchResult> => {
    const { runResearchBrief } = await import("./ai-run.server");
    return runResearchBrief(data.topic, data.context);
  });
