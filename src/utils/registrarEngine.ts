import {
  Assignment,
  EligibilityDecision,
  ExamSession,
  ExamCityInfo,
  WindowStatus,
  ActionRecord,
  ExamRegistration,
  TestRun,
  AuditLogEvent,
  Verdict,
} from '../types/registrar';
import { OFFICIAL_ELIGIBILITY_CUTOFF, CUTOFF_SOURCE_REFERENCE } from '../data/mockData';

export interface AssignmentCalculationResult {
  averagePercentage: number | null;
  validScoresCount: number;
  totalAssignmentsCount: number;
  missingAssignmentsCount: number;
  missingWeeks: number[];
  weeklyPercentages: Array<{
    week: number;
    rawScore: number | null;
    maxScore: number;
    percentage: number | null;
    isMissing: boolean;
  }>;
}

/**
 * STEP 3 — TRACK ASSIGNMENTS & CALCULATE AVERAGE
 * Assignment Average = Sum of valid assignment scores (%) / Number of valid assignment scores.
 * Converts scores with different maximum marks to percentages before calculating the average.
 * Explicitly tracks missing scores; never silently treats missing assignments as zero.
 */
export function calculateAssignmentAverage(assignments: Assignment[]): AssignmentCalculationResult {
  const sorted = [...assignments].sort((a, b) => a.week_number - b.week_number);
  const weeklyPercentages: AssignmentCalculationResult['weeklyPercentages'] = [];
  const missingWeeks: number[] = [];
  let validSum = 0;
  let validCount = 0;

  for (const a of sorted) {
    if (a.score === null || isNaN(a.score) || a.score < 0) {
      missingWeeks.push(a.week_number);
      weeklyPercentages.push({
        week: a.week_number,
        rawScore: null,
        maxScore: a.maximum_score || 100,
        percentage: null,
        isMissing: true,
      });
    } else {
      const max = a.maximum_score > 0 ? a.maximum_score : 100;
      const pct = (a.score / max) * 100;
      validSum += pct;
      validCount += 1;
      weeklyPercentages.push({
        week: a.week_number,
        rawScore: a.score,
        maxScore: max,
        percentage: Math.round(pct * 100) / 100,
        isMissing: false,
      });
    }
  }

  const averagePercentage =
    validCount > 0 ? Math.round((validSum / validCount) * 100) / 100 : null;

  return {
    averagePercentage,
    validScoresCount: validCount,
    totalAssignmentsCount: sorted.length,
    missingAssignmentsCount: missingWeeks.length,
    missingWeeks,
    weeklyPercentages,
  };
}

/**
 * STEP 4 — CHECK EXAM ELIGIBILITY
 * Compare calculated assignment average against official cutoff.
 * If cutoff or scores are missing, returns NEEDS_REVIEW.
 */
export function evaluateEligibility(
  assignments: Assignment[],
  cutoff: number | null = OFFICIAL_ELIGIBILITY_CUTOFF,
  studentId: string,
  courseId: string,
  sourceRef: string = CUTOFF_SOURCE_REFERENCE
): EligibilityDecision {
  const calc = calculateAssignmentAverage(assignments);
  const decisionId = `DEC-${studentId}-${courseId}-${Date.now().toString(36)}`;
  const evaluatedAt = new Date().toISOString();

  if (cutoff === null || isNaN(cutoff)) {
    return {
      decision_id: decisionId,
      student_id: studentId,
      course_id: courseId,
      assignment_average: calc.averagePercentage,
      cutoff: null,
      validScoresCount: calc.validScoresCount,
      totalAssignmentsCount: calc.totalAssignmentsCount,
      missingAssignmentsCount: calc.missingAssignmentsCount,
      status: 'NEEDS_REVIEW',
      reason: 'Official eligibility cutoff is missing or unverified in portal source.',
      evidence_reference: sourceRef,
      evaluated_at: evaluatedAt,
    };
  }

  if (calc.averagePercentage === null || calc.validScoresCount === 0) {
    return {
      decision_id: decisionId,
      student_id: studentId,
      course_id: courseId,
      assignment_average: null,
      cutoff,
      validScoresCount: 0,
      totalAssignmentsCount: calc.totalAssignmentsCount,
      missingAssignmentsCount: calc.missingAssignmentsCount,
      status: 'NEEDS_REVIEW',
      reason: 'No valid assignment scores available to evaluate eligibility.',
      evidence_reference: sourceRef,
      evaluated_at: evaluatedAt,
    };
  }

  if (calc.averagePercentage >= cutoff) {
    return {
      decision_id: decisionId,
      student_id: studentId,
      course_id: courseId,
      assignment_average: calc.averagePercentage,
      cutoff,
      validScoresCount: calc.validScoresCount,
      totalAssignmentsCount: calc.totalAssignmentsCount,
      missingAssignmentsCount: calc.missingAssignmentsCount,
      status: 'MET',
      reason: `Assignment score average of ${calc.averagePercentage.toFixed(2)}% meets or exceeds the required threshold of ${cutoff.toFixed(1)}% across ${calc.validScoresCount} submitted assignments.`,
      evidence_reference: sourceRef,
      evaluated_at: evaluatedAt,
    };
  }

  return {
    decision_id: decisionId,
    student_id: studentId,
    course_id: courseId,
    assignment_average: calc.averagePercentage,
    cutoff,
    validScoresCount: calc.validScoresCount,
    totalAssignmentsCount: calc.totalAssignmentsCount,
    missingAssignmentsCount: calc.missingAssignmentsCount,
    status: 'BELOW_CUTOFF',
    reason: `Assignment average of ${calc.averagePercentage.toFixed(2)}% is strictly below the mandatory cutoff of ${cutoff.toFixed(1)}%. Exam registration is blocked by academic regulations.`,
    evidence_reference: sourceRef,
    evaluated_at: evaluatedAt,
  };
}

