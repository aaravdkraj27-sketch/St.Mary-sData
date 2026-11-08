import { MonitorRecord } from './types';

export const APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script for St. Mary's School, Dwarka - Class Monitor Sync
 * 
 * Instructions:
 * 1. Open your target Google Sheet (or a new one).
 * 2. Go to Extensions -> Apps Script.
 * 3. Replace all code in Code.gs with this script.
 * 4. Click 'Deploy' -> 'New deployment' -> Select type 'Web app'.
 * 5. Set 'Execute as': 'Me' and 'Who has access': 'Anyone'.
 * 6. Click 'Deploy', authorize permissions, and copy the Web App URL.
 * 7. Paste that Web App URL into the St. Mary's Class Monitor dashboard!
 */

function doGet(e) {
  var sheet = getOrCreateMonitorSheet();
  var data = sheet.getDataRange().getValues();
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', rows: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = getOrCreateMonitorSheet();
    
    // Clear existing data rows while preserving headers
    sheet.clear();
    
    // Set Header
    var headers = [
      "ID",
      "Student Name",
      "Roll No",
      "Class",
      "Section",
      "Role",
      "Recess Order Check",
      "Clean Desk Check",
      "Board Ready",
      "Assembly Line",
      "Attendance Assist",
      "Uniform Check",
      "Last Updated"
    ];
    
    sheet.appendRow(headers);
    
    // Format Header Row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0f2042");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    
    var monitors = payload.monitors || [];
    var rows = [];
    
    for (var i = 0; i < monitors.length; i++) {
      var m = monitors[i];
      var t = m.tasks || {};
      rows.push([
        m.id,
        m.name,
        m.rollNumber || "-",
        m.className,
        m.section,
        m.role,
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
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        count: monitors.length, 
        updatedAt: new Date().toISOString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateMonitorSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Class Monitors");
  if (!sheet) {
    sheet = ss.insertSheet("Class Monitors");
  }
  return sheet;
}
`;

/**
 * Push all monitors to Google Apps Script Webhook
 */
export async function syncToWebhook(
  webhookUrl: string, 
  monitors: MonitorRecord[], 
  reason: string = 'manual_sync'
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    throw new Error('Please configure a valid Google Apps Script Web App URL.');
  }

  const payload = {
    school: "ST. MARY'S SCHOOL, DWARKA",
    reason,
    timestamp: new Date().toISOString(),
    monitors
  };

  try {
    // Note: Google Apps Script Web App redirects 302, mode: 'cors' or 'no-cors'
    // 'no-cors' allows opaque submission without CORS preflight block
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: `Successfully synchronized ${monitors.length} monitor records to Google Sheets webhook.`
    };
  } catch (err: any) {
    console.error('Webhook sync error:', err);
    throw new Error(`Sync failed: ${err.message || 'Network error'}`);
  }
}

/**
 * Direct Google Sheets API integration using OAuth accessToken
 */
export async function createDirectSpreadsheet(
  accessToken: string,
  title: string = "St. Mary's School Dwarka - Class Monitors Roster"
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Class Monitors',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
  };
}

/**
 * Write monitors directly to a Google Spreadsheet via Google Sheets REST API
 */
export async function syncDirectToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  monitors: MonitorRecord[]
): Promise<void> {
  // First clear sheet or update range
  const headers = [
    "ID",
    "Student Name",
    "Roll No",
    "Class",
    "Section",
    "Role",
    "Recess Order Check",
    "Clean Desk Check",
    "Board Ready",
    "Assembly Line",
    "Attendance Assist",
    "Uniform Check",
    "Last Updated"
  ];

  const rows = monitors.map(m => [
    m.id,
    m.name,
    m.rollNumber || "-",
    `Class ${m.className}`,
    `Section ${m.section}`,
    m.role,
    m.tasks.recessOrder ? "DONE" : "PENDING",
    m.tasks.cleanDesk ? "DONE" : "PENDING",
    m.tasks.boardReady ? "DONE" : "PENDING",
    m.tasks.assemblyLine ? "DONE" : "PENDING",
    m.tasks.attendanceAssistance ? "DONE" : "PENDING",
    m.tasks.uniformCheck ? "DONE" : "PENDING",
    m.updatedAt || new Date().toISOString()
  ]);

  const values = [headers, ...rows];

  // Clear existing values
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Class Monitors!A1:Z500:clear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Update with new values
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Class Monitors!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.text();
    throw new Error(`Failed to update Google Sheet: ${err}`);
  }
}
