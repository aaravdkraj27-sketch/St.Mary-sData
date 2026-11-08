# St. Mary's School, Dwarka - Class Monitor Management System
### Standalone Windows Desktop Executable (`.exe`) & .NET Framework Solution

Official desktop application for **St. Mary's School, Sector 19, Dwarka** (CBSE Affiliation No. 2730386).

---

## 🌟 100% Identical Visuals, Layout & Features

The desktop application (`StMarysClassMonitors.exe`) matches the web app with **identical UI, background, typography, button positioning, and text positioning**:
- **Branding & Header**: Deep academic navy (`#0f2042`), school crest, CBSE Affiliation badge, Academic Session 2026-27, and gold/amber highlights.
- **Top Actions**:
  1. **Sync Status Dot**: Live visual indicator (Synced / Syncing / Local Storage Only).
  2. **Sync Now**: On-demand manual sync button.
  3. **Open Spreadsheet**: Directly opens your connected Google Spreadsheet in a new tab.
  4. **Connect Google**: Full Google Workspace & OAuth account integration.
  5. **Sheets Webhook**: Google Apps Script Web App endpoint configuration.
  6. **Export CSV**: Instant download of roster spreadsheets.
  7. **Single-File HTML**: Self-contained backup HTML export.
  8. **Print Report Card**: PDF-ready academic report card modal with school seal and signature lines.
  9. **Clear All**: Clean removal of all monitors with safety confirmation.
  10. **Reset Term**: Restores the default baseline (Aarav D.K Raj & Tarik Khan in Class 4-D).
- **Dashboard Overview Metrics**:
  - Total Monitors Appointed (2)
  - Active Managed Rooms (1 / 60)
  - Completed Daily Activity Tasks (with percentage progress bar)
  - Current Selected Classroom Context (Class 4-D)
- **Classroom Navigation Toolbar**:
  - Single Room (4-D) vs Master Roster (All Rooms) view toggle
  - Target Class (Classes 1 through 12)
  - Section pills (Sec A, Sec B, Sec C, Sec D, Sec E)
  - Quick student & role search
- **Dynamic Monitor Assignment Panel**:
  - Student Name, Class, Section, Roll Number / ID, Specific Role (Class Monitor, Assistant Monitor, Discipline Monitor, Cleanliness Monitor, Board Writing Monitor), and assignment action.
- **Appointed Monitors List & Duty Checklists**:
  - Student avatar badge, name, roll #, class badge, color-coded role badge, updated timestamp.
  - 6 Daily Duty checkboxes:
    1. Recess Order Check
    2. Clean Desk Check
    3. Chalk & Board Ready
    4. Line Discipline (Assembly)
    5. Attendance Assistance
    6. Uniform & ID Inspection
  - Delete monitor button with safety confirmation.

---

## 🚀 How to Run on Your Windows PC

1. **Copy the `application_for_window` folder** to your Windows computer (e.g., Desktop or Documents).
2. **Double-click `StMarysClassMonitors.exe`**:
   - The application starts automatically in dedicated desktop application window mode.
   - It runs with zero browser address bars or navigation clutter, looking and behaving like a native desktop app.
   - All modern Windows versions (Windows 11, Windows 10, Windows 8, Windows 7) are supported out of the box.
3. **Tray Menu**:
   - When running, a tray icon is available in the Windows taskbar near the clock.
   - Right-click the tray icon to quickly open the app, open your connected Google Spreadsheet, switch to the classic WinForms layout, or exit.

---

## 📁 Package Directory Structure

```text
application_for_window/
├── StMarysClassMonitors.exe          <- Double-click to run on Windows
├── StMarysClassMonitors.html         <- Standalone single-file HTML version
├── App.config                        <- .NET Framework runtime configuration
├── README.md                         <- User guide and documentation
├── StMarysClassMonitors.sln          <- Visual Studio Solution file
├── StMarysClassMonitors.csproj       <- Visual Studio Project file
├── www/                              <- Production application assets (HTML/CSS/JS)
│   ├── index.html
│   ├── standalone.html
│   └── assets/
├── Forms/                            <- Windows Forms UI components
│   ├── MainForm.cs
│   ├── ReportCardForm.cs
│   └── WebhookConfigForm.cs
├── Models/                           <- Data contracts & models
│   └── MonitorRecord.cs
├── Services/                         <- Data persistence, HTTP server & Sheets sync
│   ├── AppServer.cs
│   ├── DataStore.cs
│   └── GoogleSheetsSync.cs
└── bin/Release/                      <- Release build executable copy
    └── StMarysClassMonitors.exe
```

---

## 🛠️ Opening in Visual Studio (For Developers)

To build, inspect, or modify the source code:
1. Open Visual Studio 2019 or Visual Studio 2022.
2. Select **File > Open > Project/Solution** and choose `StMarysClassMonitors.sln`.
3. Press **F5** to build and run in Debug mode, or build in Release mode.
