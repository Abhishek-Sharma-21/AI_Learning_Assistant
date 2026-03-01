import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector, useDispatch } from "react-redux";
import {
  MessageSquare,
  Send,
  ChevronDown,
  BookOpen,
  Bot,
  User,
  Loader2,
  Sparkles,
  RotateCcw,
  Lock,
  Zap,
} from "lucide-react";
import { fetchDocuments } from "../store/slices/documentSlice";
import { selectIsFree, FREE_CHAT_LIMIT } from "../store/slices/planSlice";
import UpgradeModal from "../components/UpgradeModal";

// ── Markdown renderer (reused style from DocumentDetail) ──────────────────────
const MsgMarkdown = ({ content }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => (
        <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>
      ),
      strong: ({ children }) => (
        <strong className="font-bold text-emerald-300">{children}</strong>
      ),
      em: ({ children }) => (
        <em className="italic text-slate-300">{children}</em>
      ),
      h1: ({ children }) => (
        <h1 className="text-base font-bold text-white mb-2">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-sm font-bold text-white mb-1.5">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-sm font-semibold text-emerald-300 mb-1">
          {children}
        </h3>
      ),
      ul: ({ children }) => <ul className="space-y-1 my-2 ml-1">{children}</ul>,
      ol: ({ children }) => (
        <ol className="space-y-1 my-2 ml-4 list-decimal">{children}</ol>
      ),
      li: ({ children }) => (
        <li className="flex items-start gap-2 text-sm text-slate-300">
          <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{children}</span>
        </li>
      ),
      code: ({ children }) => (
        <code className="px-1.5 py-0.5 rounded bg-slate-700 text-emerald-300 text-xs font-mono">
          {children}
        </code>
      ),
      pre: ({ children }) => (
        <pre className="my-2 p-3 bg-slate-800 rounded-xl overflow-x-auto text-xs font-mono text-slate-200">
          {children}
        </pre>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-emerald-500 pl-3 my-2 text-slate-400 italic text-sm">
          {children}
        </blockquote>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

// ── Suggestion chips ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Give me a summary of this document",
  "What are the key concepts I should know?",
  "Explain the most difficult topic in simple terms",
  "Create a quick revision checklist",
  "What questions might appear in an exam?",
];

// ── Main ─────────────────────────────────────────────────────────────────────
const AiChat = () => {
  const dispatch = useDispatch();
  const { items: docs, loading: docsLoading } = useSelector((s) => s.documents);
  const { token } = useSelector((s) => s.auth);
  const isFree = useSelector(selectIsFree);

  const [selectedDocId, setSelectedDocId] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const userMsgCount = messages.filter((m) => m.role === "user").length;
  const atChatLimit = isFree && userMsgCount >= FREE_CHAT_LIMIT;

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const selectedDoc = docs.find((d) => d._id === selectedDocId);

  // Load docs on mount
  useEffect(() => {
    if (!docs.length) dispatch(fetchDocuments());
  }, [dispatch, docs.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    window.document.addEventListener("mousedown", h);
    return () => window.document.removeEventListener("mousedown", h);
  }, []);

  // Fetch history when document changes
  const handleSelectDoc = async (id) => {
    setSelectedDocId(id);
    setDropdownOpen(false);

    // Set loading state
    setChatLoading(true);

    const defaultWelcome = {
      role: "assistant",
      content: `I've loaded **${docs.find((d) => d._id === id)?.title}**. Ask me anything about it — explanations, summaries, tricky concepts, exam tips, and more!`,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/documents/${id}/chat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const history = await res.json();

      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([defaultWelcome]);
      }
    } catch (err) {
      console.error("Error fetching chat history", err);
      setMessages([defaultWelcome]);
    } finally {
      setChatLoading(false);
      inputRef.current?.focus();
    }
  };

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q || !selectedDocId || chatLoading) return;
    if (atChatLimit) {
      setShowUpgrade(true);
      return;
    }
    setInput("");

    const userMsg = { role: "user", content: q };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/documents/${selectedDocId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question: q, history }),
        },
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "Sorry, I could not generate a response.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Connection error. Please check the server and try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          reason={`Free plan is limited to ${FREE_CHAT_LIMIT} messages per session`}
        />
      )}
      <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0a0f1e]">
        {/* ── Top bar ── */}
        <div className="shrink-0 flex items-center gap-4 px-5 py-3 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles size={16} />
            <span className="text-sm font-bold text-white">AI Chat</span>
          </div>

          {/* Free plan message counter */}
          {isFree && selectedDocId && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl">
              <MessageSquare
                size={12}
                className={atChatLimit ? "text-red-400" : "text-slate-400"}
              />
              <span
                className={`text-[11px] font-semibold ${atChatLimit ? "text-red-400" : "text-slate-400"}`}
              >
                {userMsgCount}/{FREE_CHAT_LIMIT}
              </span>
              {!atChatLimit && (
                <span className="text-[10px] text-slate-600">free</span>
              )}
              {atChatLimit && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="text-[10px] font-bold text-emerald-400 ml-1 hover:text-emerald-300"
                >
                  Upgrade
                </button>
              )}
            </div>
          )}

          {/* Document selector */}
          <div className="relative ml-auto" ref={dropRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
            >
              <BookOpen size={14} className="text-emerald-400 shrink-0" />
              <span className="max-w-[180px] truncate">
                {selectedDoc ? selectedDoc.title : "Select a document"}
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-slate-950/60 max-h-72 overflow-y-auto z-20">
                {docsLoading ? (
                  <div className="flex items-center justify-center py-8 text-slate-500 gap-2 text-sm">
                    <Loader2 size={16} className="animate-spin" /> Loading…
                  </div>
                ) : docs.length === 0 ? (
                  <p className="text-center py-8 text-sm text-slate-500">
                    No documents found. Upload one first.
                  </p>
                ) : (
                  <div className="p-2 space-y-1">
                    {docs.map((doc) => (
                      <button
                        key={doc._id}
                        onClick={() => handleSelectDoc(doc._id)}
                        className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${selectedDocId === doc._id ? "bg-emerald-500/10 text-emerald-300" : "text-slate-300 hover:bg-slate-800"}`}
                      >
                        <BookOpen
                          size={14}
                          className="mt-0.5 shrink-0 text-slate-500"
                        />
                        <span className="text-xs font-medium leading-relaxed">
                          {doc.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* ── Message area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {!selectedDocId ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <MessageSquare size={28} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Select a document to start
                </h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Choose any document from the dropdown above and ask the AI
                  anything about it.
                </p>
              </div>
              {/* Suggestion chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    disabled
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-500 cursor-default"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Bot size={15} className="text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-600/20 border border-emerald-500/20 text-slate-100 rounded-tr-sm"
                        : "bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MsgMarkdown content={msg.content} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center">
                      <User size={14} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Bot size={15} className="text-emerald-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
                    <Loader2
                      size={13}
                      className="text-emerald-400 animate-spin"
                    />
                    <span className="text-xs text-slate-400">Thinking…</span>
                  </div>
                </div>
              )}

              {/* Suggestion chips after first reply */}
              {messages.length === 1 && !chatLoading && (
                <div className="flex flex-wrap gap-2 pl-11">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* ── Input area ── */}
        {atChatLimit ? (
          <div className="shrink-0 px-4 pb-5 pt-3 border-t border-slate-800 bg-[#0f172a]/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <Lock size={20} className="text-amber-400" />
              <p className="text-sm font-semibold text-white">
                Free plan limit reached
              </p>
              <p className="text-xs text-slate-400 text-center">
                You've used all {FREE_CHAT_LIMIT} free messages for this
                session.
              </p>
              <button
                onClick={() => setShowUpgrade(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                <Zap size={14} className="fill-white" /> Upgrade to Pro
              </button>
            </div>
          </div>
        ) : (
          <div className="shrink-0 px-4 pb-5 pt-3 border-t border-slate-800 bg-[#0f172a]/60 backdrop-blur-sm">
            <div
              className={`flex items-end gap-3 bg-slate-800/80 border rounded-2xl px-4 py-3 transition-colors ${selectedDocId ? "border-slate-700 focus-within:border-emerald-500/50" : "border-slate-800 opacity-50"}`}
            >
              <textarea
                ref={inputRef}
                rows={1}
                disabled={!selectedDocId || chatLoading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedDocId
                    ? "Ask anything about this document…"
                    : "Select a document first"
                }
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none max-h-36 overflow-y-auto"
                style={{ lineHeight: "1.5" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || !selectedDocId || chatLoading}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-2">
              AI responses are based on document content only · Press Enter to
              send
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default AiChat;
