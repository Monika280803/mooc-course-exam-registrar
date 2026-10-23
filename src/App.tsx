import React, { useState } from 'react';
import { RegistrarProvider } from './context/RegistrarContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { CourseEnrolmentView } from './components/CourseEnrolmentView';
import { AssignmentEligibilityView } from './components/AssignmentEligibilityView';
import { ExamRegistrationView } from './components/ExamRegistrationView';
import { VerificationHallTicketView } from './components/VerificationHallTicketView';
import { TestScenariosView } from './components/TestScenariosView';
import { AuditLogView } from './components/AuditLogView';
import { PortalSettingsView } from './components/PortalSettingsView';
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { AiExplainerModal } from './components/AiExplainerModal';
import { ShieldCheck, BookOpen, ExternalLink, Radio } from 'lucide-react';

function MainRegistrarApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <StudentDashboard onNavigate={setActiveTab} />}
        {activeTab === 'enrolment' && <CourseEnrolmentView />}
        {activeTab === 'eligibility' && <AssignmentEligibilityView />}
        {activeTab === 'exam-reg' && <ExamRegistrationView />}
        {activeTab === 'verification' && <VerificationHallTicketView />}
        {activeTab === 'test-scenarios' && <TestScenariosView />}
        {activeTab === 'audit-log' && <AuditLogView />}
        {activeTab === 'settings' && <PortalSettingsView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-700" />
            <span className="font-semibold text-slate-700">
              MOOC Course & Exam Registrar AI Agent
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-400">
              Deterministic Academic Rule Engine & AI Advisory
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">
              Operating in strictly labelled Synthetic Demonstration Mode
            </span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-indigo-700 hover:text-indigo-900 font-medium underline cursor-pointer"
            >
              Portal Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Required Modals */}
      <HumanApprovalModal />
      <AiExplainerModal />
    </div>
  );
}

export default function App() {
  return (
    <RegistrarProvider>
      <MainRegistrarApp />
    </RegistrarProvider>
  );
}
