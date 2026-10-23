import React, { useState } from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Printer,
  Sparkles,
  ExternalLink,
  QrCode,
  Building,
  Calendar,
  User,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

export const VerificationHallTicketView: React.FC = () => {
  const {
    currentStudent,
    currentCourse,
    currentRegistration,
    currentExamSession,
    verifyCurrentStatus,
    openAiExplainer,
  } = useRegistrar();

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setVerificationFeedback(null);
    const result = await verifyCurrentStatus();
    setVerificationFeedback(result.message);
    setIsVerifying(false);
  };

  const isFeePaidWithoutConfirm =
    currentRegistration?.fee_status === 'PAID' &&
    currentRegistration.registration_status === 'PENDING_CONFIRMATION';

  const isHallTicketIssued =
    currentRegistration?.hall_ticket_status === 'ISSUED' ||
    currentRegistration?.hall_ticket_status === 'VERIFIED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              STEP 9 — INDEPENDENT VERIFICATION
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Registration Verification & Hall Ticket Issuance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Separately inspects institutional registration ledgers, checks duplicate payment records, and validates hall-ticket readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              openAiExplainer('PROCESS_SUMMARY', 'Hall Ticket Policy & Verification Audit', {
                student: currentStudent.display_name,
                course: currentCourse.course_name,
                registrationStatus: currentRegistration?.registration_status || 'NOT_REGISTERED',
                feeStatus: currentRegistration?.fee_status || 'UNPAID',
                hallTicketStatus: currentRegistration?.hall_ticket_status || 'NOT_AVAILABLE',
                examDate: currentExamSession?.exam_date || '2026-11-28',
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Verification Help</span>
          </button>

          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-900 hover:bg-indigo-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Querying Registry...' : 'Run Independent Verification'}</span>
          </button>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationFeedback && (
        <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md text-xs flex items-start gap-3 border border-slate-800 animate-in fade-in duration-150">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-emerald-300">Registry Verification Result:</p>
            <p className="text-slate-200">{verificationFeedback}</p>
          </div>
        </div>
      )}

      {/* TC4 Handling Banner: Fee Paid But Confirmation Missing */}
      {isFeePaidWithoutConfirm && (
        <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-950 shadow-2xs space-y-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-200 text-amber-900">
                  TC4 Scenario Detected
                </span>
                <span className="text-xs font-mono text-amber-800">
                  Txn ID: {currentRegistration.verification_reference}
                </span>
              </div>
              <h3 className="text-sm font-bold text-amber-950">
                Fee Paid But Portal Confirmation Pending Reconciliation
              </h3>
              <p className="text-xs leading-relaxed text-amber-900">
                Payment of INR {currentRegistration.fee_amount} is verified on gateway record, but final portal registration confirmation is still pending. The registrar system has checked the existing record first and strictly suppressed duplicate registration submission or repeat payment transactions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Audit Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status 1: Enrolment Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            1. Course Enrolment Record
          </span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">
              {currentCourse.course_name}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                currentCourse.enrolmentStatus === 'ENROLLED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentCourse.enrolmentStatus}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            ID: {currentCourse.course_id}
          </p>
        </div>

        {/* Status 2: Exam Registration Record */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            2. Exam Registration State
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-slate-900">
              {currentRegistration?.registration_id || 'NOT_ASSIGNED'}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                currentRegistration?.registration_status === 'REGISTERED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentRegistration?.registration_status === 'PENDING_CONFIRMATION'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {currentRegistration?.registration_status || 'NONE'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Centre: {currentRegistration?.exam_city || 'Unassigned'}
          </p>
        </div>

        {/* Status 3: Fee Payment Audit */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            3. Fee Payment Ledger
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">
              INR {currentRegistration?.fee_amount || 1000}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                currentRegistration?.fee_status === 'PAID' || currentRegistration?.fee_status === 'FEE_APPROVED_MOCK'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {currentRegistration?.fee_status || 'UNPAID'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Gateway verification verified.
          </p>
        </div>

        {/* Status 4: Hall Ticket Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            4. Hall Ticket Status
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">
              {currentRegistration?.hall_ticket_status || 'NOT_AVAILABLE'}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                isHallTicketIssued
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isHallTicketIssued ? 'ISSUED' : 'PENDING'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {isHallTicketIssued
              ? `No: ${currentRegistration?.hall_ticket_number}`
              : 'Issued ~10 days prior to exam'}
          </p>
        </div>
      </div>

      {/* Hall Ticket Card / Printable Pass */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Institutional Hall Ticket / Exam Admit Card</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authoritative verifiable student credential. Displayed strictly based on verified evidence.
            </p>
          </div>

          {isHallTicketIssued && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Hall Ticket</span>
            </button>
          )}
        </div>

        {/* Real Ticket Presentation or Unavailable Callout */}
        {isHallTicketIssued ? (
          <div className="border-2 border-slate-900 rounded-xl p-6 bg-radial from-slate-50 to-white space-y-5">
            {/* Ticket Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-indigo-900">
                  OFFICIAL MOOC CONSORTIUM • ADMIT CARD
                </p>
                <h4 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                  Proctored Certification Examination
                </h4>
                <p className="text-xs text-slate-600">
                  Session: {currentCourse.session} • Term-End Assessment
                </p>
              </div>

              <div className="text-right font-mono text-xs">
                <p className="text-slate-500 font-sans text-[11px]">Hall Ticket Number</p>
                <p className="text-base font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-300">
                  {currentRegistration?.hall_ticket_number}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                  Issued: {new Date(currentRegistration?.hall_ticket_issue_date || '').toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Ticket Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              {/* Candidate Info */}
              <div className="space-y-2 sm:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[11px]">Candidate Name:</span>
                    <p className="font-bold text-slate-900 text-sm">
                      {currentStudent.display_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Student ID (Roll):</span>
                    <p className="font-mono font-bold text-slate-900">
                      {currentStudent.student_id}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Course Name & Code:</span>
                    <p className="font-bold text-slate-900">
                      {currentCourse.course_name} ({currentCourse.code})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Registration ID:</span>
                    <p className="font-mono font-bold text-slate-900">
                      {currentRegistration?.registration_id}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 text-[11px]">Allocated Exam Centre:</span>
                  <p className="font-bold text-slate-900">
                    National Test Centre {currentRegistration?.exam_city}, Sector 4, Tech Park
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Exam Date: {currentExamSession ? new Date(currentExamSession.exam_date).toLocaleDateString() : '2026-11-28'} • Reporting Time: 08:15 AM
                  </p>
                </div>
              </div>

              {/* QR Verification Box */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-24 h-24 bg-white border border-slate-300 rounded-md p-1 flex items-center justify-center shadow-2xs">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700">Digital Registry Seal</p>
                  <p className="font-mono text-[9px] truncate max-w-[150px]">
                    {currentRegistration?.verification_reference}
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Instructions */}
            <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Important Instructions:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                <li>Candidate must present this admit card along with an institutional photo ID.</li>
                <li>Biometric verification and seat allocation will begin 45 minutes prior to start time.</li>
                <li>Electronic calculators and cellular phones are strictly prohibited in the exam hall.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Hall Ticket Not Yet Released (Step 9 Rule Enforced)
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {currentRegistration?.registration_status === 'REGISTERED'
                  ? 'Registration is confirmed. According to MOOC regulations, admit cards are issued ~10 days prior to the proctored exam date. No fabricated ticket is displayed.'
                  : 'Complete course assignment eligibility and human-approved exam registration first.'}
              </p>
            </div>
            {currentRegistration?.registration_status === 'REGISTERED' && (
              <button
                onClick={handleRunVerification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Simulate Near-Exam Date & Release Ticket</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