/**
 * STEP 5 — CHECK REGISTRATION WINDOW
 * Evaluates current time against confirmed portal registration dates.
 */
export function checkRegistrationWindow(
  openAt: string | undefined,
  deadline: string | undefined,
  nowIso: string = new Date().toISOString()
): { status: WindowStatus; reason: string; openAt?: string; deadline?: string } {
  if (!openAt || !deadline) {
    return {
      status: 'NEEDS_REVIEW',
      reason: 'Registration window dates are unknown. Needs review before permitting registration.',
    };
  }

  const now = new Date(nowIso).getTime();
  const openTime = new Date(openAt).getTime();
  const deadlineTime = new Date(deadline).getTime();

  if (isNaN(openTime) || isNaN(deadlineTime)) {
    return {
      status: 'NEEDS_REVIEW',
      reason: 'Invalid date format in registration schedule.',
    };
  }

  if (now < openTime) {
    return {
      status: 'NOT_YET_OPEN',
      reason: `Registration window has not opened yet. Opens on ${new Date(openAt).toLocaleDateString()}.`,
      openAt,
      deadline,
    };
  }

  if (now > deadlineTime) {
    return {
      status: 'CLOSED',
      reason: `Registration deadline passed on ${new Date(deadline).toLocaleDateString()}. Portal is closed for new entries.`,
      openAt,
      deadline,
    };
  }

  return {
    status: 'OPEN',
    reason: `Registration is actively open until ${new Date(deadline).toLocaleDateString()}.`,
    openAt,
    deadline,
  };
}

/**
 * STEP 6 — CHECK EXAM CITY AVAILABILITY
 * Checks preferred city capacity and provides valid alternatives.
 */
export function checkExamCity(
  session: ExamSession,
  preferredCity: string
): {
  isAvailable: boolean;
  preferredCityInfo?: ExamCityInfo;
  alternativeCities: ExamCityInfo[];
  message: string;
} {
  const cityInfo = session.available_cities.find(
    (c) => c.city.toLowerCase() === preferredCity.toLowerCase()
  );

  const alternativeCities = session.available_cities.filter(
    (c) => c.city.toLowerCase() !== preferredCity.toLowerCase() && !c.isFull && c.enrolledCount < c.capacity
  );

  if (!cityInfo) {
    return {
      isAvailable: false,
      alternativeCities,
      message: `Preferred city "${preferredCity}" is not listed in session exam centres.`,
    };
  }

  if (cityInfo.isFull || cityInfo.enrolledCount >= cityInfo.capacity) {
    return {
      isAvailable: false,
      preferredCityInfo: cityInfo,
      alternativeCities,
      message: `Preferred exam city ${cityInfo.city} is FULL (${cityInfo.enrolledCount}/${cityInfo.capacity} seats taken). Please select a confirmed alternative city.`,
    };
  }

  return {
    isAvailable: true,
    preferredCityInfo: cityInfo,
    alternativeCities,
    message: `${cityInfo.city} has ${cityInfo.capacity - cityInfo.enrolledCount} available seats remaining (${cityInfo.enrolledCount}/${cityInfo.capacity} occupied).`,
  };
}

/**
 * STEP 8 & 11 — IDEMPOTENCY KEY GENERATION
 */
export function generateIdempotencyKey(
  actionType: string,
  studentId: string,
  courseId: string,
  extra: string = ''
): string {
  const cleanType = actionType.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanStu = studentId.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const cleanCourse = courseId.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return `idem-${cleanType}-${cleanStu}-${cleanCourse}${extra ? `-${extra}` : ''}`;
}

/**
 * AUDIT EVENT BUILDER
 */
export function createAuditEvent(
  params: Partial<AuditLogEvent> & {
    action_type: string;
    student_id: string;
    course_id: string;
    result_status: string;
    verification_result: string;
  }
): AuditLogEvent {
  return {
    event_id: `EVT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    retrieved_source: params.retrieved_source || 'mock://portal.mooc.internal/api/v1',
    source_record_id_or_url: params.source_record_id_or_url || 'mock://portal.mooc.internal/records/latest',
    input_snapshot: params.input_snapshot || {},
    ...params,
  };
}
