# AI WorkMate

Build a modern, responsive AI-powered workplace productivity web application called AI WorkFlow.

PRODUCT PURPOSE

AI WorkFlow is a unified workplace productivity platform that helps professionals automate common workplace tasks using artificial intelligence.

The application must function as ONE integrated platform rather than separate disconnected tools.

CORE FEATURES

Implement these five AI-powered features:

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner

AI Research Assistant

AI Workplace Chatbot

APPLICATION STRUCTURE

Create a professional SaaS-style dashboard with:

Left sidebar navigation

Top navigation/header

Main content area

Responsive desktop and mobile layouts

Dashboard overview

User-friendly forms

AI loading states

Error states

Empty states

Editable AI outputs

Copy-to-clipboard functionality

Regenerate functionality where appropriate

SIDEBAR

Include:

Dashboard

Email Generator

Meeting Summarizer

Task Planner

Research Assistant

AI Assistant

Settings

DASHBOARD

Create an attractive dashboard homepage containing:

Welcome message

Productivity overview

Quick-action buttons

Feature cards

Recent AI activity

Recently generated content

Task overview

The dashboard should make the five AI tools feel like parts of one unified productivity system.

SMART EMAIL GENERATOR

Create a form containing:

Email purpose

Recipient/context

Key points

Tone selector

Tone options:

Formal

Professional

Friendly

Persuasive

Generate a professional email.

Display:

Subject

Email body

Allow the user to:

Edit the generated email

Copy the email

Regenerate the email

Make it shorter

Make it more professional

Use structured prompt engineering.

The AI must not invent facts that were not provided by the user.

MEETING NOTES SUMMARIZER

Allow users to paste long meeting notes.

Generate structured output containing:

Executive summary

Key discussion points

Decisions

Action items

Responsible person

Deadlines

Follow-up questions

Display action items in a clean structured layout.

Use structured AI prompting to separate summaries, decisions and actions.

AI TASK PLANNER

Allow users to enter multiple tasks.

Collect where appropriate:

Task name

Deadline

Estimated duration

Importance

Urgency

Use AI to organize the tasks into a realistic daily or weekly schedule.

Show:

Priority

Task

Suggested time

Deadline

Reason for priority

Allow users to mark tasks as completed.

AI RESEARCH ASSISTANT

Allow users to enter a research topic or workplace question.

Generate:

Executive summary

Key insights

Benefits

Risks

Recommendations

Further questions

Do not claim that information is sourced from the internet unless an actual web/search integration is available.

Clearly distinguish AI-generated analysis from verified external sources.

AI WORKPLACE CHATBOT

Create an interactive chatbot interface.

The assistant should behave as a professional workplace productivity assistant.

It should help users with:

Workplace writing

Brainstorming

Planning

Meeting preparation

Task organization

Productivity questions

Professional communication

Include:

Chat history during the session

User and AI message styling

Loading indicator

Clear conversation button

Where technically possible, allow the chatbot to help users transition between the other productivity tools.

PROMPT ENGINEERING

Use structured prompts with:

Role

Task

Context

Constraints

User input

Desired output format

Prompts should explicitly instruct the AI to:

Avoid fabricating information

Preserve user-provided facts

Ask for clarification when critical information is missing

Produce structured outputs

Use professional workplace language

Avoid unnecessary content

RESPONSIBLE AI

Include a clearly visible responsible AI notice:

"AI-generated content may contain errors or inaccuracies. Always review AI outputs before using them in workplace communications or making important decisions. Do not enter confidential, personal, or sensitive information."

Include responsible AI guidance in the application.

DESIGN

Use a clean, modern, professional SaaS aesthetic.

Design characteristics:

Modern typography

Consistent spacing

Professional cards

Rounded components

Clear hierarchy

Accessible contrast

Subtle animations

Clean icons

Responsive layouts

Mobile-friendly navigation

Avoid excessive decoration.

The application should look like a real commercial workplace productivity product rather than a student prototype.

USER EXPERIENCE

Every AI feature must have:

Clear instructions

Example input

Generate button

Loading state

AI output area

Error handling

Copy functionality where appropriate

Edit functionality where appropriate

Never leave the user wondering what to enter.

TECHNICAL REQUIREMENTS

Create reusable components.

Keep the code organized and maintainable.

Use secure handling of API keys and never expose secret API keys in client-side code.

If an AI API is required, structure the application so the API can be connected securely through a backend/server-side function.

Create realistic sample data where necessary so the dashboard can be demonstrated.

FINAL QUALITY

The final application should demonstrate:

Practical AI implementation

Strong prompt engineering

Real workplace problem solving

Responsible AI

Modern UI/UX

Responsive design

Integration of multiple AI capabilities into one coherent platform

The application should feel like one unified AI workplace assistant, not five separate applications.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://workflow-ace-65.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6ae25a4c-07d6-44c0-8324-8c75477d9992).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
