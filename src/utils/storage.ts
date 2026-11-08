import { MonitorRecord, SheetConfig } from '../types';

export const STORAGE_KEY = 'sm_monitors';
export const CONFIG_KEY = 'sm_config';

export const INITIAL_DEMO_MONITORS: MonitorRecord[] = [
  {
    id: 'sm-demo-01',
    name: 'Aarav D.K Raj',
    rollNumber: '04',
    className: '4',
    section: 'D',
    role: 'Class Monitor',
    tasks: {
      recessOrder: true,
      cleanDesk: true,
      boardReady: true,
      assemblyLine: false,
      attendanceAssistance: true,
      uniformCheck: true,
    },
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-05T08:15:00.000Z',
  },
  {
    id: 'sm-demo-02',
    name: 'Tarik Khan',
    rollNumber: '19',
    className: '4',
    section: 'D',
    role: 'Discipline Monitor',
    tasks: {
      recessOrder: true,
      cleanDesk: false,
      boardReady: false,
      assemblyLine: true,
      attendanceAssistance: false,
      uniformCheck: true,
    },
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-05T08:20:00.000Z',
  }
];

export function loadMonitors(): MonitorRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First-time visit: seed only the 2 testing demo records (no extras)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_MONITORS));
      return INITIAL_DEMO_MONITORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Preserve solely what was saved by the teacher; strip any legacy extra mock entries
      const cleaned = parsed.filter(
        m => !['sm-demo-03', 'sm-demo-04', 'sm-demo-05', 'sm-demo-06'].includes(m.id)
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return INITIAL_DEMO_MONITORS;
  } catch (e) {
    console.error('Error loading monitors from localStorage:', e);
    return INITIAL_DEMO_MONITORS;
  }
}

export function saveMonitors(monitors: MonitorRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(monitors));
  } catch (e) {
    console.error('Error saving monitors to localStorage:', e);
  }
}

export function loadConfig(): SheetConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading config from localStorage:', e);
  }
  return {
    webhookUrl: '',
    autoSync: true,
  };
}

export function saveConfig(config: SheetConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config to localStorage:', e);
  }
}

export function exportRosterToCSV(monitors: MonitorRecord[]): void {
  const headers = [
    'ID',
    'Student Name',
    'Roll Number',
    'Class',
    'Section',
    'Role',
    'Recess Order',
    'Clean Desk',
    'Board Ready',
    'Assembly Line',
    'Attendance Assist',
    'Uniform Check',
    'Assigned Date'
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = monitors.map(m => [
    escapeCSV(m.id),
    escapeCSV(m.name),
    escapeCSV(m.rollNumber || '-'),
    escapeCSV(m.className),
    escapeCSV(m.section),
    escapeCSV(m.role),
    escapeCSV(m.tasks.recessOrder ? 'COMPLETED' : 'PENDING'),
    escapeCSV(m.tasks.cleanDesk ? 'COMPLETED' : 'PENDING'),
    escapeCSV(m.tasks.boardReady ? 'COMPLETED' : 'PENDING'),
    escapeCSV(m.tasks.assemblyLine ? 'COMPLETED' : 'PENDING'),
    escapeCSV(m.tasks.attendanceAssistance ? 'COMPLETED' : 'PENDING'),
    escapeCSV(m.tasks.uniformCheck ? 'COMPLETED' : 'PENDING'),
    escapeCSV(m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `St_Marys_Class_Monitors_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
