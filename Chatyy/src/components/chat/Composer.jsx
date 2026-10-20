import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import {
  FileUp,
  ImagePlus,
  Lightbulb,
  Plus,
  SendHorizontal,
  Globe,
  FileText,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";

const DOCUMENT_ACCEPT = ".pdf,.docx,.xls,.xlsx,.csv,.txt,.json,.html,.xml,.md";

/**
 * Composer adapted from "Bolt Style Chat" by Hurera Sheikh via 21st.dev
 * (ChatInput + toolbar pattern) — rewired to Chatyy's controlled
 * composer state: value, mode, credits, publish flag, document, submit.
 */
export default function Composer({
  value,
  onChange,
  onSubmit,
  loading,
  mode,
  onModeChange,
  isPublished,
  onPublishedChange,
  documentFile,
  onDocumentFileChange,
  onIdea,
  textareaRef,
}) {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const innerRef = useRef(null);
  const fileInputRef = useRef(null);
  const ref = textareaRef || innerRef;

  useEffect(() => {
    const ta = ref.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
    }
  }, [value, ref]);

  const ready = mode === "document" ? !!documentFile : value.trim().length > 0;

  const openFilePicker = () => {
    onModeChange("document");
    setShowAttachMenu(false);
    // Let the document row mount before focusing the input.
    setTimeout(() => fileInputRef.current?.click(), 30);
  };

  return (
    <div className="w-full">
      {mode === "image" && (
        <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 text-sm text-black/60 dark:text-white/55">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 cursor-pointer accent-[#fc7819]"
            checked={isPublished}
            onChange={(e) => onPublishedChange(e.target.checked)}
          />
          <span className="text-xs">Publish generated image to Community</span>
        </label>
      )}

      {mode === "document" && (
        <div className="mb-3 flex items-center justify-center gap-2 text-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept={DOCUMENT_ACCEPT}
            className="hidden"
            onChange={(e) => onDocumentFileChange(e.target.files?.[0] || null)}
          />
          {documentFile ? (
            <span className="flex max-w-full items-center gap-2 rounded-full border border-black/15 bg-white/70 px-3 py-1.5 text-xs text-black/70 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/70">
              <FileText className="size-3.5 shrink-0 text-[#fc7819]" />
              <span className="truncate">{documentFile.name}</span>
              <button
                type="button"
                aria-label="Remove document"
                className="cursor-pointer text-black/40 transition-colors hover:text-black dark:text-white/40 dark:hover:text-white"
                onClick={() => onDocumentFileChange(null)}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-black/25 px-3 py-1.5 text-xs text-black/55 transition-colors hover:border-[#fc7819]/60 hover:text-black dark:border-white/25 dark:text-white/55 dark:hover:text-white"
            >
              <FileUp className="size-3.5" />
              Choose a document — PDF, Word, Excel, or text (max 2 MB)
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-[#fc7819]/40 via-[#fc7819]/10 to-transparent dark:from-white/[0.08] dark:via-transparent dark:to-transparent"
        />
        <div className="relative rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_2px_24px_rgba(28,25,23,0.10)] dark:bg-[#1e1e22] dark:ring-white/[0.08] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            rows={1}
            placeholder={mode === "image" ? "Describe the image…" : mode === "document" ? "Ask about the document… (optional)" : "Ask me anything…"}
            aria-label="Message Chatyy"
            className="max-h-[180px] min-h-[76px] w-full resize-none bg-transparent px-5 pb-3 pt-5 text-[15px] text-ink outline-none placeholder:text-black/30 dark:text-white dark:placeholder:text-white/30"
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu((v) => !v)}
                  aria-label="Attachments"
                  className="flex size-9 items-center justify-center rounded-full bg-black/[0.05] text-black/60 transition-all duration-200 hover:bg-black/[0.09] hover:text-black active:scale-95 dark:bg-white/[0.08] dark:text-white/60 dark:hover:bg-white/[0.12] dark:hover:text-white"
                >
                  <Plus className={cn("size-4 transition-transform duration-200", showAttachMenu && "rotate-45")} />
                </button>

                <AnimatePresence>
                  {showAttachMenu && (
                    <>
                      <button
                        type="button"
                        aria-label="Close attachments menu"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setShowAttachMenu(false)}
                      />
                      <Motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-xl border border-black/10 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1a1a1e]/95"
                      >
                        <div className="min-w-[190px] p-1.5">
                          <button
                            type="button"
                            onClick={openFilePicker}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-black/60 transition-colors hover:bg-black/[0.04] hover:text-black dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                          >
                            <FileUp className="size-4" />
                            <span>Upload document</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { onModeChange("image"); setShowAttachMenu(false); }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-black/60 transition-colors hover:bg-black/[0.04] hover:text-black dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                          >
                            <ImagePlus className="size-4" />
                            <span>Generate an image</span>
                          </button>
                        </div>
                      </Motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={onIdea}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-black/50 transition-all duration-200 hover:bg-black/[0.04] hover:text-black dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <Lightbulb className="size-4" />
                <span className="hidden sm:inline">Ideas</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 text-xs text-black/45 sm:flex dark:text-white/40">
                <Globe className="size-3.5" />
                {mode === "text" ? "1 credit" : "2 credits"}
              </span>
              <Motion.button
                type="button"
                onClick={onSubmit}
                disabled={loading || !ready}
                whileTap={{ scale: 0.92 }}
                whileHover={ready && !loading ? { scale: 1.05 } : undefined}
                aria-label="Send message"
                className="flex items-center gap-2 rounded-full bg-[#fc7819] px-4 py-2 text-sm font-semibold text-black shadow-[0_0_24px_rgba(252,120,25,0.45)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <span className="hidden sm:inline">{mode === "image" ? "Create" : mode === "document" ? "Analyze" : "Send"}</span>
                <SendHorizontal className="size-4" />
              </Motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
