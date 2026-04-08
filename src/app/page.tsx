"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle2, BarChart3, Wand2, Mail,
  Loader2, AlertCircle, Download, Copy, Check
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface AnalysisData {
  id: string;
  score: number;
  presentKeywords: string[];
  missingKeywords: string[];
  suggestedSkills: string[];
  improvements: string[];
  optimizedResume?: string;
  coverLetter?: string;
}

// Build Word XML paragraph helpers
function wp(ppr: string, rpr: string, t: string): string {
  return '<w:p>' + ppr + '<w:r>' + rpr + '<w:t xml:space="preserve">' + t + '</w:t></w:r></w:p>';
}
function wpTwo(ppr: string, rpr1: string, t1: string, rpr2: string, t2: string): string {
  return '<w:p>' + ppr + '<w:r>' + rpr1 + '<w:t xml:space="preserve">' + t1 + '</w:t></w:r><w:r>' + rpr2 + '<w:t xml:space="preserve">' + t2 + '</w:t></w:r></w:p>';
}

function textToWordHtml(text: string): string {
  const lines = text.split('\n');
  let html = '';

  const CENTER_PPR = '<w:pPr><w:jc w:val="center"/><w:spacing w:after="60"/></w:pPr>';
  const CONTACT_PPR = '<w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/></w:pPr>';
  const SECTION_PPR = '<w:pPr><w:spacing w:before="200" w:after="80"/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="4f46e5"/></w:pBdr></w:pPr>';
  const JOB_PPR = '<w:pPr><w:spacing w:before="140" w:after="60"/></w:pPr>';
  const BULLET_PPR = '<w:pPr><w:ind w:left="360" w:hanging="200"/><w:spacing w:after="40"/></w:pPr>';
  const NORMAL_PPR = '<w:pPr><w:spacing w:after="60"/></w:pPr>';
  const SMALL_PPR = '<w:pPr><w:spacing w:after="40"/></w:pPr>';

  const NAME_RPR = '<w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1e3a5f"/></w:rPr>';
  const CONTACT_RPR = '<w:rPr><w:sz w:val="18"/><w:color w:val="4f46e5"/></w:rPr>';
  const HEADLINE_RPR = '<w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="4f46e5"/></w:rPr>';
  const SECTION_RPR = '<w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1e3a5f"/><w:caps/></w:rPr>';
  const JOB_RPR = '<w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="1e3a5f"/></w:rPr>';
  const BULLET_DOT_RPR = '<w:rPr><w:color w:val="4f46e5"/></w:rPr>';
  const BODY_RPR = '<w:rPr><w:sz w:val="20"/></w:rPr>';
  const SMALL_RPR = '<w:rPr><w:sz w:val="19"/></w:rPr>';
  const SMALL_BOLD_RPR = '<w:rPr><w:b/><w:sz w:val="19"/><w:color w:val="1e3a5f"/></w:rPr>';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { html += '<w:p/>'; continue; }

    const isAllCaps = line === line.toUpperCase() && line.replace(/[^A-Za-z]/g, '').length > 2;
    const hasDate = /20\d\d/.test(line) || line.includes('Present');

    // NAME line
    if (i === 0 && isAllCaps) {
      html += wp(CENTER_PPR, NAME_RPR, line);
    }
    // Contact line
    else if (line.includes('|') && (line.includes('@') || line.includes('+') || line.toLowerCase().includes('linkedin'))) {
      html += wp(CONTACT_PPR, CONTACT_RPR, line);
    }
    // Headline (pipe-separated, early in doc)
    else if (line.includes('|') && i < 5 && !hasDate) {
      html += wp(CENTER_PPR, HEADLINE_RPR, line);
    }
    // SECTION HEADERS
    else if (isAllCaps && !line.startsWith('•') && !line.includes('·') && !line.includes('|')) {
      html += wp(SECTION_PPR, SECTION_RPR, line);
    }
    // Job title with date
    else if (line.includes('|') && hasDate) {
      html += wp(JOB_PPR, JOB_RPR, line);
    }
    // Bullet points
    else if (line.startsWith('•') || (line.startsWith('-') && line.length > 2)) {
      const bulletText = line.replace(/^[•\-]\s*/, '');
      html += wpTwo(BULLET_PPR, BULLET_DOT_RPR, '•  ', BODY_RPR, bulletText);
    }
    // Competency line (Category: skill · skill)
    else if (line.includes(':') && line.includes('·')) {
      const colonIdx = line.indexOf(':');
      const cat = line.substring(0, colonIdx + 1);
      const skills = line.substring(colonIdx + 1);
      html += wpTwo(SMALL_PPR, SMALL_BOLD_RPR, cat, SMALL_RPR, skills);
    }
    // Earlier career (contains ·)
    else if (line.includes('·')) {
      html += wp(SMALL_PPR, SMALL_RPR, line);
    }
    // Regular text
    else {
      html += wp(NORMAL_PPR, BODY_RPR, line);
    }
  }
  return html;
}

