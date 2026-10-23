import React, { useState } from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Fingerprint,
  Info,
  Calendar,
  Building,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

export const HumanApprovalModal: React.FC = () => {
  const {
    isApprovalModalOpen,
    proposedAction,
    closeApprovalModal,
    handleApproveAction,
    handleCancelAction,
  } = useRegistrar();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isApprovalModalOpen || !proposedAction) return null;

  const isExam = proposedAction.action_type === 'EXAM_REGISTRATION';
  const isBelowCutoff = proposedAction.eligibilityDecision?.status === 'BELOW_CUTOFF';
  const isWindowClosed = proposedAction.windowStatus === 'CLOSED';
  const hasFatalBlocker = isExam && (isBelowCutoff || isWindowClosed);

  const onConfirm = async () => {
    if (hasFatalBlocker) {
      alert('Action blocked: Institutional constraints (eligibility cutoff or schedule) cannot be overridden by human approval.');
      return;
    }
    setIsSubmitting(true);
    await handleApproveAction();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Human Action Approval Required (Step 7)
              </h3>
              <p className="text-xs text-slate-300">
                Verify proposed action payload and institutional constraints before execution
              </p>
            </div>
          </div>
          <button
            onClick={closeApprovalModal}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
          {/* Fatal Blocker Banner if Below Cutoff or Closed */}
          {hasFatalBlocker && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-rose-700">
                  Execution Guard: Action Strictly Blocked
                </p>
                <p className="text-xs mt-0.5">
                  {isBelowCutoff
                    ? `Assignment average (${proposedAction.eligibilityDecision?.assignment_average}%) is below the official cutoff (${proposedAction.eligibilityDecision?.cutoff}%). Academic rules cannot be overridden merely by clicking Approve.`
                    : 'The exam registration window has officially closed.'}
                </p>
              </div>
            </div>
          )}

          {/* Action Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Proposed Action
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-800">
                {proposedAction.action_type === 'ENROLMENT'
                  ? 'COURSE ENROLMENT'
                  : 'EXAM REGISTRATION & SEAT ALLOCATION'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Student Record</p>
                <p className="font-semibold text-slate-900">
                  {proposedAction.student.display_name}
                </p>
                <p className="text-slate-500 font-mono text-[11px]">
                  {proposedAction.student.student_id}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Course & Session</p>
                <p className="font-semibold text-slate-900">
                  {proposedAction.course.course_name}
                </p>
                <p className="text-slate-500 font-mono text-[11px]">
                  {proposedAction.course.course_id} • {proposedAction.course.session}
                </p>
              </div>

              {isExam && (
                <>
                  <div>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      Exam City
                    </p>
                    <p className="font-semibold text-slate-900">
                      {proposedAction.chosenCity || 'Not selected'}
                    </p>
                    {proposedAction.alternativeCity && (
                      <p className="text-slate-500 text-[11px]">
                        Alt: {proposedAction.alternativeCity}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-slate-500 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-400" />
                      Fee & Payment Status
                    </p>
                    <p className="font-semibold text-slate-900">
                      INR {proposedAction.feeAmount || 1000} (Synthetic Mock)
                    </p>
                    <p className="text-emerald-700 font-medium text-[11px]">
                      {proposedAction.feeStatus || 'FEE_APPROVED_MOCK'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Institutional Constraints Check Table */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Pre-Execution Requirement Checks
            </h4>

            <div className="space-y-1.5 text-xs">
              {/* Eligibility Check */}
              <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Assignment Score Average vs Cutoff</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    proposedAction.eligibilityDecision?.status === 'MET'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {proposedAction.eligibilityDecision?.status === 'MET' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  {proposedAction.eligibilityDecision?.assignment_average !== null
                    ? `${proposedAction.eligibilityDecision?.assignment_average}% (Cutoff: ${proposedAction.eligibilityDecision?.cutoff}%)`
                    : 'NO SCORES'}
                </span>
              </div>

              {/* Registration Window */}
              {isExam && (
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Registration Window Schedule
                  </span>
                  <span
                    className={`font-semibold ${
                      proposedAction.windowStatus === 'OPEN'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {proposedAction.windowStatus || 'OPEN'}
                  </span>
                </div>
              )}

              {/* Idempotency Key */}
              <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Stable Idempotency Key</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {proposedAction.idempotency_key}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings list if any */}
          {proposedAction.warnings && proposedAction.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
              <p className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Advisory Warnings:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {proposedAction.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Audit & Non-Payment Notice */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              This transaction is simulated using mock MOOC portal rules. No real financial transaction will occur. An immutable audit record will be logged upon confirmation.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCancelAction}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Cancel / Reject
          </button>

          <button
            onClick={onConfirm}
            disabled={hasFatalBlocker || isSubmitting}
            className={`px-5 py-2 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              hasFatalBlocker
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-900 hover:bg-indigo-800 text-white'
            }`}
          >
            {isSubmitting ? (
              <span>Executing via API...</span>
            ) : hasFatalBlocker ? (
              <span>Execution Blocked by Rules</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Explicitly Approve & Execute</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
