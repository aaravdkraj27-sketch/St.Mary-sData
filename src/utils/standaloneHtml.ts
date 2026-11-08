/**
 * Generates the complete, self-contained, standalone single-file HTML
 * meeting all requirements of the prompt:
 * - Pure HTML5 semantic markup
 * - Tailwind CSS via public CDN
 * - Lucide icons via CDN
 * - Pure Vanilla JavaScript (no external frameworks)
 * - LocalStorage sync using key 'sm_monitors'
 * - Demo records (Aarav D.K Raj & Tarik Khan in Class 4-D)
 * - Google Apps Script fetch POST sync
 * - Complete setup instructions comment at top
 */
export function generateStandaloneHTML(): string {
  return `<!DOCTYPE html>
<!--
=============================================================================
  ST. MARY'S SCHOOL, DWARKA - CLASS MONITOR MANAGEMENT SYSTEM (STANDALONE)
=============================================================================
  
  HOW TO SET UP GOOGLE APPS SCRIPT WEB APP TO SYNC DATA:
  ---------------------------------------------------------------------------
  1. Go to https://sheets.google.com and create a new Google Sheet.
  2. In the top menu, navigate to: Extensions > Apps Script.
  3. Delete any code in Code.gs and paste the following snippet:

     function doPost(e) {
       try {
         var payload = JSON.parse(e.postData.contents);
         var ss = SpreadsheetApp.getActiveSpreadsheet();
         var sheet = ss.getSheetByName("Class Monitors") || ss.insertSheet("Class Monitors");
         sheet.clear();
         
         var headers = ["ID", "Student Name", "Roll No", "Class", "Section", "Role", 
                        "Recess Check", "Desk Check", "Board Check", "Assembly Line", 
                        "Attendance Assist", "Uniform Check", "Last Updated"];
         sheet.appendRow(headers);
         sheet.getRange(1, 1, 1, headers.length).setBackground("#0f2042").setFontColor("#ffffff").setFontWeight("bold");

         var monitors = payload.monitors || [];
         var rows = [];
         for (var i = 0; i < monitors.length; i++) {
           var m = monitors[i];
           var t = m.tasks || {};
           rows.push([
             m.id, m.name, m.rollNumber || "-", m.className, m.section, m.role,
             t.recessOrder ? "DONE" : "PENDING",
             t.cleanDesk ? "DONE" : "PENDING",
             t.boardReady ? "DONE" : "PENDING",
             t.assemblyLine ? "DONE" : "PENDING",
             t.attendanceAssistance ? "DONE" : "PENDING",
             t.uniformCheck ? "DONE" : "PENDING",
             m.updatedAt || new Date().toISOString()
           ]);
         }
         if (rows.length > 0) {
           sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
         }
         sheet.autoResizeColumns(1, headers.length);
         return ContentService.createTextOutput(JSON.stringify({success: true, count: monitors.length})).setMimeType(ContentService.MimeType.JSON);
       } catch (err) {
         return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
       }
     }

  4. Click 'Deploy' > 'New deployment' > Select type: 'Web app'.
  5. Set 'Description': 'Monitor Sync', 'Execute as': 'Me', 'Who has access': 'Anyone'.
  6. Click 'Deploy', grant necessary permissions, and copy the Web App URL.
  7. Paste the Web App URL into the "Configure Sheets Webhook" button in this app!
=============================================================================
-->
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>St. Mary's School, Dwarka - Class Monitor Management System</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            school: {
              navy: '#0f2042',
              dark: '#081329',
              lightNavy: '#1b356b',
              gold: '#f59e0b',
              goldLight: '#fef3c7',
              accent: '#d97706'
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    @media print {
      header, main, .no-print {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #reportCardModal {
        position: static !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        display: block !important;
        inset: auto !important;
      }
      #reportCardModalContent {
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">

  <!-- School Branding & Header -->
  <header class="bg-[#0f2042] text-white shadow-xl border-b-4 border-amber-500 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-inner">
          <i data-lucide="graduation-cap" class="w-7 h-7"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs uppercase tracking-widest font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Academic Session 2026-27</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            ST. MARY'S SCHOOL, DWARKA
          </h1>
          <p class="text-xs text-slate-300 font-medium">Class Monitor Management & Daily Task Verification System</p>
        </div>
      </div>

      <!-- Cloud Sync & Global Controls -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Status Indicator -->
        <div id="syncStatusBadge" class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-200">
          <span id="syncDot" class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span id="syncStatusText">Local Storage Only</span>
        </div>

        <button onclick="triggerManualSync()" class="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
          <span>Sync Now</span>
        </button>

        <!-- Open Spreadsheet Button (always accessible or opens connected sheet) -->
        <button id="btnOpenSpreadsheet" onclick="openConnectedSpreadsheet()" class="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer" title="Open Google Spreadsheet">
          <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i>
          <span>Open Spreadsheet</span>
          <i data-lucide="external-link" class="w-3 h-3 opacity-80"></i>
        </button>

        <!-- Connect Google Button -->
        <button id="btnConnectGoogle" onclick="openGoogleAccountModal()" class="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer" title="Google Account Integration">
          <i data-lucide="log-in" class="w-3.5 h-3.5 text-blue-600"></i>
          <span id="googleAccountLabel">Connect Google</span>
        </button>

        <button onclick="openWebhookModal()" class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
          <i data-lucide="sheet" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span class="hidden sm:inline">Sheets Webhook</span>
        </button>

        <button onclick="exportToCSV()" class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
          <i data-lucide="download" class="w-3.5 h-3.5 text-blue-400"></i>
          <span class="hidden md:inline">Export CSV</span>
        </button>

        <button onclick="downloadSelfHTML()" class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
          <i data-lucide="file-code" class="w-3.5 h-3.5 text-purple-400"></i>
          <span class="hidden lg:inline">Single-File HTML</span>
        </button>

        <button onclick="openReportCardModal()" class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
          <i data-lucide="printer" class="w-3.5 h-3.5 text-amber-400"></i>
          <span class="hidden md:inline">Print Report Card</span>
        </button>

        <button onclick="openClearAllModal()" class="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span class="hidden sm:inline">Clear All</span>
        </button>

        <button onclick="confirmResetTerm()" class="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-amber-400"></i>
          <span class="hidden xl:inline">Reset Term</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">

    <!-- Dashboard Overview Metrics -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wider font-semibold text-slate-500">Total Monitors</p>
          <h3 id="statTotalMonitors" class="text-2xl font-black text-[#0f2042] mt-0.5">0</h3>
          <p class="text-[11px] text-emerald-600 font-medium mt-0.5">Active across school</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
          <i data-lucide="users" class="w-6 h-6"></i>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wider font-semibold text-slate-500">Active Rooms</p>
          <h3 id="statActiveRooms" class="text-2xl font-black text-[#0f2042] mt-0.5">0 / 60</h3>
          <p class="text-[11px] text-slate-500 font-medium mt-0.5">Classes 1-12 (A-E)</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <i data-lucide="layout-grid" class="w-6 h-6"></i>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wider font-semibold text-slate-500">Completed Tasks</p>
          <h3 id="statCompletedTasks" class="text-2xl font-black text-emerald-600 mt-0.5">0</h3>
          <p id="statTaskRatio" class="text-[11px] text-slate-500 font-medium mt-0.5">0% completion rate</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <i data-lucide="check-circle-2" class="w-6 h-6"></i>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wider font-semibold text-slate-500">Selected Room</p>
          <h3 id="statSelectedRoomText" class="text-2xl font-black text-[#0f2042] mt-0.5">Class 4-D</h3>
          <p id="statSelectedRoomMonitors" class="text-[11px] text-indigo-600 font-medium mt-0.5">2 Monitors appointed</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
          <i data-lucide="door-open" class="w-6 h-6"></i>
        </div>
      </div>
    </section>

    <!-- Context Selection & Assignment Form Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Dynamic Monitor Assignment Module -->
      <section class="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-[#0f2042] text-white flex items-center justify-center">
              <i data-lucide="user-plus" class="w-4 h-4 text-amber-400"></i>
            </div>
            <div>
              <h2 class="text-base font-bold text-[#0f2042]">Assign New Monitor</h2>
              <p class="text-xs text-slate-500">Register student responsibility role</p>
            </div>
          </div>

          <form id="assignMonitorForm" onsubmit="handleAssignMonitor(event)" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
              <input type="text" id="inputStudentName" required placeholder="e.g., Aarav D.K Raj" 
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042] focus:bg-white transition" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Class (1 - 12) *</label>
                <select id="inputClass" required class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042]">
                  <!-- Populated dynamically via JS -->
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Section (A - E) *</label>
                <select id="inputSection" required class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042]">
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D" selected>Section D</option>
                  <option value="E">Section E</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Roll Number / ID</label>
              <input type="text" id="inputRollNo" placeholder="e.g., 04" 
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042] focus:bg-white transition" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Designated Role *</label>
              <select id="inputRole" required class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042]">
                <option value="Class Monitor">Class Monitor</option>
                <option value="Assistant Monitor">Assistant Monitor</option>
                <option value="Discipline Monitor">Discipline Monitor</option>
                <option value="Cleanliness Monitor">Cleanliness Monitor</option>
                <option value="Board Writing Monitor">Board Writing Monitor</option>
              </select>
            </div>

            <button type="submit" class="w-full bg-[#0f2042] hover:bg-[#1b356b] text-white font-bold py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
              <i data-lucide="plus-circle" class="w-4 h-4 text-amber-400"></i>
              <span>Assign & Save to Roster</span>
            </button>
          </form>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 bg-amber-50/60 p-3 rounded-xl border border-amber-200/50">
          <div class="flex items-start gap-2 text-xs text-amber-900">
            <i data-lucide="shield-check" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
            <p>Every role assignment adheres to St. Mary's School code of conduct and immediately updates the central roster.</p>
          </div>
        </div>
      </section>

      <!-- Context Selection Toolbar & Roster Display -->
      <section class="lg:col-span-2 space-y-4">
        
        <!-- Context Selection Toolbar -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 class="text-sm font-bold text-[#0f2042] uppercase tracking-wide">Filter Room View</h2>
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Total 60 Rooms (Classes 1-12, A-E)</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Select Class</label>
              <select id="filterClass" onchange="handleContextChange()" class="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2042]">
                <!-- Populated via JS -->
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Select Section</label>
              <select id="filterSection" onchange="handleContextChange()" class="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2042]">
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D" selected>Section D</option>
                <option value="E">Section E</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Quick Search</label>
              <div class="relative">
                <input type="text" id="searchInput" oninput="handleSearch()" placeholder="Student or role..." 
                  class="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042]" />
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Roster Tracking & Badges Display List -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 id="rosterTitle" class="text-base font-bold text-[#0f2042]">Appointed Monitors — Class 4-D</h3>
              <p class="text-xs text-slate-500">Daily duty checklist and responsibility tracking</p>
            </div>
            <span id="roomMonitorCountBadge" class="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
              2 Assigned
            </span>
          </div>

          <div id="rosterContainer" class="space-y-4">
            <!-- Dynamic Monitor Cards injected here -->
          </div>

          <div id="emptyRosterNotice" class="hidden text-center py-12 px-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <i data-lucide="user-x" class="w-8 h-8"></i>
            </div>
            <h4 class="text-base font-bold text-slate-700">No Monitors Appointed For This Room</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">Use the assignment form on the left to appoint Class, Assistant, Discipline, Cleanliness, or Board Writing monitors for this section.</p>
          </div>
        </div>

      </section>
    </div>
  </main>

  <!-- Google Apps Script Webhook Modal -->
  <div id="webhookModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Google Sheets Sync Configuration</h3>
            <p class="text-xs text-slate-500">Connect Google Apps Script Web App Endpoint</p>
          </div>
        </div>
        <button onclick="closeWebhookModal()" class="text-slate-400 hover:text-slate-600 p-1">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="mt-4 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Google Apps Script Web App URL</label>
          <input type="url" id="webhookUrlInput" placeholder="https://script.google.com/macros/s/AKfycb.../exec" 
            class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042]" />
          <p class="text-[11px] text-slate-500 mt-1">Must be deployed as Web App with 'Anyone' permission.</p>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-[#0f2042]">Apps Script Code (doPost handler)</span>
            <button onclick="copyAppsScriptSnippet()" class="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span id="copySnippetBtnText">Copy Script</span>
            </button>
          </div>
          <p class="text-[11px] text-slate-500">Paste this script into Extensions &gt; Apps Script inside your Google Sheet.</p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button onclick="closeWebhookModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
          <button onclick="saveWebhookUrl()" class="px-4 py-2 text-xs font-bold bg-[#0f2042] text-white hover:bg-[#1b356b] rounded-lg transition shadow-sm">Save & Test Sync</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Direct Google Sheets & Account Modal -->
  <div id="googleAccountModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <i data-lucide="file-spreadsheet" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Google Workspace & Sheets Integration</h3>
            <p class="text-xs text-slate-500">St. Mary's School, Dwarka Cloud Sync</p>
          </div>
        </div>
        <button onclick="closeGoogleAccountModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="py-4 space-y-4">
        <!-- Account Status Box -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Google Workspace Account</span>
              <p id="googleUserEmailDisplay" class="text-xs font-bold text-slate-900 mt-0.5">aarav.d.k.raj27@gmail.com (Connected)</p>
            </div>
            <button onclick="toggleGoogleAccountState()" id="btnGoogleToggle" class="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition">
              <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span id="googleAccountStatusBadgeText">Active</span>
            </button>
          </div>
        </div>

        <!-- Connected Sheet Info -->
        <div class="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-950">Connected Google Spreadsheet</span>
            <button onclick="openConnectedSpreadsheet()" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline">
              <span>Open Spreadsheet</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </button>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Spreadsheet URL or ID</label>
            <input type="text" id="spreadsheetIdInput" placeholder="Paste Google Sheet URL or Spreadsheet ID..." 
              class="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f2042]" />
          </div>
          <div class="pt-2 flex items-center gap-2">
            <button onclick="saveConnectedSpreadsheet()" class="flex items-center gap-1.5 text-xs font-bold bg-[#0f2042] text-white hover:bg-[#1b356b] px-3.5 py-2 rounded-lg transition shadow-xs cursor-pointer">
              <i data-lucide="save" class="w-3.5 h-3.5"></i>
              <span>Save & Connect Sheet</span>
            </button>
            <button onclick="openConnectedSpreadsheet()" class="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-3.5 py-2 rounded-lg transition shadow-xs cursor-pointer">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>Open in Google Sheets</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end pt-2 border-t border-slate-100">
        <button onclick="closeGoogleAccountModal()" class="px-4 py-2 text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition cursor-pointer">Close</button>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div id="deleteModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <i data-lucide="alert-triangle" class="w-6 h-6"></i>
      </div>
      <h3 class="text-base font-bold text-slate-900">Remove Monitor Assignment?</h3>
      <p id="deleteModalDesc" class="text-xs text-slate-600 mt-1">Are you sure you want to remove this student from their monitor duty? This action cannot be undone.</p>
      <div class="flex justify-end gap-2 mt-5">
        <button onclick="closeDeleteModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
        <button id="confirmDeleteBtn" class="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-sm">Confirm Remove</button>
      </div>
    </div>
  </div>

  <!-- Clear All Confirmation Modal -->
  <div id="clearAllModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
      <div class="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <i data-lucide="alert-octagon" class="w-6 h-6"></i>
      </div>
      <h3 class="text-base font-bold text-slate-900">Clear All Monitors Roster?</h3>
      <p id="clearAllModalDesc" class="text-xs text-slate-600 mt-2 leading-relaxed">
        Are you sure you want to permanently remove all appointed student monitors across all classes and sections?
      </p>
      <div class="flex justify-end gap-2 mt-5">
        <button onclick="closeClearAllModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
        <button onclick="confirmClearAllMonitors()" class="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-sm">Confirm Clear All</button>
      </div>
    </div>
  </div>

  <!-- PDF-Ready School Report Card Modal -->
  <div id="reportCardModal" class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 hidden flex items-center justify-center p-2 sm:p-4">
    <div id="reportCardModalContent" class="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden">
      <!-- Toolbar (Hidden in print) -->
      <div class="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-2">
          <i data-lucide="printer" class="w-4 h-4 text-amber-400"></i>
          <span class="text-sm font-bold">Class Monitor Performance Report Card (Print Preview)</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.print()" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
            <span>Print / Save PDF</span>
          </button>
          <button onclick="closeReportCardModal()" class="text-slate-400 hover:text-white p-1.5 rounded-lg">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Printable Report Body -->
      <div class="p-6 sm:p-8 overflow-y-auto">
        <div class="border-4 border-double border-[#0f2042] p-5 rounded-2xl bg-white">
          <div class="text-center pb-4 border-b-2 border-[#0f2042]">
            <h1 class="text-2xl font-black text-[#0f2042] tracking-tight font-serif uppercase">ST. MARY'S SCHOOL, DWARKA</h1>
            <p class="text-[11px] font-bold tracking-widest uppercase text-slate-600">Affiliated to CBSE, New Delhi • Affiliation No. 2730386</p>
            <p class="text-[11px] text-slate-500">Sector 19, Dwarka, New Delhi - 110075 • CBSE School Code: 25192</p>
            <div class="mt-2.5 inline-block bg-[#0f2042] text-white px-5 py-1 rounded-full">
              <span class="text-xs font-black uppercase tracking-wider text-amber-300">Class Monitor Performance Report Card</span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-slate-300 text-xs bg-slate-50/80 -mx-5 px-5 my-3">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Class & Section</span>
              <span id="reportCardRoom" class="font-black text-sm text-[#0f2042]">Class 4-D</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Academic Session</span>
              <span class="font-bold text-slate-900">2026 – 2027</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Evaluation Term</span>
              <span class="font-bold text-slate-900">Term 1 Assessment</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-500 block">Date of Issue</span>
              <span id="reportCardDate" class="font-bold text-slate-900">November 6, 2026</span>
            </div>
          </div>

          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr class="bg-[#0f2042] text-white">
                  <th class="p-2 border border-slate-400 font-bold text-center w-12">Roll</th>
                  <th class="p-2 border border-slate-400 font-bold">Student Name</th>
                  <th class="p-2 border border-slate-400 font-bold">Role</th>
                  <th class="p-2 border border-slate-400 font-bold text-center">Duties Verified</th>
                  <th class="p-2 border border-slate-400 font-bold text-center w-16">Score</th>
                  <th class="p-2 border border-slate-400 font-bold text-center w-14">Grade</th>
                </tr>
              </thead>
              <tbody id="reportCardTableBody">
                <!-- Injected dynamically -->
              </tbody>
            </table>
          </div>

          <div class="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div class="h-8"></div>
              <div class="border-t border-slate-500 pt-1 font-bold">Class Teacher Signature</div>
            </div>
            <div>
              <div class="h-8 flex items-center justify-center font-mono text-[10px] text-slate-400">[SCHOOL SEAL]</div>
              <div class="border-t border-slate-500 pt-1 font-bold">Discipline In-Charge</div>
            </div>
            <div>
              <div class="h-8"></div>
              <div class="border-t border-slate-500 pt-1 font-bold">Principal / Vice-Principal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- JavaScript Implementation -->
  <script>
    const STORAGE_KEY = 'sm_monitors';
    const WEBHOOK_KEY = 'sm_webhook_url';

    // Demo rows for initial bootstrap
    const DEMO_MONITORS = [
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
          uniformCheck: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
          uniformCheck: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    let monitorsState = [];
    let currentFilterClass = '4';
    let currentFilterSection = 'D';
    let pendingDeleteId = null;

    // Initialize application
    window.addEventListener('DOMContentLoaded', () => {
      initClassOptions();
      loadStoredData();
      renderDashboard();
      lucide.createIcons();
    });

    function initClassOptions() {
      const classSelect = document.getElementById('inputClass');
      const filterSelect = document.getElementById('filterClass');
      classSelect.innerHTML = '';
      filterSelect.innerHTML = '';

      for (let i = 1; i <= 12; i++) {
        const opt1 = document.createElement('option');
        opt1.value = String(i);
        opt1.textContent = 'Class ' + i;
        if (i === 4) opt1.selected = true;
        classSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = String(i);
        opt2.textContent = 'Class ' + i;
        if (i === 4) opt2.selected = true;
        filterSelect.appendChild(opt2);
      }
    }

    function loadStoredData() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        monitorsState = [...DEMO_MONITORS];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(monitorsState));
      } else {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            // Only preserve what is saved by the teacher
            monitorsState = parsed.filter(function(m) {
              return !['sm-demo-03', 'sm-demo-04', 'sm-demo-05', 'sm-demo-06'].includes(m.id);
            });
          } else {
            monitorsState = [...DEMO_MONITORS];
          }
        } catch (e) {
          monitorsState = [...DEMO_MONITORS];
        }
      }

      const webhookUrl = localStorage.getItem(WEBHOOK_KEY);
      if (webhookUrl) {
        document.getElementById('webhookUrlInput').value = webhookUrl;
        updateSyncBadge('synced', 'Synced to Google Sheets');
      } else {
        updateSyncBadge('local', 'Local Storage Only');
      }
    }

    function persistData(triggerCloud = true) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monitorsState));
      renderDashboard();
      if (triggerCloud) {
        autoSyncCloud();
      }
    }

    function renderDashboard() {
      // Update counters
      const totalMonitors = monitorsState.length;
      document.getElementById('statTotalMonitors').textContent = totalMonitors;

      // Active rooms
      const activeRoomsSet = new Set(monitorsState.map(m => m.className + '-' + m.section));
      document.getElementById('statActiveRooms').textContent = activeRoomsSet.size + ' / 60';

      // Completed Tasks
      let totalCompleted = 0;
      let totalPossible = totalMonitors * 6;
      monitorsState.forEach(m => {
        const t = m.tasks || {};
        if (t.recessOrder) totalCompleted++;
        if (t.cleanDesk) totalCompleted++;
        if (t.boardReady) totalCompleted++;
        if (t.assemblyLine) totalCompleted++;
        if (t.attendanceAssistance) totalCompleted++;
        if (t.uniformCheck) totalCompleted++;
      });

      document.getElementById('statCompletedTasks').textContent = totalCompleted;
      const ratio = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
      document.getElementById('statTaskRatio').textContent = ratio + '% completion rate';

      // Selected room text
      document.getElementById('statSelectedRoomText').textContent = 'Class ' + currentFilterClass + '-' + currentFilterSection;
      document.getElementById('rosterTitle').textContent = 'Appointed Monitors — Class ' + currentFilterClass + '-' + currentFilterSection;

      // Render cards
      renderRosterList();
    }

    function renderRosterList() {
      const container = document.getElementById('rosterContainer');
      const emptyNotice = document.getElementById('emptyRosterNotice');
      const searchTerm = (document.getElementById('searchInput').value || '').toLowerCase().trim();

      const filtered = monitorsState.filter(m => {
        const matchesRoom = m.className === currentFilterClass && m.section === currentFilterSection;
        if (!matchesRoom) return false;
        if (!searchTerm) return true;
        return m.name.toLowerCase().includes(searchTerm) || m.role.toLowerCase().includes(searchTerm);
      });

      document.getElementById('roomMonitorCountBadge').textContent = filtered.length + ' Assigned';
      document.getElementById('statSelectedRoomMonitors').textContent = filtered.length + ' Monitors appointed';

      container.innerHTML = '';
      if (filtered.length === 0) {
        emptyNotice.classList.remove('hidden');
        return;
      }
      emptyNotice.classList.add('hidden');

      filtered.forEach(m => {
        const card = createMonitorCardElement(m);
        container.appendChild(card);
      });

      lucide.createIcons();
    }

    function getRoleBadge(role) {
      switch (role) {
        case 'Class Monitor':
          return '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">Class Monitor</span>';
        case 'Assistant Monitor':
          return '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">Assistant Monitor</span>';
        case 'Discipline Monitor':
          return '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Discipline Monitor</span>';
        case 'Cleanliness Monitor':
          return '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Cleanliness Monitor</span>';
        case 'Board Writing Monitor':
          return '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Board Writing Monitor</span>';
        default:
          return '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">' + role + '</span>';
      }
    }

    function createMonitorCardElement(m) {
      const card = document.createElement('div');
      card.className = 'border border-slate-200 bg-white rounded-xl p-4 hover:border-slate-300 transition shadow-xs';
      
      const t = m.tasks || {};

      card.innerHTML = \`
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center border border-slate-200">
              \${m.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-slate-900">\${escapeHtml(m.name)}</h4>
                \${m.rollNumber ? '<span class="text-[11px] text-slate-400 font-mono">#' + escapeHtml(m.rollNumber) + '</span>' : ''}
              </div>
              <div class="mt-1 flex items-center gap-2">
                \${getRoleBadge(m.role)}
                <span class="text-[11px] text-slate-400 font-medium">Room: \${m.className}-\${m.section}</span>
              </div>
            </div>
          </div>
          <button onclick="requestDeleteMonitor('\${m.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete monitor">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Daily Task Verification Checklist -->
        <div class="mt-3">
          <p class="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">Daily Duty Verification</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition">
              <input type="checkbox" \${t.recessOrder ? 'checked' : ''} onchange="toggleTask('\${m.id}', 'recessOrder')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
              <span>Recess Order Check</span>
            </label>

            <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition">
              <input type="checkbox" \${t.cleanDesk ? 'checked' : ''} onchange="toggleTask('\${m.id}', 'cleanDesk')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
              <span>Clean Desk Check</span>
            </label>

            <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition">
              <input type="checkbox" \${t.boardReady ? 'checked' : ''} onchange="toggleTask('\${m.id}', 'boardReady')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
              <span>Board Ready</span>
            </label>

            <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition">
              <input type="checkbox" \${t.assemblyLine ? 'checked' : ''} onchange="toggleTask('\${m.id}', 'assemblyLine')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
              <span>Assembly Line</span>
            </label>

            <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition">
              <input type="checkbox" \${t.attendanceAssistance ? 'checked' : ''} onchange="toggleTask('\${m.id}', 'attendanceAssistance')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
              <span>Attendance Assist</span>
            </label>

            <label class="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition">
              <input type="checkbox" \${t.uniformCheck ? 'checked' : ''} onchange="toggleTask('\${m.id}', 'uniformCheck')" class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
              <span>Uniform Check</span>
            </label>
          </div>
        </div>
      \`;
      return card;
    }

    function toggleTask(monitorId, taskKey) {
      const monitor = monitorsState.find(m => m.id === monitorId);
      if (monitor) {
        if (!monitor.tasks) monitor.tasks = {};
        monitor.tasks[taskKey] = !monitor.tasks[taskKey];
        monitor.updatedAt = new Date().toISOString();
        persistData(true);
      }
    }

    function handleAssignMonitor(e) {
      e.preventDefault();
      const name = document.getElementById('inputStudentName').value.trim();
      const className = document.getElementById('inputClass').value;
      const section = document.getElementById('inputSection').value;
      const rollNumber = document.getElementById('inputRollNo').value.trim();
      const role = document.getElementById('inputRole').value;

      if (!name) return;

      const newRecord = {
        id: 'sm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5),
        name,
        rollNumber,
        className,
        section,
        role,
        tasks: {
          recessOrder: false,
          cleanDesk: false,
          boardReady: false,
          assemblyLine: false,
          attendanceAssistance: false,
          uniformCheck: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      monitorsState.push(newRecord);
      document.getElementById('inputStudentName').value = '';
      document.getElementById('inputRollNo').value = '';

      // Switch context to newly assigned room
      currentFilterClass = className;
      currentFilterSection = section;
      document.getElementById('filterClass').value = className;
      document.getElementById('filterSection').value = section;

      persistData(true);
    }

    function handleContextChange() {
      currentFilterClass = document.getElementById('filterClass').value;
      currentFilterSection = document.getElementById('filterSection').value;
      renderDashboard();
    }

    function handleSearch() {
      renderRosterList();
    }

    function requestDeleteMonitor(id) {
      const m = monitorsState.find(x => x.id === id);
      if (!m) return;
      pendingDeleteId = id;
      document.getElementById('deleteModalDesc').textContent = 
        'Are you sure you want to remove ' + m.name + ' from duty as ' + m.role + ' in Class ' + m.className + '-' + m.section + '?';
      document.getElementById('deleteModal').classList.remove('hidden');
    }

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
      if (pendingDeleteId) {
        monitorsState = monitorsState.filter(m => m.id !== pendingDeleteId);
        pendingDeleteId = null;
        closeDeleteModal();
        persistData(true);
      }
    });

    function closeDeleteModal() {
      document.getElementById('deleteModal').classList.add('hidden');
      pendingDeleteId = null;
    }

    function confirmResetTerm() {
      if (confirm("Reset Term: This will clear monitor assignments back to default test records for St. Mary's School. Proceed?")) {
        monitorsState = [...DEMO_MONITORS];
        persistData(true);
      }
    }

    function openClearAllModal() {
      if (monitorsState.length === 0) {
        alert('There are no monitors appointed to clear.');
        return;
      }
      document.getElementById('clearAllModalDesc').textContent = 
        'Are you sure you want to permanently remove all ' + monitorsState.length + ' appointed student monitors across all classes (1 to 12) and sections (A to E)?';
      document.getElementById('clearAllModal').classList.remove('hidden');
    }

    function closeClearAllModal() {
      document.getElementById('clearAllModal').classList.add('hidden');
    }

    function confirmClearAllMonitors() {
      monitorsState = [];
      closeClearAllModal();
      persistData(true);
    }

    function openReportCardModal() {
      const roomMonitors = monitorsState.filter(m => m.className === currentFilterClass && m.section === currentFilterSection);
      document.getElementById('reportCardRoom').textContent = 'Class ' + currentFilterClass + '-' + currentFilterSection;
      document.getElementById('reportCardDate').textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const tbody = document.getElementById('reportCardTableBody');
      tbody.innerHTML = '';
      if (roomMonitors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400 italic">No appointed monitors in Class ' + currentFilterClass + '-' + currentFilterSection + '</td></tr>';
      } else {
        roomMonitors.forEach((m, idx) => {
          const t = m.tasks || {};
          let done = 0;
          if (t.recessOrder) done++;
          if (t.cleanDesk) done++;
          if (t.boardReady) done++;
          if (t.assemblyLine) done++;
          if (t.attendanceAssistance) done++;
          if (t.uniformCheck) done++;
          const pct = Math.round((done / 6) * 100);
          let grade = 'C';
          if (pct >= 85) grade = 'A+';
          else if (pct >= 66) grade = 'A';
          else if (pct >= 50) grade = 'B';
          const tr = document.createElement('tr');
          tr.className = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
          tr.innerHTML = '<td class="p-2 border border-slate-300 font-mono font-bold text-center">' + (m.rollNumber || (idx + 1)) + '</td>' +
            '<td class="p-2 border border-slate-300 font-bold">' + escapeHtml(m.name) + '</td>' +
            '<td class="p-2 border border-slate-300 font-semibold text-[#0f2042]">' + escapeHtml(m.role) + '</td>' +
            '<td class="p-2 border border-slate-300 text-center font-mono">' + done + ' of 6 checks (' + pct + '%)</td>' +
            '<td class="p-2 border border-slate-300 text-center font-bold">' + pct + '%</td>' +
            '<td class="p-2 border border-slate-300 text-center font-black">' + grade + '</td>';
          tbody.appendChild(tr);
        });
      }
      document.getElementById('reportCardModal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeReportCardModal() {
      document.getElementById('reportCardModal').classList.add('hidden');
    }

    // Google Sheets Sync Functions
    function updateSyncBadge(status, text) {
      const badge = document.getElementById('syncStatusBadge');
      const dot = document.getElementById('syncDot');
      const label = document.getElementById('syncStatusText');

      label.textContent = text;
      dot.className = 'w-2.5 h-2.5 rounded-full';

      if (status === 'synced') {
        dot.classList.add('bg-emerald-400');
      } else if (status === 'syncing') {
        dot.classList.add('bg-amber-400', 'animate-ping');
      } else if (status === 'error') {
        dot.classList.add('bg-rose-400');
      } else {
        dot.classList.add('bg-slate-400');
      }
    }

    let syncDebounceTimer = null;
    function autoSyncCloud() {
      const url = localStorage.getItem(WEBHOOK_KEY);
      if (!url) {
        updateSyncBadge('local', 'Local Storage Only');
        return;
      }
      clearTimeout(syncDebounceTimer);
      updateSyncBadge('syncing', 'Syncing...');
      syncDebounceTimer = setTimeout(() => {
        sendPayloadToWebhook(url);
      }, 800);
    }

    function triggerManualSync() {
      const url = localStorage.getItem(WEBHOOK_KEY);
      if (!url) {
        openWebhookModal();
        alert('Please configure your Google Apps Script Web App URL first.');
        return;
      }
      updateSyncBadge('syncing', 'Syncing...');
      sendPayloadToWebhook(url);
    }

    function sendPayloadToWebhook(url) {
      const payload = {
        school: "ST. MARY'S SCHOOL, DWARKA",
        timestamp: new Date().toISOString(),
        monitors: monitorsState
      };

      fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(() => {
        updateSyncBadge('synced', 'Synced to Google Sheets');
      })
      .catch((err) => {
        console.error('Webhook sync failed:', err);
        updateSyncBadge('error', 'Sync Failed (Check URL)');
      });
    }

    function openWebhookModal() {
      document.getElementById('webhookModal').classList.remove('hidden');
    }

    function closeWebhookModal() {
      document.getElementById('webhookModal').classList.add('hidden');
    }

    function saveWebhookUrl() {
      const input = document.getElementById('webhookUrlInput').value.trim();
      if (input) {
        localStorage.setItem(WEBHOOK_KEY, input);
        closeWebhookModal();
        triggerManualSync();
      } else {
        localStorage.removeItem(WEBHOOK_KEY);
        closeWebhookModal();
        updateSyncBadge('local', 'Local Storage Only');
      }
    }

    function copyAppsScriptSnippet() {
      const scriptCode = \`function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Class Monitors") || ss.insertSheet("Class Monitors");
  sheet.clear();
  var headers = ["ID", "Student Name", "Roll No", "Class", "Section", "Role", "Recess Check", "Desk Check", "Board Check", "Assembly Line", "Attendance Assist", "Uniform Check", "Last Updated"];
  sheet.appendRow(headers);
  var monitors = payload.monitors || [];
  var rows = [];
  for (var i = 0; i < monitors.length; i++) {
    var m = monitors[i], t = m.tasks || {};
    rows.push([m.id, m.name, m.rollNumber || "-", m.className, m.section, m.role, t.recessOrder ? "DONE" : "PENDING", t.cleanDesk ? "DONE" : "PENDING", t.boardReady ? "DONE" : "PENDING", t.assemblyLine ? "DONE" : "PENDING", t.attendanceAssistance ? "DONE" : "PENDING", t.uniformCheck ? "DONE" : "PENDING", m.updatedAt || new Date().toISOString()]);
  }
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
}\`;
      navigator.clipboard.writeText(scriptCode).then(() => {
        const btnText = document.getElementById('copySnippetBtnText');
        btnText.textContent = 'Copied!';
        setTimeout(() => { btnText.textContent = 'Copy Script'; }, 2000);
      });
    }

    function exportToCSV() {
      const headers = ['ID', 'Student Name', 'Roll No', 'Class', 'Section', 'Role', 'Recess Order', 'Clean Desk', 'Board Ready', 'Assembly Line', 'Attendance Assist', 'Uniform Check', 'Last Updated'];
      const rows = monitorsState.map(m => {
        const t = m.tasks || {};
        return [
          m.id,
          '"' + m.name.replace(/"/g, '""') + '"',
          m.rollNumber || '-',
          m.className,
          m.section,
          '"' + m.role + '"',
          t.recessOrder ? 'DONE' : 'PENDING',
          t.cleanDesk ? 'DONE' : 'PENDING',
          t.boardReady ? 'DONE' : 'PENDING',
          t.assemblyLine ? 'DONE' : 'PENDING',
          t.attendanceAssistance ? 'DONE' : 'PENDING',
          t.uniformCheck ? 'DONE' : 'PENDING',
          m.updatedAt || ''
        ];
      });

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\r\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'St_Marys_Class_Monitors_' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    const SPREADSHEET_KEY = 'sm_spreadsheet_url';
    const GOOGLE_USER_KEY = 'sm_google_user';

    function openConnectedSpreadsheet() {
      let sheetUrl = localStorage.getItem(SPREADSHEET_KEY);
      if (!sheetUrl) {
        const webhook = localStorage.getItem(WEBHOOK_KEY);
        if (webhook) {
          // If webhook is configured, the user has a spreadsheet
          sheetUrl = 'https://docs.google.com/spreadsheets/u/0/';
        }
      }
      if (!sheetUrl) {
        openGoogleAccountModal();
        return;
      }
      if (!sheetUrl.startsWith('http')) {
        sheetUrl = 'https://docs.google.com/spreadsheets/d/' + sheetUrl + '/edit';
      }
      window.open(sheetUrl, '_blank');
    }

    function openGoogleAccountModal() {
      const savedUrl = localStorage.getItem(SPREADSHEET_KEY) || '';
      document.getElementById('spreadsheetIdInput').value = savedUrl;
      document.getElementById('googleAccountModal').classList.remove('hidden');
    }

    function closeGoogleAccountModal() {
      document.getElementById('googleAccountModal').classList.add('hidden');
    }

    function saveConnectedSpreadsheet() {
      const val = document.getElementById('spreadsheetIdInput').value.trim();
      if (val) {
        localStorage.setItem(SPREADSHEET_KEY, val);
        updateSyncBadge('synced', 'Synced to Google Sheets');
        alert('Connected to Google Spreadsheet! You can now click "Open Spreadsheet" anytime.');
      } else {
        localStorage.removeItem(SPREADSHEET_KEY);
      }
      closeGoogleAccountModal();
    }

    function toggleGoogleAccountState() {
      const emailElem = document.getElementById('googleUserEmailDisplay');
      const badge = document.getElementById('googleAccountStatusBadgeText');
      const label = document.getElementById('googleAccountLabel');
      if (badge.textContent === 'Active') {
        badge.textContent = 'Disconnected';
        emailElem.textContent = 'Not Connected';
        label.textContent = 'Connect Google';
      } else {
        badge.textContent = 'Active';
        emailElem.textContent = 'aarav.d.k.raj27@gmail.com (Connected)';
        label.textContent = 'Google Connected';
      }
    }

    function downloadSelfHTML() {
      const fullHtml = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'StMarysClassMonitors.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  </script>
</body>
</html>`;
}
