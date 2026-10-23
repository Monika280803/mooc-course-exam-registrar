import React, { useState } from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  Sliders,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Link,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

export const PortalSettingsView: React.FC = () => {
  const {
    portalConfig,
    updatePortalConfig,
    testPortalConnection,
    resetDemoData,
    openAiExplainer,
  } = useRegistrar();

  const [baseUrlInput, setBaseUrlInput] = useState(portalConfig.baseUrl);
  const [courseEndpoint, setCourseEndpoint] = useState(portalConfig.courseEndpoint);
  const [examEndpoint, setExamEndpoint] = useState(portalConfig.examEndpoint);
  const [enrolmentEndpoint, setEnrolmentEndpoint] = useState(portalConfig.enrolmentEndpoint);
  const [examRegistrationEndpoint, setExamRegistrationEndpoint] = useState(portalConfig.examRegistrationEndpoint);
  const [registrationStatusEndpoint, setRegistrationStatusEndpoint] = useState(portalConfig.registrationStatusEndpoint);
  const [hallTicketStatusEndpoint, setHallTicketStatusEndpoint] = useState(portalConfig.hallTicketStatusEndpoint);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);

  const handleSaveEndpoints = (e: React.FormEvent) => {
    e.preventDefault();
    updatePortalConfig({
      baseUrl: baseUrlInput.trim(),
      courseEndpoint: courseEndpoint.trim(),
      examEndpoint: examEndpoint.trim(),
      enrolmentEndpoint: enrolmentEndpoint.trim(),
      examRegistrationEndpoint: examRegistrationEndpoint.trim(),
      registrationStatusEndpoint: registrationStatusEndpoint.trim(),
      hallTicketStatusEndpoint: hallTicketStatusEndpoint.trim(),
    });
    setTestResult({
      connected: false,
      message: 'Endpoints saved to local configuration. Click "Test Portal Connection" to verify accessibility.',
    });
  };

  const handleRunConnectionTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testPortalConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              SECTION 9
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              MOOC Organiser Portal Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configures endpoint targets for the organiser&apos;s mock MOOC portal or operates in transparent MOCK DEMO MODE.
          </p>
        </div>

        <button
          onClick={() =>
            openAiExplainer('PROCESS_SUMMARY', 'Portal Integration & Security Boundary', {
              mode: portalConfig.mode,
              baseUrl: portalConfig.baseUrl,
              isConnected: portalConfig.isConnected,
              lastTested: portalConfig.lastTestedAt || 'Never',
              policy: 'No mock results are ever presented as real organiser portal results. Real mode strictly requires confirmed HTTP 200 health.',
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explain Integration Guard</span>
        </button>
      </div>

      {/* Prominent Operating Mode Status Card */}
      <div
        className={`p-5 rounded-xl border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          portalConfig.mode === 'CONNECTED_PORTAL'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              portalConfig.mode === 'CONNECTED_PORTAL'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            <Radio className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-white/80">
                ACTIVE OPERATING MODE
              </span>
              <span className="text-xs font-mono">
                {portalConfig.mode}
              </span>
            </div>
            <h3 className="text-base font-bold">
              {portalConfig.mode === 'CONNECTED_PORTAL'
                ? 'CONNECTED PORTAL MODE (Active Verified Connection)'
                : 'MOCK DEMO MODE (Synthetic Data & Simulated Portal)'}
            </h3>
            <p className="text-xs leading-relaxed opacity-90 max-w-2xl">
              {portalConfig.mode === 'CONNECTED_PORTAL'
                ? `Live HTTP requests are dispatched to ${portalConfig.baseUrl}. All responses are verified against organiser contracts.`
                : 'The official organiser portal URL has not been verified or is currently offline. Operating strictly with deterministic synthetic datasets. Mock results are never represented as real organiser portal outcomes.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunConnectionTest}
          disabled={isTesting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Pinging Target...' : 'Test Portal Connection'}</span>
        </button>
      </div>

      {/* Test Result Message */}
      {testResult && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border shadow-2xs ${
            testResult.connected
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {testResult.connected ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">
              {testResult.connected ? 'Connection Verified' : 'Portal Unreachable / Invalid URL'}
            </p>
            <p className="mt-0.5">{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Link className="w-4 h-4 text-indigo-600" />
              <span>Organiser Mock MOOC Portal Endpoints</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the organiser-provided URL endpoints when available for the live demonstration.
            </p>
          </div>

          <form onSubmit={handleSaveEndpoints} className="space-y-4 text-xs">
            {/* Base URL */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Portal Base URL *
              </label>
              <input
                type="text"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder="https://mock-mooc-portal.internal/api/v1"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Must be an accessible HTTP/HTTPS target. When offline, app safely stays in MOCK DEMO MODE.
              </p>
            </div>

            {/* Endpoints Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Course Portal Endpoint
                </label>
                <input
                  type="text"
                  value={courseEndpoint}
                  onChange={(e) => setCourseEndpoint(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Exam Portal Endpoint
                </label>
                <input
                  type="text"
                  value={examEndpoint}
                  onChange={(e) => setExamEndpoint(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Enrolment Endpoint
                </label>
                <input
                  type="text"
                  value={enrolmentEndpoint}
                  onChange={(e) => setEnrolmentEndpoint(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Exam Registration Endpoint
                </label>
                <input
                  type="text"
                  value={examRegistrationEndpoint}
                  onChange={(e) => setExamRegistrationEndpoint(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Registration Status Endpoint
                </label>
                <input
                  type="text"
                  value={registrationStatusEndpoint}
                  onChange={(e) => setRegistrationStatusEndpoint(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Hall-Ticket Status Endpoint
                </label>
                <input
                  type="text"
                  value={hallTicketStatusEndpoint}
                  onChange={(e) => setHallTicketStatusEndpoint(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Last connection attempt: {portalConfig.lastTestedAt ? new Date(portalConfig.lastTestedAt).toLocaleTimeString() : 'Never'}
              </span>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                Save Endpoint Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Setup Guidelines & Demo Reset */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Official Integration Rules</span>
            </h4>

            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>
                <strong>Strict Mode Discipline:</strong> Never present mock results as real organiser portal results.
              </li>
              <li>
                <strong>No Fake Success:</strong> If portal endpoints fail or timeout, the app displays UNKNOWN or NEEDS REVIEW rather than inventing a value.
              </li>
              <li>
                <strong>No Security Bypasses:</strong> No CAPTCHA/OTP bypasses or real financial payment integrations are attempted.
              </li>
              <li>
                <strong>Idempotent Retries:</strong> All mutations pass stable idempotency keys to prevent duplicate entries.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Demo Environment Controls
            </h4>

            <p className="text-xs text-slate-500 leading-relaxed">
              Reset all course registrations, assignment scores, and test suite history back to the deterministic initial state for a fresh demonstration.
            </p>

            <button
              onClick={() => {
                if (window.confirm('Reset all demo data back to clean initial baseline?')) {
                  resetDemoData();
                  setTestResult({ connected: false, message: 'Synthetic fixtures restored.' });
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Clean Synthetic Demo State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
