import React, { useState } from 'react';
import {
  X,
  Printer,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  ShieldCheck,
  Percent,
  Calendar,
  Sparkles
} from 'lucide-react';
import { MonitorRecord, SchoolClass, SchoolSection, MonitorRole } from '../types';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  monitors: MonitorRecord[];
  selectedClass: SchoolClass;
  selectedSection: SchoolSection;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  monitors,
  selectedClass,
  selectedSection
}) => {
  const [reportScope, setReportScope] = useState<'current' | 'all'>('current');
  const [reportTerm, setReportTerm] = useState('Term 1 (Mid-Term Assessment)');
  const [layoutStyle, setLayoutStyle] = useState<'tabular' | 'cards'>('tabular');

  if (!isOpen) return null;

  // Filter monitors according to scope
  const targetMonitors = reportScope === 'current'
    ? monitors.filter(m => m.className === selectedClass && m.section === selectedSection)
    : monitors;

  const totalMonitors = targetMonitors.length;

  // Calculate duty completions
  let totalTasksDone = 0;
  const totalTasksPossible = totalMonitors * 6;

  targetMonitors.forEach(m => {
    const t = m.tasks;
    if (t.recessOrder) totalTasksDone++;
    if (t.cleanDesk) totalTasksDone++;
    if (t.boardReady) totalTasksDone++;
    if (t.assemblyLine) totalTasksDone++;
    if (t.attendanceAssistance) totalTasksDone++;
    if (t.uniformCheck) totalTasksDone++;
  });

  const overallPercentage = totalTasksPossible > 0
    ? Math.round((totalTasksDone / totalTasksPossible) * 100)
    : 0;

  const getStudentGrade = (completedCount: number) => {
    const pct = (completedCount / 6) * 100;
    if (pct >= 85) return { grade: 'A+', label: 'Exemplary', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    if (pct >= 66) return { grade: 'A', label: 'Commendable', badgeClass: 'bg-blue-100 text-blue-900 border-blue-300' };
    if (pct >= 50) return { grade: 'B', label: 'Satisfactory', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' };
    return { grade: 'C', label: 'Needs Focus', badgeClass: 'bg-rose-100 text-rose-900 border-rose-300' };
  };

  const getRoleRemark = (role: MonitorRole, completedCount: number) => {
    if (completedCount >= 5) {
      switch (role) {
        case 'Class Monitor': return 'Demonstrates outstanding leadership, punctuality, and excellent peer management.';
        case 'Assistant Monitor': return 'Highly dependable in roll-calls, teacher coordination, and classroom assistance.';
        case 'Discipline Monitor': return 'Exceptional maintenance of hallway queues, recess decorum, and quiet hours.';
        case 'Cleanliness Monitor': return 'Thorough desk inspections and consistent maintenance of room hygiene.';
        case 'Board Writing Monitor': return 'Daily timetable and chalkboard preparations executed meticulously.';
      }
    }
    if (completedCount >= 3) {
      return 'Regularly fulfills core duties with consistent cooperation and responsibility.';
    }
    return 'Assigned leadership duties currently in progress; requires regular supervision.';
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const serialCode = reportScope === 'current'
    ? `SMS/DWK/CMR-2026/C${selectedClass}${selectedSection}`
    : `SMS/DWK/CMR-2026/MASTER`;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 printable-report-card-modal">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] printable-report-card-content overflow-hidden">
        
        {/* Top Interactive Toolbar (HIDDEN during window.print()) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Official PDF-Ready Report Card</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-semibold">
                  A4 Landscape/Portrait Ready
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                School-branded layout with verification stamps, grade metrics & principal seal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scope switcher */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setReportScope('current')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  reportScope === 'current' ? 'bg-[#0f2042] text-amber-400 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Class {selectedClass}-{selectedSection} Only
              </button>
              <button
                type="button"
                onClick={() => setReportScope('all')}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  reportScope === 'all' ? 'bg-[#0f2042] text-amber-400 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                All School Rooms ({monitors.length})
              </button>
            </div>

            {/* Layout Switcher */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs hidden sm:flex">
              <button
                type="button"
                onClick={() => setLayoutStyle('tabular')}
                className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                  layoutStyle === 'tabular' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setLayoutStyle('cards')}
                className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
                  layoutStyle === 'cards' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Card Layout
              </button>
            </div>

            {/* Print Action Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition shadow-xs cursor-pointer active:scale-95"
              title="Trigger browser print to save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 report-card-printable-area">
          
          {/* School Emblem & Header Banner */}
          <div className="relative border-4 border-double border-[#0f2042] p-5 rounded-2xl bg-gradient-to-b from-white via-slate-50/30 to-white">
            
            {/* Header Content */}
            <div className="text-center pb-4 border-b-2 border-[#0f2042]">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-[#0f2042] text-amber-400 flex items-center justify-center border-2 border-amber-400 shadow-xs">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f2042] font-serif uppercase">
                    ST. MARY'S SCHOOL, DWARKA
                  </h1>
                  <p className="text-[11px] font-bold tracking-widest uppercase text-slate-600">
                    Affiliated to CBSE, New Delhi • Affiliation No. 2730386 • School Code: 25192
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Sector 19, Dwarka, New Delhi - 110075 • Tel: 011-28042123 • info@stmarysdwarka.in
              </p>

              {/* Title Badge */}
              <div className="mt-3 inline-block bg-[#0f2042] text-white px-6 py-1.5 rounded-full shadow-xs">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                  Class Monitor Official Performance Report Card
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                Duty Verification, Leadership Conduct & Classroom Compliance Record
              </p>
            </div>

            {/* Assessment Context Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 border-b border-slate-300 text-xs bg-slate-50/80 -mx-5 px-5 my-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Class & Section</span>
                <span className="font-black text-sm text-[#0f2042]">
                  {reportScope === 'current' ? `Class ${selectedClass} - Section ${selectedSection}` : 'All Classes (Master Roster)'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Academic Session</span>
                <span className="font-bold text-slate-900">2026 – 2027</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Evaluation Term</span>
                <span className="font-bold text-slate-900">{reportTerm}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Date of Assessment</span>
                <span className="font-bold text-slate-900">{formattedDate}</span>
              </div>
            </div>

            {/* Performance Overview Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="border border-slate-200 bg-white p-2.5 rounded-xl text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Appointed Monitors</span>
                <span className="text-xl font-black text-[#0f2042]">{totalMonitors}</span>
              </div>

              <div className="border border-slate-200 bg-white p-2.5 rounded-xl text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Duties Tracked</span>
                <span className="text-xl font-black text-slate-800">{totalTasksPossible}</span>
              </div>

              <div className="border border-slate-200 bg-white p-2.5 rounded-xl text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Completed</span>
                <span className="text-xl font-black text-emerald-600">{totalTasksDone}</span>
              </div>

              <div className="border border-slate-200 bg-white p-2.5 rounded-xl text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cohort Compliance</span>
                <span className="text-xl font-black text-indigo-700">{overallPercentage}%</span>
              </div>
            </div>

            {/* Empty State */}
            {totalMonitors === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl my-4">
                <p className="text-sm font-bold text-slate-600">No student monitors appointed for this selection.</p>
                <p className="text-xs text-slate-400 mt-1">Please appoint class monitors in the dashboard to generate this report card.</p>
              </div>
            ) : layoutStyle === 'tabular' ? (
              /* TABULAR REPORT CARD VIEW */
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#0f2042] text-white">
                      <th className="p-2.5 border border-slate-400/30 font-bold w-12 text-center">Roll</th>
                      <th className="p-2.5 border border-slate-400/30 font-bold">Student Name</th>
                      <th className="p-2.5 border border-slate-400/30 font-bold">Class</th>
                      <th className="p-2.5 border border-slate-400/30 font-bold">Designated Role</th>
                      <th className="p-2.5 border border-slate-400/30 font-bold text-center">Duty Status (6 Checkpoints)</th>
                      <th className="p-2.5 border border-slate-400/30 font-bold text-center w-20">Score</th>
                      <th className="p-2.5 border border-slate-400/30 font-bold text-center w-16">Grade</th>
                      <th className="p-2.5 border border-slate-400/30 font-bold min-w-[200px]">Teacher Remarks & Leadership Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetMonitors.map((m, idx) => {
                      const t = m.tasks;
                      const doneCount = [
                        t.recessOrder,
                        t.cleanDesk,
                        t.boardReady,
                        t.assemblyLine,
                        t.attendanceAssistance,
                        t.uniformCheck
                      ].filter(Boolean).length;

                      const { grade, badgeClass } = getStudentGrade(doneCount);
                      const remarks = getRoleRemark(m.role, doneCount);

                      return (
                        <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-center text-slate-700">
                            {m.rollNumber || String(idx + 1).padStart(2, '0')}
                          </td>
                          <td className="p-2 border border-slate-300 font-bold text-slate-900">
                            {m.name}
                          </td>
                          <td className="p-2 border border-slate-300 font-semibold text-slate-700 whitespace-nowrap">
                            Class {m.className}-{m.section}
                          </td>
                          <td className="p-2 border border-slate-300 font-bold text-[#0f2042] whitespace-nowrap">
                            {m.role}
                          </td>
                          <td className="p-2 border border-slate-300">
                            <div className="grid grid-cols-3 gap-1 text-[10px]">
                              <span className={`px-1.5 py-0.5 rounded text-center border font-medium ${t.recessOrder ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                Recess: {t.recessOrder ? '✓' : '—'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-center border font-medium ${t.cleanDesk ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                Desk: {t.cleanDesk ? '✓' : '—'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-center border font-medium ${t.boardReady ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                Board: {t.boardReady ? '✓' : '—'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-center border font-medium ${t.assemblyLine ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                Line: {t.assemblyLine ? '✓' : '—'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-center border font-medium ${t.attendanceAssistance ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                Attend: {t.attendanceAssistance ? '✓' : '—'}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-center border font-medium ${t.uniformCheck ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                Uniform: {t.uniformCheck ? '✓' : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-slate-800 whitespace-nowrap">
                            {doneCount} / 6
                            <span className="text-[10px] text-slate-500 block font-normal">
                              ({Math.round((doneCount / 6) * 100)}%)
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 text-center whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-md font-black text-xs border ${badgeClass}`}>
                              {grade}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 text-[11px] text-slate-700 leading-snug">
                            {remarks}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARD REPORT CARD VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {targetMonitors.map((m, idx) => {
                  const t = m.tasks;
                  const doneCount = [
                    t.recessOrder,
                    t.cleanDesk,
                    t.boardReady,
                    t.assemblyLine,
                    t.attendanceAssistance,
                    t.uniformCheck
                  ].filter(Boolean).length;
                  const { grade, label, badgeClass } = getStudentGrade(doneCount);
                  const remarks = getRoleRemark(m.role, doneCount);

                  return (
                    <div key={m.id} className="border-2 border-slate-300 rounded-xl p-4 bg-white shadow-2xs">
                      <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                            <span className="font-mono text-[11px] font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              #{m.rollNumber || String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#0f2042] mt-0.5">{m.role} • Class {m.className}-{m.section}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg font-black text-sm border ${badgeClass}`}>
                            Grade {grade}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-semibold">{label}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Duty Checkpoints:</span>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <span className={t.recessOrder ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                            {t.recessOrder ? '✓ Recess Order' : '○ Recess Order'}
                          </span>
                          <span className={t.cleanDesk ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                            {t.cleanDesk ? '✓ Clean Desk' : '○ Clean Desk'}
                          </span>
                          <span className={t.boardReady ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                            {t.boardReady ? '✓ Board Ready' : '○ Board Ready'}
                          </span>
                          <span className={t.assemblyLine ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                            {t.assemblyLine ? '✓ Line Discipline' : '○ Line Discipline'}
                          </span>
                          <span className={t.attendanceAssistance ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                            {t.attendanceAssistance ? '✓ Attendance Assist' : '○ Attendance Assist'}
                          </span>
                          <span className={t.uniformCheck ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                            {t.uniformCheck ? '✓ Uniform Check' : '○ Uniform Check'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 bg-slate-50/70 p-2 rounded-lg text-[11px] text-slate-700">
                        <span className="font-bold text-[#0f2042]">Teacher Assessment: </span>
                        <span>{remarks}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grading Criteria & Assessment Scale Legend */}
            <div className="mt-5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold text-slate-800">Grading Key:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span><strong>Grade A+</strong> (85-100%): Exemplary Leadership</span>
                <span>•</span>
                <span><strong>Grade A</strong> (66-84%): Commendable Compliance</span>
                <span>•</span>
                <span><strong>Grade B</strong> (50-65%): Satisfactory Order</span>
                <span>•</span>
                <span><strong>Grade C</strong> (&lt;50%): Needs Focus</span>
              </div>
            </div>

            {/* Official Certification and Signatures Block */}
            <div className="mt-10 pt-6 border-t-2 border-slate-300">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-900">
                    Class Teacher's Signature
                  </div>
                  <span className="text-[10px] text-slate-500">St. Mary's School, Dwarka</span>
                </div>

                <div>
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 border border-slate-300 px-2 py-0.5 rounded">
                      [SCHOOL SEAL]
                    </span>
                  </div>
                  <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-900">
                    Discipline In-Charge
                  </div>
                  <span className="text-[10px] text-slate-500">Office of Student Welfare</span>
                </div>

                <div>
                  <div className="h-10"></div>
                  <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-900">
                    Principal / Vice-Principal
                  </div>
                  <span className="text-[10px] text-slate-500">Official Certification Stamp</span>
                </div>
              </div>

              {/* Watermark & Security Serial Notice */}
              <div className="mt-8 pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center text-[10px] font-mono text-slate-400">
                <span>DOC REF: {serialCode}</span>
                <span>AUTHENTICATED ST. MARY'S SCHOOL DIGITAL ROSTER ENGINE</span>
                <span>PAGE 1 OF 1</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
