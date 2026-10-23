import React, { useState } from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  Calendar,
  Building,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import {
  checkRegistrationWindow,
  checkExamCity,
  generateIdempotencyKey,
} from '../utils/registrarEngine';

export const ExamRegistrationView: React.FC = () => {
  const {
    currentStudent,
    currentCourse,
    currentExamSession,
    eligibilityDecision,
    currentRegistration,
    openApprovalModal,
    openAiExplainer,
    actionRecords,
  } = useRegistrar();

  const [preferredCity, setPreferredCity] = useState(
    currentExamSession?.preferred_city || 'Mumbai'
  );
  const [selectedAlternativeCity, setSelectedAlternativeCity] = useState<string>('');
  const [feeApprovedByStudent, setFeeApprovedByStudent] = useState<boolean>(true);

  if (!currentExamSession) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
        <p className="text-sm font-bold text-slate-700">No Exam Session Configured</p>
        <p className="text-xs text-slate-500">
          No active exam schedule found for {currentCourse.course_name}. Status: NEEDS REVIEW.
        </p>
      </div>
    );
  }

  // STEP 5: Registration Window Check
  const windowCheck = checkRegistrationWindow(
    currentExamSession.registration_open_at,
    currentExamSession.registration_deadline
  );

  // STEP 6: Exam City Check
  const cityCheck = checkExamCity(currentExamSession, preferredCity);

  // Current active city
  const effectiveCity =
    !cityCheck.isAvailable && selectedAlternativeCity
      ? selectedAlternativeCity
      : preferredCity;

  // Eligibility Check
  const isEligible = eligibilityDecision.status === 'MET';

  // Warnings list
  const warnings: string[] = [];
  if (!isEligible) {
    warnings.push(`Assignment average (${eligibilityDecision.assignment_average}%) is below the mandatory cutoff (${eligibilityDecision.cutoff}%).`);
  }
  if (!cityCheck.isAvailable && !selectedAlternativeCity) {
    warnings.push(`Preferred city ${preferredCity} is FULL. Please choose a confirmed alternative city.`);
  }
  if (windowCheck.status !== 'OPEN') {
    warnings.push(`Registration window is currently ${windowCheck.status}.`);
  }

  // Handle Proceed to Approval
  const handleProceedToRegistration = () => {
    if (!isEligible) {
      alert('Academic Eligibility Guard: Registration cannot proceed because your assignment score is strictly below the cutoff.');
      return;
    }

    if (windowCheck.status === 'CLOSED') {
      alert('Schedule Guard: Registration deadline has passed. Window is closed.');
      return;
    }

    if (!cityCheck.isAvailable && !selectedAlternativeCity) {
      alert('Exam Centre Guard: Preferred city is full. Please pick an alternative city.');
      return;
    }

    const idempotencyKey = generateIdempotencyKey(
      'EXAM_REGISTRATION',
      currentStudent.student_id,
      currentCourse.course_id,
      Date.now().toString(36)
    );

    openApprovalModal({
      action_type: 'EXAM_REGISTRATION',
      student: currentStudent,
      course: currentCourse,
      examSession: currentExamSession,
      chosenCity: effectiveCity,
      alternativeCity: selectedAlternativeCity || undefined,
      feeAmount: currentExamSession.fee_amount || 1000,
      feeStatus: feeApprovedByStudent ? 'FEE_APPROVED_MOCK' : 'UNPAID',
      eligibilityDecision,
      windowStatus: windowCheck.status,
      warnings,
      idempotency_key: idempotencyKey,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              STEP 5 & 6 & 7
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Exam Registration & Seat Allocation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enforces registration window schedules, verifies exam-centre seat capacities, checks alternative cities, and requires human approval.
          </p>
        </div>

        <button
          onClick={() =>
            openAiExplainer('REGISTRATION_BLOCKED', 'Exam Registration Guidelines & City Status', {
              course: currentCourse.course_name,
              windowStatus: windowCheck.status,
              deadline: currentExamSession.registration_deadline,
              eligibilityStatus: eligibilityDecision.status,
              preferredCity,
              cityCapacity: cityCheck.preferredCityInfo ? `${cityCheck.preferredCityInfo.enrolledCount}/${cityCheck.preferredCityInfo.capacity}` : 'N/A',
              isCityFull: !cityCheck.isAvailable,
              selectedAlternative: selectedAlternativeCity || 'None',
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explain Registration Rules</span>
        </button>
      </div>

      {/* Warning Alert if Student is Below Cutoff */}
      {!isEligible && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-900">
              Warning: Exam Fee Approval & Registration Blocked (TC2 Demonstration)
            </h3>
            <p className="text-xs leading-relaxed">
              Your assignment average is <span className="font-bold">{eligibilityDecision.assignment_average}%</span>, which is strictly below the official mandatory cutoff of <span className="font-bold">{eligibilityDecision.cutoff}%</span>.
              Academic regulations prohibit proceeding through the fee approval or exam seat booking steps until the score cutoff requirement is satisfied.
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Registration Window Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>STEP 5 — Registration Window Schedule</span>
          </h3>
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase tracking-wider ${
              windowCheck.status === 'OPEN'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}
          >
            {windowCheck.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-slate-500 font-medium">Opening Date</p>
            <p className="text-slate-900 font-bold text-sm mt-0.5">
              {new Date(currentExamSession.registration_open_at).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-slate-400">Portal intake opened</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-slate-500 font-medium">Registration Deadline</p>
            <p className="text-slate-900 font-bold text-sm mt-0.5">
              {new Date(currentExamSession.registration_deadline).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-slate-400">Strict closing cutoff</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-slate-500 font-medium">Scheduled Exam Date</p>
            <p className="text-slate-900 font-bold text-sm mt-0.5">
              {new Date(currentExamSession.exam_date).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-slate-400">Proctored session</p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="flex items-center gap-1 font-mono">
            <ExternalLink className="w-3 h-3 text-indigo-600" />
            Schedule Authority: {currentExamSession.source_reference}
          </span>
          <span className="text-slate-700 font-medium">{windowCheck.reason}</span>
        </div>
      </div>

      {/* Step 6: Exam City Availability & Capacity (TC3 Showcase) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>STEP 6 — Exam City Availability & Capacity Check</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Checks live seat occupancies across institutional test centres. Demonstrates alternative allocation when full.
            </p>
          </div>
        </div>

        {/* Preferred City Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Preferred Exam City
            </label>
            <select
              value={preferredCity}
              onChange={(e) => {
                setPreferredCity(e.target.value);
                setSelectedAlternativeCity('');
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
            >
              {currentExamSession.available_cities.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.isFull ? 'FULL - 0 Seats' : `${c.capacity - c.enrolledCount} Seats Available`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Availability Verdict
            </label>
            <div
              className={`p-2 rounded-lg font-semibold flex items-center justify-between ${
                cityCheck.isAvailable
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              <span>{preferredCity}: {cityCheck.isAvailable ? 'Seats Available' : 'UNAVAILABLE (100% Full)'}</span>
              <span className="font-mono text-[11px]">
                {cityCheck.preferredCityInfo ? `${cityCheck.preferredCityInfo.enrolledCount}/${cityCheck.preferredCityInfo.capacity}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* TC3 Feature: If Preferred City is Full, Show Supported Alternatives */}
        {!cityCheck.isAvailable && (
          <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-lg space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  Preferred Exam City ({preferredCity}) is Full (TC3 Trigger)
                </p>
                <p className="text-amber-800 mt-0.5">
                  All {cityCheck.preferredCityInfo?.capacity} seats in {preferredCity} have been filled. The registrar system has retrieved the following confirmed alternative exam cities with open capacity:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {cityCheck.alternativeCities.map((alt) => {
                const isSelected = selectedAlternativeCity === alt.city;
                const remaining = alt.capacity - alt.enrolledCount;
                return (
                  <button
                    key={alt.city}
                    type="button"
                    onClick={() => setSelectedAlternativeCity(alt.city)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{alt.city}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                          isSelected ? 'bg-indigo-800 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {remaining} Open
                      </span>
                    </div>
                    <p className={`text-[11px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                      State: {alt.state} • Distance: ~{alt.distanceKm} km
                    </p>
                    <p className={`text-[10px] mt-2 font-semibold ${isSelected ? 'text-indigo-100' : 'text-indigo-700'}`}>
                      {isSelected ? '✓ Selected as Alternative' : 'Click to select this alternative'}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedAlternativeCity && (
              <div className="p-2.5 bg-white border border-indigo-200 rounded-md text-[11px] text-indigo-900 flex items-center justify-between">
                <span>
                  Confirmed Alternative Selected: <span className="font-bold">{selectedAlternativeCity}</span>
                </span>
                <span className="text-emerald-700 font-semibold">Ready for Review Screen</span>
              </div>
            )}
          </div>
        )}

        {/* Capacity Overview Progress Bars */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-700">Live Centre Capacity Progress:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {currentExamSession.available_cities.map((c) => {
              const pct = Math.round((c.enrolledCount / c.capacity) * 100);
              return (
                <div key={c.city} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="font-bold text-slate-800">{c.city}</span>
                    <span className={c.isFull ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                      {c.enrolledCount}/{c.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.isFull ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 7 & 8: Exam Fee & Human Approval Submission Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>STEP 7 — Fee Approval & Action Submission</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Requires Human Review Step
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <p className="font-semibold text-slate-700">Exam Fee Amount</p>
            <p className="text-2xl font-black text-slate-900">
              INR {currentExamSession.fee_amount || 1000}
            </p>
            <p className="text-[11px] text-slate-500">
              Synthetic institutional exam evaluation fee. No real payment transaction will be initiated.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <p className="font-semibold text-slate-700">Student Fee Confirmation</p>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={feeApprovedByStudent}
                onChange={(e) => setFeeApprovedByStudent(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-800">
                Acknowledge fee and approve mock payment status
              </span>
            </label>
            <p className="text-[11px] text-slate-400">
              Simulated payment gateway token will be attached to registration.
            </p>
          </div>
        </div>

        {/* Submit to Human Review Screen */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 space-y-0.5">
            <p>
              Allocated Exam City:{' '}
              <span className="font-bold text-slate-900">{effectiveCity}</span>
            </p>
            <p>
              Academic Eligibility:{' '}
              <span className={`font-bold ${isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {eligibilityDecision.status} ({eligibilityDecision.assignment_average !== null ? `${eligibilityDecision.assignment_average}%` : 'N/A'})
              </span>
            </p>
          </div>

          <button
            onClick={handleProceedToRegistration}
            disabled={!isEligible || windowCheck.status === 'CLOSED'}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              !isEligible || windowCheck.status === 'CLOSED'
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-900 hover:bg-indigo-800 text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>
              {!isEligible
                ? 'Blocked by Cutoff Policy'
                : windowCheck.status === 'CLOSED'
                ? 'Window Closed'
                : 'Proceed to Approval Screen (Step 7)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
