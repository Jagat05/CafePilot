"use client";

import { useState, useRef, useEffect } from "react";
import API from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, RotateCcw, Sparkles, TrendingUp, Users, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_CHIPS = [
  { label: "Today's Revenue", icon: TrendingUp },
  { label: "Active Staff", icon: Users },
  { label: "Menu Items", icon: Coffee },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const askAI = async (text: string) => {
    const query = text || question;
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const res = await API.post("/ai/ask", { question: query });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.reply },
      ]);
    } catch (err: any) {
      console.error("AI Error:", err);
      let errorMsg = err.response?.data?.message || "Something went wrong. Try again later.";
      if (err.response?.status === 429) {
        errorMsg = "I'm taking a short break (Quota reached). Try in 1 minute.";
      }
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Notice: ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-shadow hover:shadow-primary/40"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 flex h-[600px] w-[90vw] max-w-[400px] flex-col overflow-hidden rounded-2xl border bg-background/80 shadow-2xl backdrop-blur-xl md:right-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary/10 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">CafePilot Intelligence</h3>
                  <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Live Business Analyst</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 mt-10">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="mb-4 rounded-3xl bg-primary/5 p-6"
                  >
                    <Sparkles className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h4 className="text-base font-semibold">How can I help today?</h4>
                  <p className="mt-2 text-xs text-muted-foreground">Ask me about your revenue, staff productivity, or menu performance.</p>

                  <div className="mt-8 flex w-full flex-col gap-2">
                    {SUGGESTED_CHIPS.map((chip) => (
                      <Button
                        key={chip.label}
                        variant="outline"
                        size="sm"
                        onClick={() => askAI(chip.label)}
                        className="justify-start gap-2 rounded-xl border-dashed py-5 hover:border-primary hover:bg-primary/5"
                      >
                        <chip.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs">{chip.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col gap-1",
                    m.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-2.5 text-sm shadow-sm",
                      m.role === "user"
                        ? "rounded-2xl rounded-tr-none bg-primary text-primary-foreground"
                        : "rounded-2xl rounded-tl-none bg-card border"
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {m.role === "user" ? "You" : "AI Analyst"}
                  </span>
                </motion.div>
              ))}

              {loading && (
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border bg-card px-4 py-3 shadow-sm">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background">
              <div className="relative flex items-end gap-2 rounded-2xl border bg-muted/30 p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      askAI("");
                    }
                  }}
                  className="w-full resize-none bg-transparent p-2 text-sm focus:outline-none max-h-32"
                />
                <Button
                  size="icon"
                  disabled={loading || !question.trim()}
                  onClick={() => askAI("")}
                  className="h-10 w-10 shrink-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-center text-[10px] font-medium text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
