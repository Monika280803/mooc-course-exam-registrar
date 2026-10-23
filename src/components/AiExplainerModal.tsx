import React from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  Sparkles,
  X,
  Database,
  Bot,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const AiExplainerModal: React.FC = () => {
  const { aiExplanationModal, closeAiExplainer } = useRegistrar();

  if (!aiExplanationModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-700/80 border border-indigo-400/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">{aiExplanationModal.title}</h3>
              <p className="text-xs text-indigo-200">
                Natural-language registrar guidance powered by Gemini 3.8
              </p>
            </div>
          </div>
          <button
            onClick={closeAiExplainer}
            className="text-indigo-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
          {/* Section 1: Ground Truth Deterministic Facts (Explicitly Distinguished) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ground Truth: Institutional Facts (Deterministic Engine)</span>
            </div>
            <p className="text-xs text-slate-500">
              These facts are computed deterministically from academic databases and portal records. They are never hallucinated or modified by AI.
            </p>
            <div className="bg-white rounded-md border border-slate-200 p-3 font-mono text-xs text-slate-800 space-y-1">
              {aiExplanationModal.context ? (
                Object.entries(aiExplanationModal.context).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-0.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500 font-medium">{key}:</span>
                    <span className="font-semibold text-slate-900">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400">No context available.</span>
              )}
            </div>
          </div>

          {/* Section 2: AI-Generated Analysis & Guidance */}
          <div className="border border-indigo-100 bg-indigo-50/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Assistant Advisory (Gemini Analysis)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                Advisory Only
              </span>
            </div>

            {aiExplanationModal.isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <p>Generating personalized registrar summary...</p>
              </div>
            ) : aiExplanationModal.error ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Notice</p>
                  <p>{aiExplanationModal.error}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-800 leading-relaxed space-y-2 whitespace-pre-line bg-white/80 p-3 rounded-md border border-indigo-100">
                {aiExplanationModal.explanation}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 italic">
            * Note: Official academic cutoff regulations and exam booking deadlines are authoritative. Gemini provides explanatory support and study planning.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={closeAiExplainer}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