function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/---/g, '─────────────────────────────')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .trim();
}

// Download as Word-compatible HTML file (opens perfectly in Microsoft Word)
function downloadAsWord(content: string, filename: string) {
  const lines = content.split("\n");
  let body = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { body += "<p>&nbsp;</p>"; continue; }

    const isAllCaps = line === line.toUpperCase() && line.replace(/[^A-Za-z]/g, "").length > 2;
    const hasDate = /20\d\d/.test(line) || line.includes("Present");
    const hasPipe = line.includes("|");
    const hasBullet = line.startsWith("\u2022") || line.startsWith("-");
    const hasDot = line.includes("\u00b7");

    if (i === 0 && isAllCaps) {
      body += "<h1 style=\"text-align:center;color:#1e3a5f;font-size:22pt;margin-bottom:2pt;\">" + line + "</h1>";
    } else if (hasPipe && i < 5 && !hasDate && (line.includes("@") || line.includes("+") || line.toLowerCase().includes("linkedin"))) {
      body += "<p style=\"text-align:center;color:#4f46e5;font-size:10pt;margin:2pt 0;\">" + line + "</p>";
    } else if (hasPipe && i < 5 && !hasDate) {
      body += "<p style=\"text-align:center;font-weight:bold;color:#4f46e5;font-size:11pt;margin:3pt 0;\">" + line + "</p>";
    } else if (isAllCaps && !hasBullet && !hasDot && !hasPipe) {
      body += "<h2 style=\"color:#1e3a5f;font-size:12pt;border-bottom:2px solid #4f46e5;padding-bottom:3pt;margin-top:14pt;margin-bottom:4pt;\">" + line + "</h2>";
    } else if (hasPipe && hasDate) {
      body += "<p style=\"font-weight:bold;color:#1e3a5f;font-size:11pt;margin-top:8pt;margin-bottom:2pt;\">" + line + "</p>";
    } else if (hasBullet) {
      const text = line.replace(/^[\u2022\-]\s*/, "");
      body += "<p style=\"margin-left:20pt;margin-top:2pt;margin-bottom:2pt;font-size:10.5pt;\">\u2022&nbsp;&nbsp;" + text + "</p>";
    } else if (line.includes(":") && hasDot) {
      const idx = line.indexOf(":");
      const cat = line.substring(0, idx + 1);
      const skills = line.substring(idx + 1);
      body += "<p style=\"font-size:10.5pt;margin:2pt 0;\"><strong style=\"color:#1e3a5f;\">" + cat + "</strong>" + skills + "</p>";
    } else if (hasDot) {
      body += "<p style=\"font-size:10pt;margin:2pt 0;color:#334155;\">" + line + "</p>";
    } else {
      body += "<p style=\"font-size:10.5pt;margin:3pt 0;\">" + line + "</p>";
    }
  }

  const html = [
    "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\"",
    "      xmlns:w=\"urn:schemas-microsoft-com:office:word\"",
    "      xmlns=\"http://www.w3.org/TR/REC-html40\">",
    "<head>",
    "<meta charset=\"utf-8\"/>",
    "<meta name=ProgId content=Word.Document/>",
    "<style>",
    "  @page { margin: 2cm; }",
    "  body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; line-height: 1.4; }",
    "  h1 { font-family: Calibri, Arial, sans-serif; }",
    "  h2 { font-family: Calibri, Arial, sans-serif; }",
    "  p  { font-family: Calibri, Arial, sans-serif; }",
    "</style>",
    "</head>",
    "<body>" + body + "</body>",
    "</html>"
  ].join("\n");

  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(".docx", ".doc").replace(".txt", ".doc");
  a.click();
  URL.revokeObjectURL(url);
}

// Copy to clipboard
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(markdownToPlainText(text));
    return true;
  } catch {
    return false;
  }
}

