import React from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  User,
  BookOpen,
  Award,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Building,
  CreditCard,
  Hash,
} from 'lucide-react';
import { calculateAssignmentAverage } from '../utils/registrarEngine';

interface StudentDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const {
    currentStudent,
    currentCourse,
    courses,
    setCurrentCourse,
    currentCourseAssignments,
    eligibilityDecision,
    currentExamSession,
    currentRegistration,
    actionRecords,
    auditLogs,
    openAiExplainer,
    verifyCurrentStatus,
  } = useRegistrar();

  const calc = calculateAssignmentAverage(currentCourseAssignments);

  // Status metrics
  const pendingApprovalsCount = actionRecords.filter(
    (a) => a.action_status === 'AWAITING_APPROVAL'
  ).length;

  const completedActionsCount = actionRecords.filter(
    (a) => a.action_status === 'SUCCEEDED'
  ).length;

  const failedActionsCount = actionRecords.filter(
    (a) => a.action_status === 'FAILED'
  ).length;

  const unresolvedIssuesCount =
    (eligibilityDecision.status === 'BELOW_CUTOFF' ? 1 : 0) +
    (currentRegistration?.registration_status === 'PENDING_CONFIRMATION' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-xs border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                Active Student Workspace
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {currentStudent.student_id}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {currentStudent.display_name}
            </h2>
            <p className="text-xs text-slate-300">
              Assisting your enrolment, weekly performance tracking, and verified exam registration for the {currentCourse.session} session.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                openAiExplainer('PROCESS_SUMMARY', 'My Course & Exam Status Summary', {
                  student: currentStudent.display_name,
                  course: currentCourse.course_name,
                  enrolmentStatus: currentCourse.enrolmentStatus,
                  assignmentAverage: calc.averagePercentage,
                  eligibilityStatus: eligibilityDecision.status,
                  examRegistration: currentRegistration?.registration_status || 'NOT_REGISTERED',
                  hallTicket: currentRegistration?.hall_ticket_status || 'NOT_AVAILABLE',
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Status Briefing</span>
            </button>

            <button
              onClick={() => verifyCurrentStatus()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Verify Records (Step 9)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Selector Bar */}
      <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-900" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Current Course Focus:
          </span>
          <select
            value={currentCourse.course_id}
            onChange={(e) => {
              const c = courses.find((crs) => crs.course_id === e.target.value);
              if (c) setCurrentCourse(c);
            }}
            className="text-xs font-bold text-indigo-950 bg-indigo-50/60 border border-indigo-200 rounded-md px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
          >
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_name} ({c.code}) - {c.enrolmentStatus}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Enrolment Status:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] ${
              currentCourse.enrolmentStatus === 'ENROLLED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {currentCourse.enrolmentStatus}
          </span>
          {currentCourse.enrolmentStatus !== 'ENROLLED' && (
            <button
              onClick={() => onNavigate('enrolment')}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold underline cursor-pointer ml-1"
            >
              Enrol Now
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary Cards: A, B, C, D (Section 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: Student and Course */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                A. Student & Enrolment
              </span>
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {currentCourse.course_name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Code: {currentCourse.code} • {currentCourse.department}
            </p>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Session:</span>
                <span className="font-semibold text-slate-800">{currentCourse.session}</span>
              </div>
              <div className="flex justify-between">
                <span>Enrolment State:</span>
                <span className="font-semibold text-emerald-700">{currentCourse.enrolmentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Source Ref:</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]" title={currentCourse.source_reference}>
                  {currentCourse.source_reference}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('enrolment')}
            className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
          >
            <span>Manage Enrolment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card B: Assignment Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                B. Assignments & Eligibility
              </span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {calc.averagePercentage !== null ? `${calc.averagePercentage}%` : 'N/A'}
              </span>
              <span className="text-xs text-slate-500">
                Cutoff: {eligibilityDecision.cutoff}%
              </span>
            </div>
            <p className="text-xs mt-1">
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  eligibilityDecision.status === 'MET'
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {eligibilityDecision.status === 'MET' ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                {eligibilityDecision.status === 'MET'
                  ? 'Score Requirement Met'
                  : 'Below Mandatory Cutoff'}
              </span>
            </p>
            <div className="mt-2.5 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Completed Weeks:</span>
                <span className="font-semibold">{calc.validScoresCount} / {calc.totalAssignmentsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Missing Submissions:</span>
                <span className={calc.missingAssignmentsCount > 0 ? 'text-amber-700 font-semibold' : 'text-slate-800'}>
                  {calc.missingAssignmentsCount > 0 ? `${calc.missingAssignmentsCount} week(s)` : 'None'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('eligibility')}
            className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
          >
            <span>View Scores & Cutoff</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card C: Exam Registration */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                C. Exam Registration
              </span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{currentRegistration ? currentRegistration.registration_status : 'NOT_REGISTERED'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Centre: {currentRegistration?.exam_city || currentExamSession?.preferred_city || 'Not Allocated'}
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Registration ID:</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">
                  {currentRegistration?.registration_id || 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fee Approval:</span>
                <span className="font-semibold text-emerald-700">
                  {currentRegistration?.fee_status || 'UNPAID'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Deadline:</span>
                <span className="text-slate-800 font-medium">
                  {currentExamSession ? new Date(currentExamSession.registration_deadline).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('exam-reg')}
            className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
          >
            <span>Exam City & Registration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card D: Hall Ticket */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                D. Hall Ticket Verification
              </span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  currentRegistration?.hall_ticket_status === 'ISSUED' || currentRegistration?.hall_ticket_status === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : currentRegistration?.hall_ticket_status === 'PENDING'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {currentRegistration?.hall_ticket_status || 'NOT_AVAILABLE'}
              </span>
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Ticket Number:</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">
                  {currentRegistration?.hall_ticket_number || 'Awaiting Issue'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Verified:</span>
                <span className="text-[11px] text-slate-500">
                  {currentRegistration?.last_verified_at ? new Date(currentRegistration.last_verified_at).toLocaleTimeString() : 'Not verified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Exam Date:</span>
                <span className="text-slate-800 font-medium">
                  {currentExamSession ? new Date(currentExamSession.exam_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('verification')}
            className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
          >
            <span>Verify & View Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Section E: Action Summary & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action Metrics Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>E. Workflow Action Summary</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100">
              <p className="text-[11px] font-medium text-slate-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-indigo-950 mt-1">{pendingApprovalsCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <p className="text-[11px] font-medium text-slate-600">Completed Actions</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{completedActionsCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100">
              <p className="text-[11px] font-medium text-slate-600">Failed / Cancelled</p>
              <p className="text-2xl font-bold text-rose-800 mt-1">{failedActionsCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100">
              <p className="text-[11px] font-medium text-slate-600">Unresolved Issues</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{unresolvedIssuesCount}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span>Four Official Test Scenarios:</span>
              <button
                onClick={() => onNavigate('test-scenarios')}
                className="text-indigo-700 font-bold hover:underline cursor-pointer"
              >
                Inspect Runner
              </button>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>Full Evidence & Audit Log:</span>
              <button
                onClick={() => onNavigate('audit-log')}
                className="text-indigo-700 font-bold hover:underline cursor-pointer"
              >
                View ({auditLogs.length} events)
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Log Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Traceable Event History</span>
            </h3>
            <button
              onClick={() => onNavigate('audit-log')}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
            >
              View All Events ({auditLogs.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No events recorded yet. Run a test scenario or execute enrolment.
              </div>
            ) : (
              auditLogs.slice(0, 5).map((evt) => (
                <div key={evt.event_id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">
                      {evt.action_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Event ID: {evt.event_id} • Course: {evt.course_id}
                    </p>
                    {evt.verification_result && (
                      <p className="text-[11px] text-indigo-900 font-medium">
                        Verification: {evt.verification_result}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                        evt.result_status === 'SUCCEEDED' || evt.result_status === 'VERIFIED' || evt.result_status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : evt.result_status === 'AWAITING_APPROVAL' || evt.result_status === 'PENDING_CONFIRMATION'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {evt.result_status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
