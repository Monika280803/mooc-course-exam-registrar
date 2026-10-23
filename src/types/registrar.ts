export type OperatingMode = 'MOCK_DEMO' | 'CONNECTED_PORTAL';

export interface Student {
  student_id: string;
  display_name: string;
  email: string;
  synthetic_or_real_demo_flag: boolean;
}

export interface Course {
  course_id: string;
  course_name: string;
  session: string;
  code: string;
  department: string;
  durationWeeks: number;
  source_reference: string;
  enrolmentStatus: 'NOT_ENROLLED' | 'AWAITING_APPROVAL' | 'ENROLLED' | 'VERIFIED';
  enrolledAt?: string;
}

export interface Assignment {
  assignment_id: string;
  student_id: string;
  course_id: string;
  week_number: number;
  score: number | null; // null represents missing assignment
  maximum_score: number;
  submitted_at?: string;
  source_reference: string;
  retrieved_at: string;
}

export type EligibilityStatus = 'MET' | 'BELOW_CUTOFF' | 'NEEDS_REVIEW' | 'UNKNOWN';

export interface EligibilityDecision {
  decision_id: string;
  student_id: string;
  course_id: string;
  assignment_average: number | null;
  cutoff: number | null;
  validScoresCount: number;
  totalAssignmentsCount: number;
  missingAssignmentsCount: number;
  status: EligibilityStatus;
  reason: string;
  evidence_reference: string;
  evaluated_at: string;
}

export interface ExamCityInfo {
  city: string;
  capacity: number;
  enrolledCount: number;
  isFull: boolean;
  state: string;
  distanceKm?: number;
}

export type WindowStatus = 'OPEN' | 'NOT_YET_OPEN' | 'CLOSED' | 'NEEDS_REVIEW' | 'UNKNOWN';

export interface ExamSession {
  exam_session_id: string;
  course_id: string;
  registration_open_at: string; // ISO date
  registration_deadline: string; // ISO date
  exam_date: string;
  preferred_city: string;
  available_cities: ExamCityInfo[];
  fee_amount: number | null;
  source_reference: string;
}

export type ActionType = 'ENROLMENT' | 'EXAM_REGISTRATION' | 'FEE_PAYMENT_VERIFY';

export type ApprovalStatus = 'NOT_REQUESTED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'CANCELLED';

export type ActionStatus =
  | 'NOT_STARTED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'PENDING_CONFIRMATION'
  | 'CANCELLED';

export interface ActionRecord {
  action_id: string;
  action_type: ActionType;
  idempotency_key: string;
  student_id: string;
  course_id: string;
  proposed_payload: any;
  approval_status: ApprovalStatus;
  action_status: ActionStatus;
  result_message?: string;
  error_details?: string;
  created_at: string;
  updated_at: string;
}

export type FeeStatus = 'UNPAID' | 'FEE_APPROVED_MOCK' | 'PAID' | 'PAYMENT_PENDING' | 'EXEMPT';

export type ExamRegistrationStatus =
  | 'NOT_REGISTERED'
  | 'AWAITING_APPROVAL'
  | 'REGISTERED'
  | 'PENDING_CONFIRMATION'
  | 'FAILED';

export type HallTicketStatus = 'NOT_AVAILABLE' | 'PENDING' | 'ISSUED' | 'VERIFIED';

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'FAILED' | 'NOT_AVAILABLE' | 'NEEDS_REVIEW';

export interface ExamRegistration {
  registration_id: string | null;
  student_id: string;
  course_id: string;
  exam_session_id: string;
  exam_city: string;
  alternative_city?: string;
  fee_status: FeeStatus;
  fee_amount: number;
  registration_status: ExamRegistrationStatus;
  hall_ticket_status: HallTicketStatus;
  hall_ticket_number?: string | null;
  hall_ticket_issue_date?: string | null;
  exam_center_address?: string;
  verification_reference: string;
  last_verified_at: string;
  verification_status: VerificationStatus;
  verification_notes?: string;
}

export type Verdict = 'PASS' | 'FAIL' | 'NEEDS_REVIEW' | 'RUNNING' | 'PENDING';

export interface TestRun {
  test_run_id: string;
  test_case_id: 'TC1' | 'TC2' | 'TC3' | 'TC4';
  title: string;
  scenario_description: string;
  input_snapshot: any;
  expected_result: string;
  actual_result: string;
  verdict: Verdict;
  evidence: string;
  events: string[];
  created_at: string;
}

export interface AuditLogEvent {
  event_id: string;
  test_case_id?: string;
  student_id: string;
  course_id: string;
  action_type: string;
  timestamp: string;
  input_snapshot: any;
  retrieved_source: string;
  source_record_id_or_url: string;
  eligibility_decision?: string;
  eligibility_reason?: string;
  proposed_action?: string;
  approval_status?: ApprovalStatus;
  action_attempt_id?: string;
  idempotency_key?: string;
  result_status: string;
  verification_result: string;
  error_details?: string;
}

export interface PortalConfig {
  mode: OperatingMode;
  baseUrl: string;
  courseEndpoint: string;
  examEndpoint: string;
  enrolmentEndpoint: string;
  examRegistrationEndpoint: string;
  registrationStatusEndpoint: string;
  hallTicketStatusEndpoint: string;
  isConnected: boolean;
  lastTestedAt?: string;
  connectionError?: string;
}
