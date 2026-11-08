export type SchoolClass = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type SchoolSection = 'A' | 'B' | 'C' | 'D' | 'E';

export type MonitorRole = 
  | 'Class Monitor'
  | 'Assistant Monitor'
  | 'Discipline Monitor'
  | 'Cleanliness Monitor'
  | 'Board Writing Monitor';

export interface DailyTasks {
  recessOrder: boolean;
  cleanDesk: boolean;
  boardReady: boolean;
  assemblyLine: boolean;
  attendanceAssistance: boolean;
  uniformCheck: boolean;
}

export interface MonitorRecord {
  id: string;
  name: string;
  rollNumber?: string;
  className: SchoolClass;
  section: SchoolSection;
  role: MonitorRole;
  tasks: DailyTasks;
  createdAt: string;
  updatedAt: string;
}

export type CloudSyncStatus = 'synced' | 'syncing' | 'error' | 'local_only';

export interface SheetConfig {
  webhookUrl: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
