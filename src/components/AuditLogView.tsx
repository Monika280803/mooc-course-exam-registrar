import React, { useState } from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  ShieldCheck,
  Search,
  Download,
  Trash2,
  Filter,
  FileCode,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AuditLogEvent } from '../types/registrar';

export const AuditLogView: React.FC = () => {
  const { auditLogs, clearAuditLogs, currentStudent } = useRegistrar();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEvent | null>(null);

  // Filter logs
  const filteredLogs = auditLogs.filter((evt) => {
    const matchesSearch =
      evt.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.course_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.verification_result && evt.verification_result.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'TEST_RUNS') return Boolean(evt.test_case_id);
    if (filterType === 'ENROLMENT') return evt.action_type.includes('ENROLMENT');
    if (filterType === 'EXAM') return evt.action_type.includes('EXAM');
    if (filterType === 'VERIFICATION') return evt.action_type.includes('VERIFICATION');
    return true;
  });

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mooc_registrar_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              SECTION 8
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Activity & Evidence Audit Log
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chronological, immutable event ledger tracking institutional decisions, human approvals, idempotency keys, and verification proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJson}
            disabled={auditLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all local audit events?')) {
                clearAuditLogs();
              }
            }}
            disabled={auditLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Events</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Event ID, student, course, action..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Actions ({auditLogs.length})</option>
            <option value="TEST_RUNS">Official Test Runs</option>
            <option value="ENROLMENT">Course Enrolments</option>
            <option value="EXAM">Exam Registrations</option>
            <option value="VERIFICATION">Independent Verifications</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Student & Course</th>
                <th className="py-3 px-4">Approval State</th>
                <th className="py-3 px-4">Result Status</th>
                <th className="py-3 px-4">Verification Proof</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((evt) => (
                  <tr key={evt.event_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {evt.event_id}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(evt.timestamp).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">
                        {evt.action_type}
                      </span>
                      {evt.test_case_id && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded-xs bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold">
                          {evt.test_case_id}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{evt.student_id}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{evt.course_id}</p>
                    </td>

                    <td className="py-3 px-4">
                      {evt.approval_status ? (
                        <span
                          className={`font-semibold text-[10px] px-2 py-0.5 rounded-sm ${
                            evt.approval_status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : evt.approval_status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {evt.approval_status}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold text-[10px] px-2 py-0.5 rounded-sm ${
                          evt.result_status === 'SUCCEEDED' || evt.result_status === 'VERIFIED' || evt.result_status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-900'
                            : evt.result_status === 'AWAITING_APPROVAL' || evt.result_status === 'PENDING_CONFIRMATION'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        {evt.result_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-[200px] truncate text-[11px] text-slate-600" title={evt.verification_result}>
                      {evt.verification_result || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-mono">
                  Audit Snapshot: {selectedEvent.event_id}
                </h3>
                <p className="text-xs text-slate-300">
                  Logged at {new Date(selectedEvent.timestamp).toISOString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Action Type:</span>
                  <p className="font-bold text-slate-900">{selectedEvent.action_type}</p>
                </div>
                <div>
                  <span className="text-slate-500">Result Status:</span>
                  <p className="font-bold text-slate-900">{selectedEvent.result_status}</p>
                </div>
                <div>
                  <span className="text-slate-500">Student ID:</span>
                  <p className="font-mono text-slate-900">{selectedEvent.student_id}</p>
                </div>
                <div>
                  <span className="text-slate-500">Course ID:</span>
                  <p className="font-mono text-slate-900">{selectedEvent.course_id}</p>
                </div>
                {selectedEvent.idempotency_key && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Idempotency Key:</span>
                    <p className="font-mono text-indigo-900 font-bold bg-white p-1 rounded-sm border border-slate-200">
                      {selectedEvent.idempotency_key}
                    </p>
                  </div>
                )}
                {selectedEvent.source_record_id_or_url && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Source Evidence URL:</span>
                    <p className="font-mono text-slate-800 break-all">
                      {selectedEvent.source_record_id_or_url}
                    </p>
                  </div>
                )}
                {selectedEvent.verification_result && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Verification Result:</span>
                    <p className="font-medium text-emerald-800">
                      {selectedEvent.verification_result}
                    </p>
                  </div>
                )}
                {selectedEvent.error_details && (
                  <div className="col-span-2 bg-rose-50 p-2 rounded-sm border border-rose-200 text-rose-900">
                    <span className="font-bold">Error Details:</span>
                    <p>{selectedEvent.error_details}</p>
                  </div>
                )}
              </div>

              {/* JSON Input Snapshot */}
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Captured Input Snapshot
                </span>
                <pre className="mt-1 bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto max-h-[200px]">
                  {JSON.stringify(selectedEvent.input_snapshot, null, 2)}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
