import React from 'react';
import { Filter, Search, Check, Layers } from 'lucide-react';
import { SchoolClass, SchoolSection } from '../types';

interface ContextSelectorProps {
  selectedClass: SchoolClass;
  selectedSection: SchoolSection;
  onClassChange: (c: SchoolClass) => void;
  onSectionChange: (s: SchoolSection) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewAllRooms: boolean;
  onToggleViewAllRooms: (v: boolean) => void;
}

const CLASSES: SchoolClass[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTIONS: SchoolSection[] = ['A', 'B', 'C', 'D', 'E'];

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  selectedClass,
  selectedSection,
  onClassChange,
  onSectionChange,
  searchQuery,
  onSearchChange,
  viewAllRooms,
  onToggleViewAllRooms
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0f2042] uppercase tracking-wide">
              Class & Section Navigation
            </h2>
            <p className="text-[11px] text-slate-500">Filter dashboard view by designated classroom</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleViewAllRooms(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              !viewAllRooms
                ? 'bg-[#0f2042] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Single Room ({selectedClass}-{selectedSection})</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleViewAllRooms(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewAllRooms
                ? 'bg-[#0f2042] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Roster (All Rooms)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mt-3.5">
        {/* Class Selection Dropdown */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Target Class (1 to 12)
          </label>
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value as SchoolClass)}
            className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2042] focus:bg-white transition cursor-pointer"
          >
            {CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Section Quick Pills */}
        <div className="md:col-span-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Section (A to E)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {SECTIONS.map((sec) => {
              const isSelected = selectedSection === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onSectionChange(sec)}
                  className={`py-2 text-xs font-black rounded-lg border transition cursor-pointer flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs ring-2 ring-amber-400/40'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  <span>Sec {sec}</span>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="md:col-span-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
            Search Student / Role
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Aarav, Tarik, Monitor..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042] focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
