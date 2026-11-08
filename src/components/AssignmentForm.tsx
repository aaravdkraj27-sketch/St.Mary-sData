import React, { useState } from 'react';
import { UserPlus, Sparkles, ShieldCheck, CheckCircle } from 'lucide-react';
import { MonitorRole, SchoolClass, SchoolSection } from '../types';

interface AssignmentFormProps {
  currentClass: SchoolClass;
  currentSection: SchoolSection;
  onAddMonitor: (monitor: {
    name: string;
    rollNumber: string;
    className: SchoolClass;
    section: SchoolSection;
    role: MonitorRole;
  }) => void;
}

const ROLES: { role: MonitorRole; desc: string; color: string }[] = [
  {
    role: 'Class Monitor',
    desc: 'Chief student leader, teacher liaison & general order',
    color: 'border-indigo-300 bg-indigo-50/50 text-indigo-900',
  },
  {
    role: 'Assistant Monitor',
    desc: 'Assists chief monitor, manages roll call & errands',
    color: 'border-sky-300 bg-sky-50/50 text-sky-900',
  },
  {
    role: 'Discipline Monitor',
    desc: 'Maintains assembly lines, recess order & quiet hours',
    color: 'border-rose-300 bg-rose-50/50 text-rose-900',
  },
  {
    role: 'Cleanliness Monitor',
    desc: 'Inspects desk cleanliness, waste bin usage & room hygiene',
    color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
  },
  {
    role: 'Board Writing Monitor',
    desc: 'Updates chalkboard/whiteboard date, thought of the day & homework',
    color: 'border-amber-300 bg-amber-50/50 text-amber-900',
  },
];

const CLASSES: SchoolClass[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTIONS: SchoolSection[] = ['A', 'B', 'C', 'D', 'E'];

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  currentClass,
  currentSection,
  onAddMonitor,
}) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [targetClass, setTargetClass] = useState<SchoolClass>(currentClass);
  const [targetSection, setTargetSection] = useState<SchoolSection>(currentSection);
  const [role, setRole] = useState<MonitorRole>('Class Monitor');
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync target room when parent context changes if form hasn't been edited
  React.useEffect(() => {
    setTargetClass(currentClass);
    setTargetSection(currentSection);
  }, [currentClass, currentSection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMonitor({
      name: name.trim(),
      rollNumber: rollNumber.trim(),
      className: targetClass,
      section: targetSection,
      role,
    });

    setName('');
    setRollNumber('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f2042] text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f2042] uppercase tracking-wide">
                Assign New Monitor
              </h3>
              <p className="text-[11px] text-slate-500">Official student duty registration</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Term 1
          </span>
        </div>

        {showSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Monitor successfully appointed and added to roster!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Student Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav D.K Raj"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f2042] focus:bg-white transition"
            />
          </div>

          {/* Class & Section units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value as SchoolClass)}
                className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2042] transition cursor-pointer"
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value as SchoolSection)}
                className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2042] transition cursor-pointer"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Roll Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Roll Number / Student ID (Optional)
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 04 or ST-404"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f2042] focus:bg-white transition"
            />
          </div>

          {/* Specific Responsibility Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Specific Responsibility Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MonitorRole)}
              className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg text-[#0f2042] focus:outline-none focus:ring-2 focus:ring-[#0f2042] transition cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.role}
                </option>
              ))}
            </select>
          </div>

          {/* Role details box */}
          <div className="p-2.5 rounded-lg border bg-slate-50 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800">Role Duties: </span>
            {ROLES.find((r) => r.role === role)?.desc}
          </div>

          <button
            type="submit"
            className="w-full bg-[#0f2042] hover:bg-[#1b356b] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Assign & Save to Roster</span>
          </button>
        </form>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
        <div className="flex items-start gap-2 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            All appointments are digitally logged to St. Mary's School records. Data syncs with Google Sheets automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
