import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, Copy, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageActions,
  MessageAction,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
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

const messageText = (message: UIMessage) =>
  message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

function AssistantPage() {
  const [mounted, setMounted] = useState(false);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setInitialMessages(parsed as UIMessage[]);
      }
    } catch {
      // ignore corrupted storage
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AppShell
        title="AI Workplace Assistant"
        description="One conversation for writing, planning and workplace questions"
      >
        <Card className="flex h-[calc(100vh-12rem)] min-h-[420px] items-center justify-center p-8 text-muted-foreground">
          Loading assistant…
        </Card>
      </AppShell>
    );
  }

  return <AssistantChat initialMessages={initialMessages} />;
}

function AssistantChat({ initialMessages }: { initialMessages: UIMessage[] }) {
  const { logActivity } = useActivity();
  const [input, setInput] = useState("");

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: ({ message }) => {
      if (message.role === "assistant") {
        logActivity({
          kind: "chat",
          title: "Assistant conversation",
          preview: messageText(message).slice(0, 140),
        });
      }
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const isBusy = status === "submitted" || status === "streaming";

  function clearChat() {
    setMessages([]);
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
          disabled={messages.length === 0}
        >
          <Trash2 className="size-4" /> Clear chat
        </Button>
      }
    >
      <Card className="flex h-[calc(100vh-12rem)] min-h-[420px] flex-col overflow-hidden">
        <Conversation className="flex-1">
          <ConversationDownload
            messages={messages}
            filename="ai-workflow-chat.md"
            className="top-3 right-3"
          />
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Bot className="size-8" />}
                title="Ask me anything about work"
                description="Draft an email outline, plan a meeting, prioritise tasks or prepare for a difficult conversation."
              />
            ) : (
              messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {messageText(m)}
                    </div>
                  </MessageContent>
                  <MessageActions>
                    <MessageAction
                      label="Copy message"
                      tooltip="Copy"
                      onClick={() =>
                        navigator.clipboard.writeText(messageText(m))
                      }
                    >
                      <Copy className="size-4" />
                    </MessageAction>
                  </MessageActions>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border bg-card p-3">
          <PromptInput
            onSubmit={(_message, event) => {
              event.preventDefault();
              const text = input.trim();
              if (!text || isBusy) return;
              sendMessage({ text });
              setInput("");
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask the assistant…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <div />
              <PromptInputSubmit
                status={status}
                onStop={stop}
                disabled={!input.trim() && !isBusy}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </Card>
    </AppShell>
  );
}
