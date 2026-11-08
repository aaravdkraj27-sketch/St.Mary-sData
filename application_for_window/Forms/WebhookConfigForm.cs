using System;
using System.Drawing;
using System.Windows.Forms;
using StMarysClassMonitors.Services;

namespace StMarysClassMonitors.Forms
{
    public class WebhookConfigForm : Form
    {
        private TextBox txtUrl;
        private Label lblStatus;
        private Button btnTest;
        private Button btnSave;
        private Button btnCancel;
        private TextBox txtScriptCode;
        public string WebhookUrl { get; private set; }

        public WebhookConfigForm(string currentUrl)
        {
            WebhookUrl = currentUrl ?? "";
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "Google Sheets Webhook Sync Configuration - St. Mary's School, Dwarka";
            this.Size = new Size(680, 560);
            this.StartPosition = FormStartPosition.CenterParent;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.FromArgb(248, 250, 252);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // Header Banner
            var headerPanel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 65,
                BackColor = Color.FromArgb(15, 32, 66) // Navy
            };
            var lblTitle = new Label
            {
                Text = "Google Sheets Web App Webhook Setup",
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 12f, FontStyle.Bold),
                Location = new Point(20, 12),
                AutoSize = true
            };
            var lblSubtitle = new Label
            {
                Text = "Connect your Google Spreadsheet to automatically receive live monitor rosters",
                ForeColor = Color.FromArgb(217, 226, 236),
                Font = new Font("Segoe UI", 8.5f),
                Location = new Point(20, 36),
                AutoSize = true
            };
            headerPanel.Controls.Add(lblTitle);
            headerPanel.Controls.Add(lblSubtitle);
            this.Controls.Add(headerPanel);

            // Main container
            var contentPanel = new Panel
            {
                Location = new Point(20, 80),
                Size = new Size(625, 420),
                BackColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle
            };
            this.Controls.Add(contentPanel);

            var lblPrompt = new Label
            {
                Text = "Google Apps Script Web App URL (Deployment ID Endpoint):",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(15, 15),
                AutoSize = true
            };
            contentPanel.Controls.Add(lblPrompt);

            txtUrl = new TextBox
            {
                Location = new Point(15, 40),
                Size = new Size(480, 26),
                Font = new Font("Consolas", 9f),
                Text = WebhookUrl
            };
            contentPanel.Controls.Add(txtUrl);

            btnTest = new Button
            {
                Text = "Test Link",
                Location = new Point(505, 39),
                Size = new Size(100, 28),
                BackColor = Color.FromArgb(241, 245, 249),
                ForeColor = Color.FromArgb(15, 23, 42),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnTest.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnTest.Click += BtnTest_Click;
            contentPanel.Controls.Add(btnTest);

            lblStatus = new Label
            {
                Text = "Ready to test or save.",
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(15, 75),
                Size = new Size(590, 20)
            };
            contentPanel.Controls.Add(lblStatus);

            var lblCodeTitle = new Label
            {
                Text = "Google Apps Script code for your Google Sheet (Extensions > Apps Script):",
                Font = new Font("Segoe UI", 9f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 32, 66),
                Location = new Point(15, 105),
                AutoSize = true
            };
            contentPanel.Controls.Add(lblCodeTitle);

            txtScriptCode = new TextBox
            {
                Location = new Point(15, 130),
                Size = new Size(590, 220),
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true,
                BackColor = Color.FromArgb(248, 250, 252),
                Font = new Font("Consolas", 8.5f),
                Text = @"function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Monitors') || ss.insertSheet('Monitors');
    
    // Set Header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID', 'Student Name', 'Class', 'Section', 'Role', 
        'Appointed Date', 'Assigned By', 'Completed Tasks', 'Updated At'
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#0f2042').setFontColor('#ffffff');
    }
    
    if (data.monitors && data.monitors.length) {
      // Clear previous rows and update fresh roster
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).clearContent();
      }
      var rows = data.monitors.map(function(m) {
        var completed = (m.tasks ? Object.values(m.tasks).filter(Boolean).length : 0);
        return [
          m.id, m.studentName, m.classNumber, m.section, m.role,
          m.appointedDate, m.assignedBy || 'Class Teacher', completed + '/6', new Date().toISOString()
        ];
      });
      sheet.getRange(2, 1, rows.length, 9).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', updated: new Date() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}"
            };
            contentPanel.Controls.Add(txtScriptCode);

            // Action Buttons
            btnSave = new Button
            {
                Text = "Save Webhook",
                Location = new Point(390, 365),
                Size = new Size(115, 36),
                BackColor = Color.FromArgb(15, 32, 66),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnSave.FlatAppearance.BorderSize = 0;
            btnSave.Click += BtnSave_Click;
            contentPanel.Controls.Add(btnSave);

            btnCancel = new Button
            {
                Text = "Close",
                Location = new Point(515, 365),
                Size = new Size(90, 36),
                BackColor = Color.FromArgb(241, 245, 249),
                ForeColor = Color.FromArgb(51, 65, 85),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnCancel.Click += (s, e) => this.Close();
            contentPanel.Controls.Add(btnCancel);
        }

        private void BtnTest_Click(object sender, EventArgs e)
        {
            string url = txtUrl.Text.Trim();
            if (string.IsNullOrEmpty(url))
            {
                lblStatus.Text = "Please enter an endpoint URL first.";
                lblStatus.ForeColor = Color.FromArgb(220, 38, 38);
                return;
            }

            lblStatus.Text = "Sending test ping to endpoint...";
            lblStatus.ForeColor = Color.FromArgb(15, 32, 66);
            btnTest.Enabled = false;

            try
            {
                var res = GoogleSheetsSync.TestWebhook(url);
                if (res.Success)
                {
                    lblStatus.Text = "Success: " + res.Message;
                    lblStatus.ForeColor = Color.FromArgb(22, 163, 74);
                }
                else
                {
                    lblStatus.Text = "Error: " + res.Message;
                    lblStatus.ForeColor = Color.FromArgb(220, 38, 38);
                }
            }
            finally
            {
                btnTest.Enabled = true;
            }
        }

        private void BtnSave_Click(object sender, EventArgs e)
        {
            WebhookUrl = txtUrl.Text.Trim();
            this.DialogResult = DialogResult.OK;
            this.Close();
        }
    }
}
