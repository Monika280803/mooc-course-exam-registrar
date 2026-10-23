import React, { useState } from 'react';
import { useRegistrar } from '../context/RegistrarContext';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Edit2,
  PlusCircle,
  Save,
  X,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { calculateAssignmentAverage } from '../utils/registrarEngine';

export const AssignmentEligibilityView: React.FC = () => {
  const {
    currentStudent,
    currentCourse,
    currentCourseAssignments,
    updateAssignmentScore,
    addAssignment,
    eligibilityDecision,
    openAiExplainer,
  } = useRegistrar();

  // Score editing modal state
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<string>('');
  const [editMaxScore, setEditMaxScore] = useState<string>('100');

  // Add new week assignment state
  const [isAddingWeek, setIsAddingWeek] = useState(false);
  const [newWeekNum, setNewWeekNum] = useState<number>(currentCourseAssignments.length + 1);
  const [newScore, setNewScore] = useState<string>('80');
  const [newMaxScore, setNewMaxScore] = useState<string>('100');

  const calc = calculateAssignmentAverage(currentCourseAssignments);

  const startEdit = (assignmentId: string, currentScore: number | null, max: number) => {
    setEditingAssignmentId(assignmentId);
    setEditScore(currentScore !== null ? String(currentScore) : '');
    setEditMaxScore(String(max));
  };

  const saveEdit = (assignmentId: string) => {
    const parsedScore = editScore.trim() === '' ? null : parseFloat(editScore);
    const parsedMax = parseFloat(editMaxScore) || 100;
    updateAssignmentScore(assignmentId, parsedScore, parsedMax);
    setEditingAssignmentId(null);
  };

  const handleAddNewAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = newScore.trim() === '' ? null : parseFloat(newScore);
    const maxVal = parseFloat(newMaxScore) || 100;

    addAssignment({
      student_id: currentStudent.student_id,
      course_id: currentCourse.course_id,
      week_number: newWeekNum,
      score: scoreVal,
      maximum_score: maxVal,
      source_reference: `mock://portal.mooc.internal/assignments/${currentCourse.code}/w${newWeekNum}`,
    });

    setIsAddingWeek(false);
    setNewWeekNum(newWeekNum + 1);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              STEP 3 & STEP 4
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Weekly Assignments & Exam Eligibility Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculates deterministic score percentages, tracks missing weeks without silent zeroing, and enforces official cutoff rules.
          </p>
        </div>

        <button
          onClick={() =>
            openAiExplainer('ASSIGNMENT_PERFORMANCE', 'Weekly Score & Eligibility Analysis', {
              studentId: currentStudent.student_id,
              studentName: currentStudent.display_name,
              course: currentCourse.course_name,
              averagePercentage: calc.averagePercentage,
              cutoff: eligibilityDecision.cutoff,
              status: eligibilityDecision.status,
              validScoresCount: calc.validScoresCount,
              totalAssignmentsCount: calc.totalAssignmentsCount,
              missingWeeks: calc.missingWeeks,
              weeklyScores: calc.weeklyPercentages.map((w) => ({
                week: w.week,
                pct: w.percentage,
                isMissing: w.isMissing,
              })),
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Performance Evaluation</span>
        </button>
      </div>

      {/* Prominent Eligibility Decision Banner (Step 4) */}
      <div
        className={`p-5 rounded-xl border shadow-2xs ${
          eligibilityDecision.status === 'MET'
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : eligibilityDecision.status === 'BELOW_CUTOFF'
            ? 'bg-rose-50/80 border-rose-300 text-rose-950'
            : 'bg-amber-50/70 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                eligibilityDecision.status === 'MET'
                  ? 'bg-emerald-600 text-white'
                  : eligibilityDecision.status === 'BELOW_CUTOFF'
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {eligibilityDecision.status === 'MET' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-white/70">
                  Step 4 Decision: {eligibilityDecision.status}
                </span>
                <span className="text-xs font-mono opacity-70">
                  Ref: {eligibilityDecision.decision_id}
                </span>
              </div>
              <h3 className="text-base font-bold">
                {eligibilityDecision.status === 'MET'
                  ? 'Academic Eligibility Confirmed: Score Cutoff Requirement Met'
                  : eligibilityDecision.status === 'BELOW_CUTOFF'
                  ? 'Exam Registration Blocked: Score Below Institutional Cutoff'
                  : 'Review Required: Unverified Cutoff or Scores'}
              </h3>
              <p className="text-xs opacity-90 max-w-3xl leading-relaxed">
                {eligibilityDecision.reason}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-white/90 border border-slate-200 rounded-lg p-3 text-right shrink-0 min-w-[170px] shadow-2xs">
            <p className="text-[11px] text-slate-500 font-semibold uppercase">
              Current Average
            </p>
            <p className="text-2xl font-black text-slate-900">
              {calc.averagePercentage !== null ? `${calc.averagePercentage}%` : 'N/A'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Cutoff: <span className="font-bold">{eligibilityDecision.cutoff}%</span>
            </p>
          </div>
        </div>

        {/* Source citation */}
        <div className="mt-3 pt-2.5 border-t border-current/15 flex items-center justify-between text-[11px] opacity-80">
          <span className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Authority Source: {eligibilityDecision.evidence_reference}
          </span>
          <span>Evaluated At: {new Date(eligibilityDecision.evaluated_at).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Grid: Weekly Trend Chart + Statistical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Weekly Assignment Score Trend</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualizing normalized percentage scores week-by-week with 40% cutoff threshold
              </p>
            </div>

            <button
              onClick={() => setIsAddingWeek(!isAddingWeek)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Week</span>
            </button>
          </div>

          {/* Inline Add Week Form */}
          {isAddingWeek && (
            <form onSubmit={handleAddNewAssignment} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700">Add New Week:</span>
              <div>
                <label className="text-[11px] text-slate-500 mr-1">Week #</label>
                <input
                  type="number"
                  min="1"
                  value={newWeekNum}
                  onChange={(e) => setNewWeekNum(parseInt(e.target.value, 10))}
                  className="w-16 bg-white border border-slate-300 rounded-md px-2 py-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mr-1">Raw Score</label>
                <input
                  type="number"
                  step="any"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="leave blank if missing"
                  className="w-24 bg-white border border-slate-300 rounded-md px-2 py-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 mr-1">Max Marks</label>
                <input
                  type="number"
                  value={newMaxScore}
                  onChange={(e) => setNewMaxScore(e.target.value)}
                  className="w-20 bg-white border border-slate-300 rounded-md px-2 py-1"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-900 text-white rounded-md font-semibold cursor-pointer"
              >
                Save Week
              </button>
              <button
                type="button"
                onClick={() => setIsAddingWeek(false)}
                className="px-2 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Visual Bar Trend Chart */}
          <div className="pt-4 pb-2">
            <div className="relative h-48 flex items-end justify-between gap-2 border-b border-l border-slate-200 px-3 pb-2">
              {/* 40% Cutoff Target Line */}
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400 z-10 flex items-center justify-end pr-2 pointer-events-none"
                style={{ bottom: `${(eligibilityDecision.cutoff || 40)}%` }}
              >
                <span className="text-[10px] font-bold text-rose-600 bg-white/90 px-1 rounded-sm border border-rose-200">
                  Cutoff {eligibilityDecision.cutoff}%
                </span>
              </div>

              {/* Bars */}
              {calc.weeklyPercentages.map((item) => {
                const heightPct = item.percentage !== null ? Math.min(item.percentage, 100) : 0;
                const isBelow = item.percentage !== null && item.percentage < (eligibilityDecision.cutoff || 40);

                return (
                  <div
                    key={item.week}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-sm pointer-events-none whitespace-nowrap z-20 shadow-md">
                      Week {item.week}: {item.isMissing ? 'Missing' : `${item.percentage}% (${item.rawScore}/${item.maxScore})`}
                    </div>

                    {item.isMissing ? (
                      <div className="w-full max-w-[36px] h-3 bg-amber-100 border border-dashed border-amber-400 rounded-t-sm flex items-center justify-center">
                        <span className="text-[9px] font-bold text-amber-700">MISS</span>
                      </div>
                    ) : (
                      <div
                        className={`w-full max-w-[36px] rounded-t-sm transition-all duration-300 ${
                          isBelow
                            ? 'bg-rose-400 hover:bg-rose-500'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      >
                        <div className="text-[9px] font-bold text-white text-center pt-1 truncate">
                          {Math.round(item.percentage || 0)}%
                        </div>
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-slate-500 mt-2">
                      W{item.week}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-600 rounded-xs inline-block" />
                Score &gt;= Cutoff
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-400 rounded-xs inline-block" />
                Score &lt; Cutoff
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-100 border border-dashed border-amber-400 rounded-xs inline-block" />
                Missing (Excluded from Average)
              </span>
            </div>
          </div>
        </div>

        {/* Deterministic Calculation Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Deterministic Math Breakdown</span>
          </h3>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono space-y-1.5">
            <p className="text-slate-500 font-sans font-semibold">Formula (Section 5, Step 3):</p>
            <p className="text-slate-800 text-[11px] font-bold bg-white p-2 rounded-sm border border-slate-200">
              Avg = Sum(Valid Scores %) / Count(Valid)
            </p>
            <div className="pt-1 text-[11px] text-slate-600 space-y-0.5">
              <div className="flex justify-between">
                <span>Valid Submissions:</span>
                <span className="font-bold text-slate-900">{calc.validScoresCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Assigned Weeks:</span>
                <span className="font-bold text-slate-900">{calc.totalAssignmentsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Missing Submissions:</span>
                <span className={calc.missingAssignmentsCount > 0 ? 'font-bold text-amber-700' : 'text-slate-900'}>
                  {calc.missingAssignmentsCount} {calc.missingWeeks.length > 0 && `(W${calc.missingWeeks.join(', W')})`}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span>Calculated Average:</span>
                <span className="font-bold text-indigo-950 text-xs">
                  {calc.averagePercentage !== null ? `${calc.averagePercentage}%` : 'UNDEFINED'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-xs space-y-1">
            <p className="font-bold text-indigo-950">Missing Score Policy Notice:</p>
            <p className="text-slate-600 text-[11px]">
              Institutional guidelines require that missing assignments are not silently treated as zero unless explicitly mandated by official rules. They are tracked separately as unsubmitted.
            </p>
          </div>
        </div>
      </div>

      {/* Individual Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Assignment Score Ledger ({currentCourse.course_name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Edit&quot; on any row to test score changes or evaluate alternative outcomes.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {calc.validScoresCount} / {calc.totalAssignmentsCount} Valid
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Week</th>
                <th className="py-2.5 px-4">Raw Marks</th>
                <th className="py-2.5 px-4">Max Marks</th>
                <th className="py-2.5 px-4">Calculated %</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Source Reference</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentCourseAssignments.map((a) => {
                const isEditing = editingAssignmentId === a.assignment_id;
                const isMissing = a.score === null;
                const pct = !isMissing && a.score !== null ? ((a.score / (a.maximum_score || 100)) * 100).toFixed(1) : null;

                return (
                  <tr key={a.assignment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      Week {a.week_number}
                    </td>

                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editScore}
                          onChange={(e) => setEditScore(e.target.value)}
                          placeholder="null"
                          className="w-20 bg-white border border-indigo-400 rounded-sm px-2 py-0.5 text-xs font-bold"
                        />
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {isMissing ? (
                            <span className="text-amber-700 italic">Not Submitted</span>
                          ) : (
                            a.score
                          )}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editMaxScore}
                          onChange={(e) => setEditMaxScore(e.target.value)}
                          className="w-16 bg-white border border-indigo-400 rounded-sm px-2 py-0.5 text-xs font-bold"
                        />
                      ) : (
                        <span className="text-slate-600">{a.maximum_score}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {pct !== null ? (
                        <span
                          className={`font-bold ${
                            parseFloat(pct) >= (eligibilityDecision.cutoff || 40)
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                          isMissing
                            ? 'bg-amber-100 text-amber-800'
                            : parseFloat(pct || '0') >= (eligibilityDecision.cutoff || 40)
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isMissing ? 'MISSING' : parseFloat(pct || '0') >= (eligibilityDecision.cutoff || 40) ? 'PASS' : 'LOW'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[200px]" title={a.source_reference}>
                      {a.source_reference}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(a.assignment_id)}
                            className="p-1 rounded-sm bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="Save"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingAssignmentId(null)}
                            className="p-1 rounded-sm bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(a.assignment_id, a.score, a.maximum_score)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
