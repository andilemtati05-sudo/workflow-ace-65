import { streamText, Output } from "ai";
import { z } from "zod";

import {
  createLovableAiGatewayProvider,
  gatewayErrorMessage,
  requireGatewayKey,
  WORKFLOW_MODEL,
} from "./ai-gateway.server";
import { emailPrompt, meetingPrompt, plannerPrompt, researchPrompt } from "./prompts.server";
import type {
  EmailResult,
  MeetingResult,
  PlannerResult,
  ResearchResult,
} from "./ai.functions";

function model() {
  return createLovableAiGatewayProvider(requireGatewayKey())(WORKFLOW_MODEL);
}

async function generateStructured<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
  try {
    const result = streamText({
      model: model(),
      prompt,
      output: Output.object({ schema }),
    });
    return (await result.output) as T;
  } catch (error) {
    throw new Error(gatewayErrorMessage(error));
  }
}

const emailSchema = z.object({
  subject: z.string(),
  body: z.string(),
  missingInfo: z.array(z.string()),
});

const meetingSchema = z.object({
  executiveSummary: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
      deadline: z.string(),
      notes: z.string(),
    }),
  ),
  followUpQuestions: z.array(z.string()),
});

const plannerSchema = z.object({
  strategy: z.string(),
  schedule: z.array(
    z.object({
      priority: z.number(),
      task: z.string(),
      suggestedTime: z.string(),
      deadline: z.string(),
      reason: z.string(),
    }),
  ),
  warnings: z.array(z.string()),
});

const researchSchema = z.object({
  executiveSummary: z.string(),
  keyInsights: z.array(z.string()),
  benefits: z.array(z.string()),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()),
  furtherQuestions: z.array(z.string()),
});

export function runEmail(input: Parameters<typeof emailPrompt>[0]): Promise<EmailResult> {
  return generateStructured(emailPrompt(input), emailSchema);
}

export function runMeeting(notes: string): Promise<MeetingResult> {
  return generateStructured(meetingPrompt(notes), meetingSchema);
}

export function runPlanner(input: Parameters<typeof plannerPrompt>[0]): Promise<PlannerResult> {
  return generateStructured(plannerPrompt(input), plannerSchema);
}

export function runResearchBrief(topic: string, context: string): Promise<ResearchResult> {
  return generateStructured(researchPrompt(topic, context), researchSchema);
}
