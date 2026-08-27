import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { Bot, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageActions, MessageAction, MessageContent } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useActivity } from "@/lib/workspace-store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant — AI WorkFlow" },
      {
        name: "description",
        content:
          "Chat with AI WorkFlow Assistant for writing help, planning, meeting prep and workplace productivity advice.",
      },
      { property: "og:title", content: "AI Workplace Assistant — AI WorkFlow" },
      {
        property: "og:description",
        content: "One conversation thread for all your workplace AI questions.",
      },
    ],
  }),
  component: AssistantPage,
});

const STORAGE_KEY = "aiworkflow.chat-messages";

function AssistantPage() {
  const { logActivity } = useActivity();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chat = useChat({
    api: "/api/chat",
    initialMessages: mounted
      ? JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") || []
      : [],
    onFinish: (message) => {
      if (message.role === "assistant") {
        logActivity({
          kind: "chat",
          title: "Assistant conversation",
          preview: message.content.slice(0, 140),
        });
      }
    },
  });

  useEffect(() => {
    if (mounted && chat.messages.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chat.messages));
    }
  }, [chat.messages, mounted]);

  function clearChat() {
    chat.setMessages([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AppShell
      title="AI Workplace Assistant"
      description="One conversation for writing, planning and workplace questions"
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={clearChat}
          disabled={chat.messages.length === 0}
        >
          <Trash2 className="size-4" /> Clear chat
        </Button>
      }
    >
      <Card className="flex h-[calc(100vh-12rem)] min-h-[420px] flex-col overflow-hidden">
        {!mounted ? (
          <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
            Loading assistant…
          </div>
        ) : (
          <>
            <Conversation className="flex-1">
              <ConversationDownload
                messages={chat.messages}
                filename="ai-workflow-chat.md"
                className="top-3 right-3"
              />
              <ConversationContent>
                {chat.messages.length === 0 ? (
                  <ConversationEmptyState
                    icon={<Bot className="size-8" />}
                    title="Ask me anything about work"
                    description="Draft an email outline, plan a meeting, prioritise tasks or prepare for a difficult conversation."
                  />
                ) : (
                  chat.messages.map((m) => (
                    <Message key={m.id} from={m.role}>
                      <MessageContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {m.content}
                        </div>
                      </MessageContent>
                      <MessageActions>
                        <MessageAction
                          label="Copy message"
                          tooltip="Copy"
                          onClick={() => navigator.clipboard.writeText(m.content)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </MessageAction>
                      </MessageActions>
                    </Message>
                  ))
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="border-t border-border bg-card p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  chat.handleSubmit(e);
                }}
              >
                <PromptInput
                  value={chat.input}
                  onValueChange={chat.setInput}
                  isLoading={chat.status === "streaming"}
                  actions={
                    <Button
                      type="submit"
                      size="icon-sm"
                      disabled={!chat.input.trim() || chat.status === "streaming"}
                    >
                      <Send className="size-4" />
                    </Button>
                  }
                >
                  <PromptInputTextarea
                    placeholder="Ask the assistant…"
                    disabled={chat.status === "streaming"}
                  />
                </PromptInput>
              </form>
            </div>
          </>
        )}
      </Card>
    </AppShell>
  );
}
