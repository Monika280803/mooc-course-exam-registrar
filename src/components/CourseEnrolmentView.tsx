import React, { useState } from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  BookOpen,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Fingerprint,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { generateIdempotencyKey } from '../utils/registrarEngine';

export const CourseEnrolmentView: React.FC = () => {
  const {
    currentStudent,
    courses,
    currentCourse,
    setCurrentCourse,
    openApprovalModal,
    actionRecords,
    openAiExplainer,
    eligibilityDecision,
  } = useRegistrar();

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState(currentCourse.course_id);
  const [customSession, setCustomSession] = useState(currentCourse.session);
  const [studentNotes, setStudentNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedCourseObj = courses.find((c) => c.course_id === selectedCourseId) || currentCourse;

  const handleCourseChange = (id: string) => {
    setSelectedCourseId(id);
    const found = courses.find((c) => c.course_id === id);
    if (found) {
      setCurrentCourse(found);
      setCustomSession(found.session);
    }
  };

  const handleInitiateEnrolment = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedCourseObj) {
      setValidationError('Please select a valid MOOC course.');
      return;
    }

    if (!customSession || customSession.trim() === '') {
      setValidationError('Course session is required.');
      return;
    }

    if (selectedCourseObj.enrolmentStatus === 'ENROLLED') {
      setValidationError(`Student is already enrolled in ${selectedCourseObj.course_name}.`);
      return;
    }

    const idempotencyKey = generateIdempotencyKey(
      'ENROLMENT',
      currentStudent.student_id,
      selectedCourseObj.course_id,
      Date.now().toString(36)
    );

    // Open human approval modal with proposed action payload
    openApprovalModal({
      action_type: 'ENROLMENT',
      student: currentStudent,
      course: selectedCourseObj,
      warnings: [],
      idempotency_key: idempotencyKey,
    });
  };

  // Recent enrolment action history for this student & course
  const enrolmentActions = actionRecords.filter(
    (a) => a.action_type === 'ENROLMENT' && a.student_id === currentStudent.student_id
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              STEP 1 & STEP 2
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Course Enrolment & Registration Setup
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Collect, validate, and retrieve institutional course records before executing human-approved enrolment.
          </p>
        </div>

        <button
          onClick={() =>
            openAiExplainer('PROCESS_SUMMARY', 'Enrolment Rules & Guidance', {
              course: selectedCourseObj.course_name,
              session: customSession,
              currentStatus: selectedCourseObj.enrolmentStatus,
              prerequisites: 'Verified open intake for July - Nov 2026',
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explain Enrolment Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card (Section 4 Input Form) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Student Enrolment Intake Form</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Strict Input Validation
            </span>
          </div>

          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Validation Error</p>
                <p>{validationError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleInitiateEnrolment} className="space-y-4 text-xs">
            {/* Student ID & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Student Name / Synthetic ID *
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${currentStudent.display_name} (${currentStudent.student_id})`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Assigned stable synthetic student identifier.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Registered Email Address *
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentStudent.email}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Course Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select MOOC Course *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  {courses.map((crs) => (
                    <option key={crs.course_id} value={crs.course_id}>
                      {crs.course_name} ({crs.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Course ID: {selectedCourseObj.course_id} • Duration: {selectedCourseObj.durationWeeks} weeks
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Course Session / Term *
                </label>
                <select
                  value={customSession}
                  onChange={(e) => setCustomSession(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="July - Nov 2026">July - Nov 2026 (Active Intake)</option>
                  <option value="Jan - Apr 2026">Jan - Apr 2026 (Past Intake)</option>
                  <option value="Jan - Apr 2027">Jan - Apr 2027 (Upcoming Intake)</option>
                </select>
              </div>
            </div>

            {/* Additional Student Notes */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Optional Study Notes or Special Considerations
              </label>
              <textarea
                rows={2}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="e.g. Pursuing credit transfer for college degree"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-normal focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Retrieval Evidence Box (Step 2) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-indigo-600" />
                Retrieved Institutional Source Record (Step 2)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Source Endpoint: </span>
                  <span className="font-mono text-slate-800 break-all">
                    {selectedCourseObj.source_reference}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Retrieval Timestamp: </span>
                  <span className="text-slate-800">2026-10-23T08:00:00Z (Verified)</span>
                </div>
              </div>
            </div>

            {/* Submit / Request Approval Button */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-slate-500 text-[11px]">
                Current Enrolment State:{' '}
                <span className="font-semibold text-slate-800">
                  {selectedCourseObj.enrolmentStatus}
                </span>
              </div>

              <button
                type="submit"
                disabled={selectedCourseObj.enrolmentStatus === 'ENROLLED'}
                className={`px-5 py-2.5 rounded-lg font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer ${
                  selectedCourseObj.enrolmentStatus === 'ENROLLED'
                    ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                    : 'bg-indigo-900 hover:bg-indigo-800 text-white'
                }`}
              >
                <Fingerprint className="w-4 h-4" />
                <span>
                  {selectedCourseObj.enrolmentStatus === 'ENROLLED'
                    ? 'Already Enrolled'
                    : 'Request Approval & Enrol (Step 7)'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Course Status & Enrolment Audit */}
        <div className="space-y-4">
          {/* Active Course Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolment Status Card
            </h4>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-sm uppercase text-[10px] ${
                    selectedCourseObj.enrolmentStatus === 'ENROLLED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {selectedCourseObj.enrolmentStatus}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Course Code:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedCourseObj.code}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-800 font-medium">
                  {selectedCourseObj.department}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Session:</span>
                <span className="text-slate-800 font-medium">
                  {selectedCourseObj.session}
                </span>
              </div>

              {selectedCourseObj.enrolledAt && (
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Enrolled At:</span>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    {new Date(selectedCourseObj.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center gap-1 text-slate-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Enrolment Requirements:
              </p>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-slate-600">
                <li>Active student account identifier.</li>
                <li>Human approval review confirmation.</li>
                <li>Unique idempotency key check.</li>
                <li>Zero tuition fee for standard track.</li>
              </ul>
            </div>
          </div>

          {/* Enrolment Action History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Enrolment Attempts</span>
              <span className="font-mono text-slate-400">({enrolmentActions.length})</span>
            </h4>

            {enrolmentActions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No enrolment attempts yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {enrolmentActions.map((rec) => (
                  <div
                    key={rec.action_id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">
                        {rec.action_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                          rec.action_status === 'SUCCEEDED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.action_status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.action_status}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      {rec.result_message || 'Enrolment requested'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Key: {rec.idempotency_key}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
