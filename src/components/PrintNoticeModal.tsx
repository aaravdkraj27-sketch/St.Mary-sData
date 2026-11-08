import React from 'react';
import { X, Printer, GraduationCap } from 'lucide-react';
import { MonitorRecord, SchoolClass, SchoolSection } from '../types';

interface PrintNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  monitors: MonitorRecord[];
  selectedClass: SchoolClass;
  selectedSection: SchoolSection;
}

export const PrintNoticeModal: React.FC<PrintNoticeModalProps> = ({
  isOpen,
  onClose,
  monitors,
  selectedClass,
  selectedSection
}) => {
  if (!isOpen) return null;

  const roomMonitors = monitors.filter(
    (m) => m.className === selectedClass && m.section === selectedSection
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 print:hidden">
          <h3 className="text-sm font-bold text-slate-800">Print Official Duty Circular</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0f2042] text-white rounded-lg hover:bg-[#1b356b] transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Notice Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white text-slate-900">
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-2 mb-1">
              <GraduationCap className="w-6 h-6 text-[#0f2042]" />
              <h1 className="text-xl font-black tracking-tight text-[#0f2042]">
                ST. MARY'S SCHOOL, DWARKA
              </h1>
            </div>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-600">
              Sector 19, Dwarka, New Delhi - 110075
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              OFFICIAL CLASS MONITOR APPOINTMENT ROSTER • ACADEMIC SESSION 2026-27
            </p>
          </div>

          <div className="flex justify-between items-center text-xs font-bold py-3 border-b border-slate-200">
            <span>TARGET ROOM: CLASS {selectedClass} - SECTION {selectedSection}</span>
            <span>DATE: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="mt-4">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300 font-bold">Roll</th>
                  <th className="p-2 border-r border-slate-300 font-bold">Student Name</th>
                  <th className="p-2 border-r border-slate-300 font-bold">Designated Role</th>
                  <th className="p-2 font-bold">Key Responsibilities</th>
                </tr>
              </thead>
              <tbody>
                {roomMonitors.length > 0 ? (
                  roomMonitors.map((m) => (
                    <tr key={m.id} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-300 font-mono font-bold">
                        {m.rollNumber || '-'}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-semibold">{m.name}</td>
                      <td className="p-2 border-r border-slate-300 font-bold text-[#0f2042]">{m.role}</td>
                      <td className="p-2 text-slate-600">
                        Recess order, desk hygiene, chalkboard maintenance, and assembly discipline.
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                      No monitors currently assigned for this class and section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-xs font-bold text-center">
            <div>
              <div className="border-t border-slate-400 pt-2 w-48 mx-auto">
                Class Teacher's Signature
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 w-48 mx-auto">
                Principal / Vice-Principal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
