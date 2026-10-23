import React, { useState } from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';
import { TestRun } from '../types/registrar';

export const TestScenariosView: React.FC = () => {
  const {
    testRuns,
    runTestCase,
    runAllTestCases,
    isTestRunning,
    activeTestRunId,
    openAiExplainer,
  } = useRegistrar();

  const [expandedTestId, setExpandedTestId] = useState<string | null>('TC1');

  const toggleExpand = (id: string) => {
    setExpandedTestId(expandedTestId === id ? null : id);
  };

  const passCount = testRuns.filter((t) => t.verdict === 'PASS').length;
  const failCount = testRuns.filter((t) => t.verdict === 'FAIL').length;
  const pendingCount = testRuns.filter((t) => t.verdict === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              SECTION 7
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Four Official Test Scenarios & Audit Suite
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated test verification engine demonstrating TC1, TC2, TC3, and TC4 with deterministic synthetic fixtures and event trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              openAiExplainer('PROCESS_SUMMARY', 'Official Test Scenario Suite Overview', {
                totalScenarios: 4,
                passed: passCount,
                failed: failCount,
                pending: pendingCount,
                scenarios: testRuns.map((t) => ({ id: t.test_case_id, verdict: t.verdict, actual: t.actual_result })),
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Test Suite Brief</span>
          </button>

          <button
            onClick={runAllTestCases}
            disabled={isTestRunning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-900 hover:bg-indigo-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{isTestRunning ? 'Executing Scenarios...' : 'Run All Four Tests'}</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecard Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Test Suite Coverage</span>
          <p className="text-2xl font-black text-slate-900 mt-1">4 / 4</p>
          <p className="text-[11px] text-slate-500">Official challenge cases</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Passed Verdicts</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{passCount}</p>
          <p className="text-[11px] text-emerald-600">Verified against evidence</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase">Failed Verdicts</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{failCount}</p>
          <p className="text-[11px] text-slate-500">Constraint violations</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Pending Runs</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-500">Ready to execute</p>
        </div>
      </div>

      {/* Notice on Real vs Synthetic Data */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
        <span>
          <strong className="text-slate-800">Deterministic Demonstration Mode:</strong> All four test cases run against synthetic datasets with rigorous rule evaluation. Results reflect genuine application state machines and evidence checks.
        </span>
        <span className="font-mono text-slate-400">Environment: Google AI Studio</span>
      </div>

      {/* 4 Test Case Cards */}
      <div className="space-y-4">
        {testRuns.map((test) => {
          const isExpanded = expandedTestId === test.test_case_id;
          const isRunning = isTestRunning && activeTestRunId === test.test_case_id;

          return (
            <div
              key={test.test_case_id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
            >
              {/* Card Header Bar */}
              <div
                onClick={() => toggleExpand(test.test_case_id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      test.verdict === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : test.verdict === 'FAIL'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {test.verdict === 'PASS' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : test.verdict === 'FAIL' ? (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800">
                        {test.test_case_id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        {test.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {test.scenario_description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider ${
                      test.verdict === 'PASS'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : test.verdict === 'FAIL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-300'
                    }`}
                  >
                    {isRunning ? 'RUNNING...' : test.verdict}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runTestCase(test.test_case_id);
                    }}
                    disabled={isTestRunning}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Run Scenario</span>
                  </button>

                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Inspection Details */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4 text-xs">
                  {/* Grid: Inputs vs Expected vs Actual */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Input Snapshot */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Input Snapshot
                      </span>
                      <pre className="text-[11px] font-mono text-slate-800 bg-slate-50 p-2.5 rounded-md overflow-x-auto max-h-[140px]">
                        {JSON.stringify(test.input_snapshot, null, 2)}
                      </pre>
                    </div>

                    {/* Expected Result */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Expected Specification
                      </span>
                      <p className="text-slate-800 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-md min-h-[80px]">
                        {test.expected_result}
                      </p>
                    </div>

                    {/* Actual Result & Verdict */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Observed Result
                      </span>
                      <p className="text-slate-800 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-md min-h-[80px]">
                        {test.actual_result}
                      </p>
                    </div>
                  </div>

                  {/* Evidence Reference */}
                  {test.evidence && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">
                        Institutional Audit Evidence:
                      </span>
                      <span className="font-mono text-indigo-900 font-medium">
                        {test.evidence}
                      </span>
                    </div>
                  )}

                  {/* Step-by-Step Execution Events */}
                  {test.events && test.events.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Execution Event Trail ({test.events.length} steps)</span>
                      </span>

                      <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-3 rounded-md space-y-1 max-h-[180px] overflow-y-auto">
                        {test.events.map((ev, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {ev}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
