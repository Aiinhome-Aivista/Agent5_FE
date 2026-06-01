import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  Loader2,
  Sparkles,
  Check,
  AlertCircle,
  Wand2,
  ArrowLeft,
} from "lucide-react";
import clsx from "clsx";
import { endpoints } from "../api/client";

export default function RunbookUploadModal({
  open,
  onClose,
  onSaved,
  pushToast,
}) {
  const inputRef = useRef(null);

  const [phase, setPhase] = useState("pick");
  const [dragOver, setDragOver] = useState(false);

  const [inputMode, setInputMode] = useState("file");
  const [textContent, setTextContent] = useState("");

  const [runbookFile, setRunbookFile] = useState(null);

  const [runbookTitle, setRunbookTitle] = useState("");
  const [runbookDescription, setRunbookDescription] = useState("");
  const [provider, setProvider] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [relevanceScore, setRelevanceScore] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const [runbookSaving, setRunbookSaving] = useState(false);

  const [error, setError] = useState(null);

  function reset() {
    setPhase("pick");
    setDragOver(false);
    setInputMode("file");
    setTextContent("");
    setRunbookFile(null);
    setRunbookTitle("");
    setRunbookDescription("");
    setProvider("");
    setResourceType("");
    setRelevanceScore(0);
    setUploadStatus("");
    setUploadMessage("");
    setRunbookSaving(false);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleClose() {
    if (phase === "analyzing" || runbookSaving) return;

    reset();
    onClose();
  }

  // =========================================================
  // FILE PICK
  // =========================================================

  function handleRunbookFile(e) {
    const f = e.target.files?.[0];

    if (!f) return;

    processFile(f);
  }

  function processFile(f) {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (
      f.type &&
      !allowed.includes(f.type) &&
      !/\.docx?$|\.pdf$|\.txt$/i.test(f.name)
    ) {
      setError("Unsupported file type. Please upload PDF, DOCX, or TXT.");

      pushToast?.({
        type: "error",
        message: "Unsupported file type.",
      });

      return;
    }

    setError(null);

    setRunbookFile(f);

    const name = f.name.replace(/\.[^.]+$/, "");

    setRunbookTitle(name);

    analyzeRunbook(f);
  }

  // =========================================================
  // DRAG EVENTS
  // =========================================================

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleRunbookDrop(e) {
    e.preventDefault();

    setDragOver(false);

    const f = e.dataTransfer?.files?.[0];

    if (!f) return;

    processFile(f);
  }

  function handleTextSubmit() {
    if (!textContent.trim()) {
      setError("Please enter some text to upload.");
      return;
    }
    const blob = new Blob([textContent], { type: "text/plain" });
    const f = new File([blob], "Pasted_Runbook.txt", { type: "text/plain" });
    processFile(f);
  }

  // =========================================================
  // ANALYZE
  // =========================================================

  async function analyzeRunbook(file) {
    setPhase("analyzing");
    setError(null);
    try {
      // FORM DATA
      const formData = new FormData();

      formData.append("file", file);

      // API CALL

      const { data } = await endpoints.uploadRunbook(formData);
      // ============================================
      // SET VALUES
      // ============================================

      setRunbookTitle(data.filename?.replace(/\.[^.]+$/, "") || "");

      setRunbookDescription(data.reason || "");

      setProvider(data.cloud_platform || "");

      setResourceType(data.collection || "");

      setRelevanceScore(data.relevance_score || 0);
      setUploadStatus(data.status || "");
      setUploadMessage(data.message || "");

      setPhase("review");
    } catch (e) {
      setError(e?.message || "Failed to analyze file");

      setPhase("pick");

      setRunbookFile(null);
    }
  }

  // =========================================================
  // SAVE
  // =========================================================

  async function saveRunbook() {
    if (!runbookTitle.trim()) {
      setError("Runbook title is required");
      return;
    }

    setRunbookSaving(true);

    setError(null);

    try {
      // Persist as a rule in the dynamic rulebook (draft until approved).
      await endpoints.createRule({
        title: runbookTitle,
        content: runbookDescription || textContent || runbookTitle,
        provider: (provider || "any").toLowerCase(),
        resource_type: resourceType || "any",
        category: "runbook",
        status: "draft",
      });

      pushToast?.({
        type: "success",
        message: `Runbook saved as draft rule: ${runbookTitle}`,
      });

      onSaved?.();

      handleClose();
    } catch (e) {
      setError(e?.message || "Failed to save runbook");

      pushToast?.({
        type: "error",
        message: e?.message || "Failed to save runbook",
      });
    } finally {
      setRunbookSaving(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/5 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
      >
        {/* BACKDROP */}
        <div className="absolute inset-0" />

        {/* MODAL */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative bg-white rounded-2xl border border-paper-300 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}

          <div className="p-6 border-b border-paper-300 flex items-center justify-between bg-paper-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center text-white shadow-md">
                {phase === "review" ? (
                  <Wand2 className="w-5 h-5 text-accent-400" />
                ) : phase === "analyzing" ? (
                  <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 text-accent-400" />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-ink-900">
                  {phase === "pick" && "Upload Operational Runbook"}

                  {phase === "analyzing" && "Analyzing document…"}

                  {phase === "review" && "Review AI Suggestions"}
                </h3>

                <p className="text-xs text-ink-500">
                  {phase === "pick" &&
                    "Upload a PDF or DOCX file to generate operational insights"}

                  {phase === "analyzing" &&
                    "AI is extracting title and operational summary..."}

                  {phase === "review" &&
                    "Review and edit the generated content before saving"}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={runbookSaving || phase === "analyzing"}
              className="text-ink-400 hover:text-ink-700 transition-colors p-1.5 rounded-lg hover:bg-paper-200 disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BODY */}

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {uploadStatus === "rejected" && (
              <div className="flex items-center gap-2 text-crimson-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadMessage}</span>
              </div>
            )}

            {error && (
              <div className="bg-crimson-50 border border-crimson-200 text-crimson-700 text-xs px-3 py-2 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* PICK */}

            {phase === "pick" && (
              <div className="space-y-4">
                {/* 
                <div className="flex items-center self-start bg-paper-200 p-1 rounded-xl relative w-max mb-2">
                  <button
                    type="button"
                    onClick={() => setInputMode("file")}
                    className={clsx(
                      "relative px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors z-10",
                      inputMode === "file"
                        ? "text-ink-900"
                        : "text-ink-500 hover:text-ink-700"
                    )}
                  >
                    {inputMode === "file" && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    Upload File
                  </button>
                </div> 
                */}

                {inputMode === "file" && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-ink-900 uppercase tracking-wider block">
                      Source File (PDF / DOCX)
                    </label>

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleRunbookDrop}
                      className={clsx(
                        "border-2 border-dashed rounded-xl p-10 text-center transition-colors relative",
                        dragOver
                          ? "border-accent-500 bg-accent-50"
                          : "border-paper-300 bg-paper-100 hover:bg-paper-200",
                      )}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleRunbookFile}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />

                      <div className="flex flex-col items-center gap-3 pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-white border border-paper-300 flex items-center justify-center shadow-sm">
                          <Upload className="w-6 h-6 text-ink-400" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-ink-700">
                            Drag & drop a runbook here
                          </p>

                          <p className="text-[11px] text-ink-500 mt-1">
                            AI will automatically generate a title and summary
                          </p>

                          <p className="text-[12px] text-ink-500 mt-1">
                            PDF or DOCX · 20 MB max
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* {inputMode === "text" && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-ink-900 uppercase tracking-wider block">
                      Runbook Text
                    </label>
                    <textarea
                      rows={8}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Paste your runbook content here..."
                      className="w-full px-4 py-3 border border-paper-300 rounded-xl text-sm text-ink-700 bg-paper-100 focus:bg-white focus:outline-none focus:border-accent-500 resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleTextSubmit}
                        className="px-4 py-2 bg-ink-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:bg-black transition-colors"
                      >
                        Upload Text
                      </button>
                    </div>
                  </div>
                )} */}
              </div>
            )}

            {/* ANALYZING */}

            {phase === "analyzing" && (
              <div className="py-16 flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-paper-200" />

                  <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-ink-900 animate-spin absolute inset-0" />

                  <Sparkles className="w-6 h-6 text-accent-500 absolute inset-0 m-auto" />
                </div>

                <div>
                  <p className="text-sm font-bold text-ink-900">
                    Reading{" "}
                    <span className="font-mono">{runbookFile?.name}</span>
                  </p>

                  <p className="text-xs text-ink-500 mt-1">
                    Extracting operational insights and AI suggestions…
                  </p>
                </div>
              </div>
            )}

            {/* REVIEW */}

            {phase === "review" && (
              <div className="space-y-5">
                {/* FILE */}

                <div className="flex items-center gap-3 rounded-xl border border-paper-300 bg-paper-100 p-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-paper-300 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-accent-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-800 truncate">
                      {runbookFile?.name}
                    </div>

                    <div className="text-xs text-ink-500">
                      AI extraction completed
                    </div>
                  </div>
                </div>

                {/* TITLE */}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                    Title
                  </label>

                  <input
                    type="text"
                    value={runbookTitle}
                    onChange={(e) => setRunbookTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-ink-700 bg-paper-100 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* DESCRIPTION */}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={runbookDescription}
                    onChange={(e) => setRunbookDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-ink-700 bg-paper-100 focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                {/* GRID */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PROVIDER */}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                      Provider
                    </label>

                    <input
                      type="text"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-ink-700 bg-paper-100 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* RESOURCE TYPE */}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                      Resource Type
                    </label>

                    <input
                      type="text"
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-ink-700 bg-paper-100 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/*Relevance Score */}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                      Relevance Score
                    </label>

                    <input
                      type="text"
                      value={relevanceScore}
                      onChange={(e) => setRelevanceScore(e.target.value)}
                      className="w-full px-3 py-2 border border-paper-300 rounded-lg text-sm text-ink-700 bg-paper-100 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div className="p-4 bg-paper-100 border-t border-paper-300 flex items-center justify-between gap-3 shrink-0">
            {phase === "review" ? (
              <button
                type="button"
                onClick={() => {
                  setPhase("pick");
                  setRunbookFile(null);
                  setUploadStatus("");
                  setUploadMessage("");

                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
                disabled={runbookSaving}
                className="text-ink-500 hover:text-ink-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Pick different file
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={runbookSaving || phase === "analyzing"}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-500 hover:text-ink-900 disabled:opacity-40"
              >
                Cancel
              </button>

              {phase === "review" && (
                <button
                  type="button"
                  onClick={saveRunbook}
                  disabled={runbookSaving || relevanceScore < 75}
                  className={clsx(
                    "px-5 py-2 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2",
                    relevanceScore >= 75
                      ? "bg-ink-900 hover:bg-black"
                      : "bg-paper-400  text-black cursor-not-allowed opacity-60",
                  )}
                >
                  {runbookSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : relevanceScore < 75 ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Relevance Too Low
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Runbook
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