function ScoreRing({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score) / 100;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#4f46e5' : '#dc2626';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
        <circle
          cx="80" cy="80" r={radius}
          stroke={color} strokeWidth="10" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-4xl font-black font-outfit" style={{ color }}>{score}</span>
        <p className="text-xs text-slate-500 font-bold">/100</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedCL, setCopiedCL] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setError("");
    },
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim()) {
      setError("Please provide both a resume (PDF) and a job description.");
      return;
    }
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    try {
      const response = await axios.post("/api/analyze", formData);
      setAnalysis(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.details || "Error analyzing resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!analysis?.id) return;
    setIsOptimizing(true);
    setError("");
    try {
      const response = await axios.post("/api/optimize", { analysisId: analysis.id });
      setAnalysis({ ...analysis, optimizedResume: response.data.optimizedResume });
    } catch (err: any) {
      setError("Error optimizing resume. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateCL = async () => {
    if (!analysis?.id) return;
    setIsGeneratingCL(true);
    setError("");
    try {
      const response = await axios.post("/api/cover-letter", { analysisId: analysis.id });
      setAnalysis({ ...analysis, coverLetter: response.data.coverLetter });
    } catch (err: any) {
      setError("Error generating cover letter. Please try again.");
    } finally {
      setIsGeneratingCL(false);
    }
  };

  const handleCopyResume = async () => {
    if (!analysis?.optimizedResume) return;
    const ok = await copyToClipboard(analysis.optimizedResume);
    if (ok) { setCopiedResume(true); setTimeout(() => setCopiedResume(false), 2000); }
  };

  const handleCopyCL = async () => {
    if (!analysis?.coverLetter) return;
    const ok = await copyToClipboard(analysis.coverLetter);
    if (ok) { setCopiedCL(true); setTimeout(() => setCopiedCL(false), 2000); }
  };

  const scoreLabel = analysis
    ? analysis.score >= 80 ? "Excellent Match! 🎉"
    : analysis.score >= 60 ? "Good Match"
    : "Needs Improvement"
    : "";

  return (
    <main className="min-h-screen bg-slate-50" suppressHydrationWarning>
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-outfit text-indigo-900">ResumeATS</span>
          </div>
          <div className="flex gap-4">
            <button className="text-slate-600 font-medium hover:text-indigo-600 transition-colors" suppressHydrationWarning>
              How it works
            </button>
            <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all" suppressHydrationWarning>
              Get Unlimited
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12" suppressHydrationWarning>
        <AnimatePresence mode="wait">

          {/* ── LANDING / UPLOAD VIEW ── */}
          {!analysis ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-12 lg:grid-cols-2"
              suppressHydrationWarning
            >
              {/* Left: Hero text */}
              <div className="flex flex-col justify-center gap-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full w-fit font-bold border border-indigo-100">
                  <Wand2 className="w-4 h-4" />
                  <span>Powered by Advanced AI</span>
                </div>
                <h1 className="text-6xl font-extrabold font-outfit text-slate-900 leading-[1.1]" suppressHydrationWarning>
                  Beat the ATS with{" "}
                  <span className="text-indigo-600" suppressHydrationWarning>Smart Resume</span>{" "}
                  Optimization.
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg" suppressHydrationWarning>
                  Upload your resume and the job description. Our AI analyzes keywords,
                  calculates your ATS score, and rewrites your resume to pass every screening.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 text-slate-500 font-medium border-r pr-6 border-slate-200">
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                    Groq-Powered Analysis
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                    Gemini-Powered Generation
                  </div>
                </div>
              </div>

              {/* Right: Upload form */}
              <div className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 space-y-8">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300"
                  }`}
                >
                  <input {...getInputProps()} suppressHydrationWarning />
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6">
                    <Upload className="text-indigo-600 w-8 h-8" />
                  </div>
                  {file ? (
                    <div className="flex items-center gap-2 text-indigo-700 font-bold">
                      <FileText className="w-5 h-5" />
                      {file.name}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-bold text-slate-700 text-lg">Drop your resume here</p>
                      <p className="text-slate-400 mt-1">or click to browse • PDF only</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description here..."
                    className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-slate-700 resize-none text-sm leading-relaxed transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6" />
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-6 h-6" />
                      Analyze & Score My Resume
                    </>
                  )}
                </button>
              </div>
            </motion.div>

          ) : (

            /* ── RESULTS VIEW ── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-8 lg:grid-cols-12"
              suppressHydrationWarning
            >
              {/* ── Sidebar ── */}
              <div className="lg:col-span-4 space-y-8">

                {/* Score card */}
                <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100 text-center space-y-4">
                  <h3 className="text-xl font-bold font-outfit text-slate-800">ATS Score</h3>
                  <ScoreRing score={analysis.score} />
                  <p className="text-slate-600 font-medium text-sm">
                    Your resume matches <strong>{analysis.score}%</strong> of the job requirements.
                  </p>
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                    analysis.score >= 80 ? 'bg-green-100 text-green-700'
                    : analysis.score >= 60 ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {scoreLabel}
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    <button
                      onClick={handleOptimize}
                      disabled={isOptimizing}
                      className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                      {isOptimizing
                        ? <><Loader2 className="animate-spin w-5 h-5" /> Optimizing...</>
                        : <><Wand2 className="w-5 h-5" /> Optimize Resume</>}
                    </button>
                    <button
                      onClick={handleGenerateCL}
                      disabled={isGeneratingCL}
                      className="w-full py-3.5 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingCL
                        ? <><Loader2 className="animate-spin w-5 h-5" /> Generating...</>
                        : <><Mail className="w-5 h-5" /> Generate Cover Letter</>}
                    </button>
                    <button
                      onClick={() => { setAnalysis(null); setFile(null); setJobDescription(""); setError(""); }}
                      className="text-slate-500 font-bold hover:text-slate-800 transition-colors py-2 text-sm"
                    >
                      ← Try Another Resume
                    </button>
                  </div>
                </div>

                {/* Stats card */}
                <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-800 border-b pb-4">Keyword Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                      <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Matched</p>
                      <p className="text-3xl font-black text-emerald-700 font-outfit">{analysis.presentKeywords.length}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl text-center">
                      <p className="text-xs text-red-600 font-bold uppercase mb-1">Missing</p>
                      <p className="text-3xl font-black text-red-600 font-outfit">{analysis.missingKeywords.length}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>Match Rate</span>
                      <span>{Math.round(analysis.presentKeywords.length / (analysis.presentKeywords.length + analysis.missingKeywords.length) * 100) || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                        style={{ width: `${Math.round(analysis.presentKeywords.length / (analysis.presentKeywords.length + analysis.missingKeywords.length) * 100) || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              {/* ── Main Results ── */}
              <div className="lg:col-span-8 space-y-8">

                {/* Present / Missing keywords */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                    <h3 className="text-emerald-900 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Present Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.presentKeywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 bg-white text-emerald-700 text-sm font-bold rounded-lg border border-emerald-100 shadow-sm">{k}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-4">
                    <h3 className="text-red-900 font-bold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Gap Analysis
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 bg-white text-red-600 text-sm font-bold rounded-lg border border-red-100 shadow-sm">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Smart suggestions */}
                <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100 space-y-4">
                  <h3 className="text-xl font-bold font-outfit text-slate-800">Smart Suggestions</h3>
                  <div className="grid gap-3">
                    {analysis.suggestedSkills.map((s, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                        <span className="font-bold text-slate-700 group-hover:text-indigo-900">{s}</span>
                        <span className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-indigo-600 shadow-sm uppercase">
                          Highly Recommended
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimization feedback */}
                <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-100 space-y-4">
                  <h3 className="text-xl font-bold font-outfit text-slate-800">Optimization Feedback</h3>
                  <ul className="space-y-4">
                    {analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm mt-0.5">!</div>
                        <p className="text-slate-600 font-medium">{imp}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── Generated Content ── */}
                {(analysis.optimizedResume || analysis.coverLetter) && (
                  <div className="space-y-8 pt-4">

                    {/* Optimized Resume */}
                    {analysis.optimizedResume && (
                      <div className="p-10 bg-white rounded-3xl shadow-2xl border border-indigo-100 space-y-6 ring-4 ring-indigo-50">
                        <div className="flex items-center justify-between border-b pb-6 flex-wrap gap-4">
                          <h3 className="text-2xl font-bold font-outfit text-indigo-900 flex items-center gap-3">
                            <Wand2 className="w-7 h-7" /> Optimized Resume
                          </h3>
                          <div className="flex gap-3">
                            <button
                              onClick={handleCopyResume}
                              className="flex items-center gap-2 px-4 py-2 border-2 border-indigo-200 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all"
                            >
                              {copiedResume ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
                            </button>
                            <button
                              onClick={() => downloadAsWord(analysis.optimizedResume!, 'optimized-resume.docx')}
                              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md"
                            >
                              <Download className="w-4 h-4" /> Download Word
                            </button>
                          </div>
                        </div>
                        <div className="prose prose-slate max-w-none prose-headings:font-outfit prose-strong:text-indigo-700 font-inter">
                          <ReactMarkdown>{analysis.optimizedResume}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {analysis.coverLetter && (
                      <div className="p-10 bg-white rounded-3xl shadow-lg border border-slate-100 space-y-6">
                        <div className="flex items-center justify-between border-b pb-6 flex-wrap gap-4">
                          <h3 className="text-2xl font-bold font-outfit text-slate-800 flex items-center gap-3">
                            <Mail className="w-7 h-7" /> Cover Letter
                          </h3>
                          <div className="flex gap-3">
                            <button
                              onClick={handleCopyCL}
                              className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                            >
                              {copiedCL ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
                            </button>
                            <button
                              onClick={() => downloadAsWord(analysis.coverLetter!, 'cover-letter.docx')}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-md"
                            >
                              <Download className="w-4 h-4" /> Download Word
                            </button>
                          </div>
                        </div>
                        <div className="prose prose-slate max-w-none font-inter leading-relaxed">
                          <ReactMarkdown>{analysis.coverLetter}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="py-12 border-t mt-12 bg-white text-center">
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
          © 2026 ResumeATS Dashboard • Professional Career Suite
        </p>
      </footer>
    </main>
  );
}
