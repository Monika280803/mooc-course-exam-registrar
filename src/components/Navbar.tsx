import React from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  GraduationCap,
  Sparkles,
  RotateCcw,
  PlayCircle,
  ShieldCheck,
  Radio,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  CheckCircle2,
  ClipboardList,
  Sliders,
  User,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    mode,
    students,
    currentStudent,
    setCurrentStudent,
    resetDemoData,
    runAllTestCases,
    isTestRunning,
    openAiExplainer,
    eligibilityDecision,
    currentCourse,
    currentCourseAssignments,
  } = useRegistrar();

  const navItems = [
    { id: 'dashboard', label: 'Student Dashboard', icon: GraduationCap },
    { id: 'enrolment', label: 'Course Enrolment', icon: BookOpen },
    { id: 'eligibility', label: 'Assignment & Eligibility', icon: ClipboardList },
    { id: 'exam-reg', label: 'Exam Registration', icon: CalendarCheck },
    { id: 'verification', label: 'Verification & Hall Ticket', icon: FileCheck2 },
    { id: 'test-scenarios', label: 'Test Scenarios (4/4)', icon: CheckCircle2 },
    { id: 'audit-log', label: 'Activity & Evidence Log', icon: ShieldCheck },
    { id: 'settings', label: 'Settings / Portal Config', icon: Sliders },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner with App Brand, Mode & Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-slate-100">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  MOOC Course & Exam Registrar
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Agent
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Your course enrolment and exam registration assistant.
              </p>
            </div>
          </div>

          {/* Operating Mode Indicator & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Active Mode Badge (Prominent requirement) */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide border shadow-2xs ${
                mode === 'CONNECTED_PORTAL'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
              title={
                mode === 'CONNECTED_PORTAL'
                  ? 'Real Organiser Portal is connected and verified.'
                  : 'Running in clearly labelled MOCK DEMO MODE using synthetic data. Organiser portal is unconfigured.'
              }
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  mode === 'CONNECTED_PORTAL' ? 'text-emerald-600 animate-pulse' : 'text-amber-600'
                }`}
              />
              <span>
                {mode === 'CONNECTED_PORTAL' ? 'CONNECTED PORTAL MODE' : 'MOCK DEMO MODE'}
              </span>
            </div>

            {/* Student Switcher dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={currentStudent.student_id}
                onChange={(e) => {
                  const s = students.find((st) => st.student_id === e.target.value);
                  if (s) setCurrentStudent(s);
                }}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.display_name.split(' (')[0]} ({s.student_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Ask AI Helper */}
            <button
              onClick={() =>
                openAiExplainer('PROCESS_SUMMARY', 'Registrar Assistant Overview', {
                  studentId: currentStudent.student_id,
                  studentName: currentStudent.display_name,
                  course: currentCourse.course_name,
                  eligibility: eligibilityDecision.status,
                  average: eligibilityDecision.assignment_average,
                  cutoff: eligibilityDecision.cutoff,
                  assignmentsCount: currentCourseAssignments.length,
                })
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask AI Agent</span>
            </button>

            {/* Run All 4 Tests button */}
            <button
              onClick={() => {
                setActiveTab('test-scenarios');
                runAllTestCases();
              }}
              disabled={isTestRunning}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{isTestRunning ? 'Running Tests...' : 'Run All 4 Tests'}</span>
            </button>

            {/* Reset Demo Data button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all course enrolments, assignment scores, and test runs to synthetic demo baseline?')) {
                  resetDemoData();
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              title="Reset state to initial synthetic fixtures"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* 8 Section Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-300' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
