"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Who is Raj?",
  "What are his skills?",
  "Is he available for hire?",
  "Tell me about his projects",
];

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Cursor integration
  useEffect(() => {
    const setCursor = (window as any).setCursor;
    if (!setCursor) return;
    const fab = document.getElementById("chat-fab");
    if (fab) setCursor(fab, "Chat ✦");
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      setHasInteracted(true);
      const userMsg: Message = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        const data = await res.json();
        const assistantMsg: Message = {
          role: "assistant",
          content: data.response || data.error || "Sorry, something went wrong.",
        };
        setMessages([...newMessages, assistantMsg]);
      } catch {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "Oops — couldn't connect. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* FAB Button */}
      <button
        id="chat-fab"
        className={`chat-fab ${open ? "chat-fab--open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Ask about Raj"}
      >
        <span className="chat-fab-icon chat-fab-icon--chat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </span>
        <span className="chat-fab-icon chat-fab-icon--close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
        {!open && <span className="chat-fab-pulse" />}
      </button>

      {/* Chat Panel */}
      <div className={`chat-panel ${open ? "chat-panel--open" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-dot" />
          <div className="chat-header-info">
            <div className="chat-header-name">Ask about Raj</div>
            <div className="chat-header-status">
              {loading ? "typing…" : "AI-powered · always online"}
            </div>
          </div>
          <button className="chat-header-close" onClick={() => setOpen(false)}>
            &times;
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {!hasInteracted && (
            <div className="chat-welcome">
              <div className="chat-welcome-emoji">✦</div>
              <p className="chat-welcome-text">
                Hey! I know everything about Raj&apos;s work, skills, and experience.
                Ask me anything!
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="chat-suggestion"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-msg ${msg.role === "user" ? "chat-msg--user" : "chat-msg--ai"}`}
            >
              {msg.role === "assistant" && (
                <div className="chat-msg-avatar">R</div>
              )}
              <div className="chat-msg-bubble">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg chat-msg--ai">
              <div className="chat-msg-avatar">R</div>
              <div className="chat-msg-bubble chat-msg-typing">
                <span className="chat-dot" />
                <span className="chat-dot" />
                <span className="chat-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-wrap" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Ask about Raj's work, skills, projects..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={!input.trim() || loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

        {/* Footer */}
        <div className="chat-footer">
          Powered by AI · Knows everything about Raj
        </div>
      </div>
    </>
  );
}
