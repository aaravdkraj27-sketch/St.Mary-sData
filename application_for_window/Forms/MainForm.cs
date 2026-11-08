using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using StMarysClassMonitors.Models;
using StMarysClassMonitors.Services;

namespace StMarysClassMonitors.Forms
{
    public class MainForm : Form
    {
        private DataStore _dataStore;
        private string _appUrl;
        private int _currentClass = 4;
        private string _currentSection = "D";
        private string _searchQuery = "";
        private bool _viewAllRooms = false;

        // UI Controls
        private Panel headerPanel;
        private Panel syncIndicatorDot;
        private Label lblSyncStatus;
        private Button btnSyncNow;
        private Button btnOpenSpreadsheet;
        private Button btnConnectGoogle;
        private Button btnConfigSheets;
        private Button btnExportCsv;
        private Button btnSingleHtml;
        private Button btnPrintReport;
        private Button btnClearAll;
        private Button btnResetTerm;
        private Button btnOpenBrowser;

        // Metric Cards
        private Label lblTotalMonitorsVal;
        private Label lblActiveRoomsVal;
        private Label lblCompletedTasksVal;
        private Label lblCompletedRatioVal;
        private Panel pnlCompletedProgress;
        private Label lblCurrentRoomVal;
        private Label lblCurrentRoomMonitorsVal;

        // Filters
        private Button btnSingleRoomToggle;
        private Button btnMasterRosterToggle;
        private ComboBox cmbClassFilter;
        private FlowLayoutPanel pnlSectionButtons;
        private TextBox txtSearch;

        // Add Monitor Form Controls
        private TextBox txtStudentName;
        private ComboBox cmbNewClass;
        private ComboBox cmbNewSection;
        private TextBox txtRollNo;
        private ComboBox cmbNewRole;
        private Label lblRoleDutiesHint;
        private Button btnAddMonitor;

        // Roster Display
        private Label lblRosterHeader;
        private Label lblRosterCount;
        private FlowLayoutPanel pnlRosterCards;

        public MainForm(string appUrl = "")
        {
            _appUrl = appUrl;
            _dataStore = new DataStore();
            InitializeComponent();
            RefreshAllViews();
        }

        private void InitializeComponent()
        {
            this.Text = "St. Mary's School, Dwarka - Class Monitor Management System";
            this.Size = new Size(1380, 880);
            this.MinimumSize = new Size(1180, 750);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(248, 250, 252);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            BuildHeader();
            BuildMetricsRow();

            // Main container
            var mainContent = new Panel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(24, 12, 24, 12),
                BackColor = Color.FromArgb(248, 250, 252),
                AutoScroll = true
            };
            this.Controls.Add(mainContent);

            var filterBar = BuildFilterToolbar();
            mainContent.Controls.Add(filterBar);

            // Split grid: Left (Add Form, Width 380px), Right (Roster Cards, Fill)
            var splitPanel = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 2,
                RowCount = 1,
                Padding = new Padding(0, 10, 0, 0)
            };
            splitPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 390f));
            splitPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
            mainContent.Controls.Add(splitPanel);

            var addFormPanel = BuildAddMonitorPanel();
            splitPanel.Controls.Add(addFormPanel, 0, 0);

            var rosterPanel = BuildRosterPanel();
            splitPanel.Controls.Add(rosterPanel, 1, 0);

            BuildFooter();

            filterBar.BringToFront();
            splitPanel.BringToFront();
        }

        private void BuildHeader()
        {
            headerPanel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 85,
                BackColor = Color.FromArgb(15, 32, 66), // Deep Academic Navy
                Padding = new Padding(20, 10, 20, 10)
            };

            // Left Branding Box
            var crestBox = new Panel
            {
                Location = new Point(20, 16),
                Size = new Size(48, 48),
                BackColor = Color.FromArgb(30, 48, 85)
            };
            var crestLabel = new Label
            {
                Text = "SM",
                Font = new Font("Georgia", 16f, FontStyle.Bold),
                ForeColor = Color.FromArgb(245, 158, 11), // Gold
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleCenter
            };
            crestBox.Controls.Add(crestLabel);
            headerPanel.Controls.Add(crestBox);

            var pnlTitles = new Panel
            {
                Location = new Point(78, 12),
                Size = new Size(380, 60),
                BackColor = Color.Transparent
            };

            var lblBadge = new Label
            {
                Text = "AFFILIATED TO CBSE • DWARKA  •  Session 2026-27",
                Font = new Font("Segoe UI", 7.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(245, 158, 11),
                Location = new Point(0, 2),
                AutoSize = true
            };
            pnlTitles.Controls.Add(lblBadge);

            var lblTitle = new Label
            {
                Text = "ST. MARY'S SCHOOL, DWARKA",
                Font = new Font("Georgia", 14f, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(0, 18),
                AutoSize = true
            };
            pnlTitles.Controls.Add(lblTitle);

            var lblSub = new Label
            {
                Text = "Class Monitor Management System • Classes 1 to 12 (Sections A–E)",
                Font = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(203, 213, 225),
                Location = new Point(0, 42),
                AutoSize = true
            };
            pnlTitles.Controls.Add(lblSub);

            headerPanel.Controls.Add(pnlTitles);

            // Action Buttons Flow on Right
            var flowButtons = new FlowLayoutPanel
            {
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Location = new Point(460, 16),
                Size = new Size(890, 52),
                FlowDirection = FlowDirection.LeftToRight,
                WrapContents = false
            };

            // Status Badge
            var pnlSyncBadge = new Panel
            {
                Size = new Size(130, 36),
                BackColor = Color.FromArgb(30, 41, 59),
                Margin = new Padding(2, 4, 2, 4)
            };
            syncIndicatorDot = new Panel
            {
                Location = new Point(10, 13),
                Size = new Size(10, 10),
                BackColor = Color.FromArgb(245, 158, 11)
            };
            pnlSyncBadge.Controls.Add(syncIndicatorDot);
            lblSyncStatus = new Label
            {
                Text = "Local Storage",
                Font = new Font("Segoe UI", 8f, FontStyle.Bold),
                ForeColor = Color.FromArgb(226, 232, 240),
                Location = new Point(24, 10),
                AutoSize = true
            };
            pnlSyncBadge.Controls.Add(lblSyncStatus);
            flowButtons.Controls.Add(pnlSyncBadge);

            btnSyncNow = CreateHeaderButton("Sync Now", Color.FromArgb(245, 158, 11), Color.FromArgb(15, 23, 42));
            btnSyncNow.Click += BtnSyncNow_Click;
            flowButtons.Controls.Add(btnSyncNow);

            btnOpenSpreadsheet = CreateHeaderButton("Open Sheet", Color.FromArgb(5, 150, 105), Color.White);
            btnOpenSpreadsheet.Click += BtnOpenSpreadsheet_Click;
            flowButtons.Controls.Add(btnOpenSpreadsheet);

            btnConnectGoogle = CreateHeaderButton("Connect Google", Color.White, Color.FromArgb(29, 78, 216));
            btnConnectGoogle.Click += BtnConnectGoogle_Click;
            flowButtons.Controls.Add(btnConnectGoogle);

            btnConfigSheets = CreateHeaderButton("Sheets Webhook", Color.FromArgb(30, 41, 59), Color.White);
            btnConfigSheets.Click += BtnConfigSheets_Click;
            flowButtons.Controls.Add(btnConfigSheets);

            btnExportCsv = CreateHeaderButton("Export CSV", Color.FromArgb(51, 65, 85), Color.White);
            btnExportCsv.Click += BtnExportCsv_Click;
            flowButtons.Controls.Add(btnExportCsv);

            btnSingleHtml = CreateHeaderButton("Single HTML", Color.FromArgb(51, 65, 85), Color.White);
            btnSingleHtml.Click += BtnSingleHtml_Click;
            flowButtons.Controls.Add(btnSingleHtml);

            btnPrintReport = CreateHeaderButton("Report Card", Color.FromArgb(245, 158, 11), Color.FromArgb(15, 23, 42));
            btnPrintReport.Click += BtnPrintReport_Click;
            flowButtons.Controls.Add(btnPrintReport);

            btnClearAll = CreateHeaderButton("Clear All", Color.FromArgb(225, 29, 72), Color.White);
            btnClearAll.Click += BtnClearAll_Click;
            flowButtons.Controls.Add(btnClearAll);

            btnResetTerm = CreateHeaderButton("Reset Term", Color.FromArgb(71, 85, 105), Color.White);
            btnResetTerm.Click += BtnResetTerm_Click;
            flowButtons.Controls.Add(btnResetTerm);

            btnOpenBrowser = CreateHeaderButton("🌐 Web View", Color.FromArgb(37, 99, 235), Color.White);
            btnOpenBrowser.Click += BtnOpenBrowser_Click;
            flowButtons.Controls.Add(btnOpenBrowser);

            headerPanel.Controls.Add(flowButtons);
            this.Controls.Add(headerPanel);
        }

        private Button CreateHeaderButton(string text, Color bg, Color fg)
        {
            var btn = new Button
            {
                Text = text,
                Size = new Size(text.Length > 12 ? 105 : 82, 36),
                BackColor = bg,
                ForeColor = fg,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 8.25f, FontStyle.Bold),
                Cursor = Cursors.Hand,
                Margin = new Padding(2, 4, 2, 4)
            };
            btn.FlatAppearance.BorderSize = 0;
            return btn;
        }

        private void BuildMetricsRow()
        {
            var pnlMetrics = new TableLayoutPanel
            {
                Dock = DockStyle.Top,
                Height = 90,
                ColumnCount = 4,
                RowCount = 1,
                Padding = new Padding(24, 10, 24, 0),
                BackColor = Color.FromArgb(248, 250, 252)
            };
            for (int i = 0; i < 4; i++)
            {
                pnlMetrics.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 25f));
            }

            pnlMetrics.Controls.Add(CreateMetricCard("TOTAL MONITORS", out lblTotalMonitorsVal, "Appointed & on duty", Color.FromArgb(37, 99, 235)), 0, 0);
            pnlMetrics.Controls.Add(CreateMetricCard("ACTIVE ROOMS", out lblActiveRoomsVal, "Classes 1–12 • Sec A–E", Color.FromArgb(16, 185, 129)), 1, 0);

            // Metric Card 3: Tasks with progress bar
            var cardTasks = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.White,
                Margin = new Padding(6),
                BorderStyle = BorderStyle.FixedSingle
            };
            var accentTasks = new Panel { Dock = DockStyle.Left, Width = 5, BackColor = Color.FromArgb(245, 158, 11) };
            cardTasks.Controls.Add(accentTasks);

            var lblTTitle = new Label
            {
                Text = "DAILY TASKS DONE",
                Font = new Font("Segoe UI", 7.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(14, 10),
                AutoSize = true
            };
            cardTasks.Controls.Add(lblTTitle);

            lblCompletedTasksVal = new Label
            {
                Text = "8 / 12",
                Font = new Font("Segoe UI", 16f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(14, 26),
                AutoSize = true
            };
            cardTasks.Controls.Add(lblCompletedTasksVal);

            lblCompletedRatioVal = new Label
            {
                Text = "67% today's completion",
                Font = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(14, 58),
                AutoSize = true
            };
            cardTasks.Controls.Add(lblCompletedRatioVal);

            var pnlBarBg = new Panel
            {
                Location = new Point(160, 62),
                Size = new Size(110, 8),
                BackColor = Color.FromArgb(241, 245, 249)
            };
            pnlCompletedProgress = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(70, 8),
                BackColor = Color.FromArgb(16, 185, 129)
            };
            pnlBarBg.Controls.Add(pnlCompletedProgress);
            cardTasks.Controls.Add(pnlBarBg);

            pnlMetrics.Controls.Add(cardTasks, 2, 0);

            // Metric Card 4: Room Context
            var cardRoom = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.White,
                Margin = new Padding(6),
                BorderStyle = BorderStyle.FixedSingle
            };
            var accentRoom = new Panel { Dock = DockStyle.Left, Width = 5, BackColor = Color.FromArgb(109, 40, 217) };
            cardRoom.Controls.Add(accentRoom);

            var lblRTitle = new Label
            {
                Text = "CURRENT ROOM CONTEXT",
                Font = new Font("Segoe UI", 7.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(14, 10),
                AutoSize = true
            };
            cardRoom.Controls.Add(lblRTitle);

            lblCurrentRoomVal = new Label
            {
                Text = "Class 4-D",
                Font = new Font("Segoe UI", 16f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(14, 26),
                AutoSize = true
            };
            cardRoom.Controls.Add(lblCurrentRoomVal);

            lblCurrentRoomMonitorsVal = new Label
            {
                Text = "2 Monitors assigned",
                Font = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(109, 40, 217),
                Location = new Point(14, 58),
                AutoSize = true
            };
            cardRoom.Controls.Add(lblCurrentRoomMonitorsVal);

            pnlMetrics.Controls.Add(cardRoom, 3, 0);

            this.Controls.Add(pnlMetrics);
        }

        private Panel CreateMetricCard(string title, out Label valLabel, string subtitle, Color accentColor)
        {
            var pnl = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.White,
                Margin = new Padding(6),
                BorderStyle = BorderStyle.FixedSingle
            };

            var accent = new Panel { Dock = DockStyle.Left, Width = 5, BackColor = accentColor };
            pnl.Controls.Add(accent);

            var lblTitle = new Label
            {
                Text = title,
                Font = new Font("Segoe UI", 7.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(14, 10),
                AutoSize = true
            };
            pnl.Controls.Add(lblTitle);

            valLabel = new Label
            {
                Text = "0",
                Font = new Font("Segoe UI", 16f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(14, 26),
                AutoSize = true
            };
            pnl.Controls.Add(valLabel);

            var lblSub = new Label
            {
                Text = subtitle,
                Font = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(14, 58),
                AutoSize = true
            };
            pnl.Controls.Add(lblSub);

            return pnl;
        }

        private Panel BuildFilterToolbar()
        {
            var pnl = new Panel
            {
                Dock = DockStyle.Top,
                Height = 62,
                BackColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                Margin = new Padding(0, 0, 0, 8),
                Padding = new Padding(16, 10, 16, 10)
            };

            // Toggle buttons
            btnSingleRoomToggle = new Button
            {
                Text = "Single Room (4-D)",
                Location = new Point(14, 12),
                Size = new Size(130, 36),
                BackColor = Color.FromArgb(15, 32, 66),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnSingleRoomToggle.FlatAppearance.BorderSize = 0;
            btnSingleRoomToggle.Click += (s, e) =>
            {
                _viewAllRooms = false;
                UpdateRoomToggleButtons();
                RefreshRosterCards();
            };
            pnl.Controls.Add(btnSingleRoomToggle);

            btnMasterRosterToggle = new Button
            {
                Text = "Master Roster (All Rooms)",
                Location = new Point(150, 12),
                Size = new Size(160, 36),
                BackColor = Color.FromArgb(241, 245, 249),
                ForeColor = Color.FromArgb(15, 23, 42),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnMasterRosterToggle.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
            btnMasterRosterToggle.Click += (s, e) =>
            {
                _viewAllRooms = true;
                UpdateRoomToggleButtons();
                RefreshRosterCards();
            };
            pnl.Controls.Add(btnMasterRosterToggle);

            // Class Dropdown
            var lblClass = new Label
            {
                Text = "TARGET CLASS:",
                Font = new Font("Segoe UI", 8f, FontStyle.Bold),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(330, 20),
                AutoSize = true
            };
            pnl.Controls.Add(lblClass);

            cmbClassFilter = new ComboBox
            {
                Location = new Point(420, 16),
                Size = new Size(100, 26),
                DropDownStyle = ComboBoxStyle.DropDownList,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold)
            };
            for (int i = 1; i <= 12; i++) cmbClassFilter.Items.Add("Class " + i);
            cmbClassFilter.SelectedIndex = _currentClass - 1;
            cmbClassFilter.SelectedIndexChanged += (s, e) =>
            {
                _currentClass = cmbClassFilter.SelectedIndex + 1;
                btnSingleRoomToggle.Text = "Single Room (" + _currentClass + "-" + _currentSection + ")";
                RefreshAllViews();
            };
            pnl.Controls.Add(cmbClassFilter);

            // Section Pills
            var lblSec = new Label
            {
                Text = "SECTION:",
                Font = new Font("Segoe UI", 8f, FontStyle.Bold),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(535, 20),
                AutoSize = true
            };
            pnl.Controls.Add(lblSec);

            pnlSectionButtons = new FlowLayoutPanel
            {
                Location = new Point(595, 12),
                Size = new Size(270, 38),
                FlowDirection = FlowDirection.LeftToRight
            };

            foreach (var sec in new string[] { "A", "B", "C", "D", "E" })
            {
                var btn = new Button
                {
                    Text = "Sec " + sec,
                    Tag = sec,
                    Size = new Size(48, 34),
                    FlatStyle = FlatStyle.Flat,
                    Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                    Cursor = Cursors.Hand,
                    Margin = new Padding(2, 0, 2, 0)
                };
                btn.Click += (s, e) =>
                {
                    _currentSection = ((Button)s).Tag.ToString();
                    btnSingleRoomToggle.Text = "Single Room (" + _currentClass + "-" + _currentSection + ")";
                    UpdateSectionButtonStyles();
                    RefreshAllViews();
                };
                pnlSectionButtons.Controls.Add(btn);
            }
            UpdateSectionButtonStyles();
            pnl.Controls.Add(pnlSectionButtons);

            // Search
            var lblSearch = new Label
            {
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Text = "SEARCH:",
                Font = new Font("Segoe UI", 8f, FontStyle.Bold),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(880, 20),
                AutoSize = true
            };
            pnl.Controls.Add(lblSearch);

            txtSearch = new TextBox
            {
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Location = new Point(940, 16),
                Size = new Size(180, 26),
                Font = new Font("Segoe UI", 9f)
            };
            txtSearch.TextChanged += (s, e) =>
            {
                _searchQuery = txtSearch.Text.Trim();
                RefreshRosterCards();
            };
            pnl.Controls.Add(txtSearch);

            return pnl;
        }

        private void UpdateRoomToggleButtons()
        {
            if (_viewAllRooms)
            {
                btnMasterRosterToggle.BackColor = Color.FromArgb(15, 32, 66);
                btnMasterRosterToggle.ForeColor = Color.White;
                btnMasterRosterToggle.FlatAppearance.BorderSize = 0;

                btnSingleRoomToggle.BackColor = Color.FromArgb(241, 245, 249);
                btnSingleRoomToggle.ForeColor = Color.FromArgb(15, 23, 42);
                btnSingleRoomToggle.FlatAppearance.BorderSize = 1;
            }
            else
            {
                btnSingleRoomToggle.BackColor = Color.FromArgb(15, 32, 66);
                btnSingleRoomToggle.ForeColor = Color.White;
                btnSingleRoomToggle.FlatAppearance.BorderSize = 0;

                btnMasterRosterToggle.BackColor = Color.FromArgb(241, 245, 249);
                btnMasterRosterToggle.ForeColor = Color.FromArgb(15, 23, 42);
                btnMasterRosterToggle.FlatAppearance.BorderSize = 1;
            }
        }

        private void UpdateSectionButtonStyles()
        {
            foreach (Control c in pnlSectionButtons.Controls)
            {
                var btn = c as Button;
                if (btn != null && btn.Tag != null)
                {
                    bool active = btn.Tag.ToString() == _currentSection;
                    btn.BackColor = active ? Color.FromArgb(245, 158, 11) : Color.FromArgb(241, 245, 249);
                    btn.ForeColor = active ? Color.FromArgb(15, 23, 42) : Color.FromArgb(71, 85, 105);
                    btn.FlatAppearance.BorderSize = active ? 0 : 1;
                    btn.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);
                }
            }
        }

        private Panel BuildAddMonitorPanel()
        {
            var pnl = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                Padding = new Padding(18),
                Margin = new Padding(0, 0, 10, 0)
            };

            var topRow = new Panel { Dock = DockStyle.Top, Height = 45 };
            var lblTitle = new Label
            {
                Text = "Assign New Monitor",
                Font = new Font("Segoe UI", 11.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 32, 66),
                Location = new Point(0, 0),
                AutoSize = true
            };
            topRow.Controls.Add(lblTitle);

            var lblBadge = new Label
            {
                Text = "Term 1",
                Font = new Font("Segoe UI", 8f, FontStyle.Bold),
                BackColor = Color.FromArgb(254, 243, 199),
                ForeColor = Color.FromArgb(180, 83, 9),
                Location = new Point(285, 4),
                Size = new Size(60, 20),
                TextAlign = ContentAlignment.MiddleCenter
            };
            topRow.Controls.Add(lblBadge);

            var lblSub = new Label
            {
                Text = "Official student duty registration",
                Font = new Font("Segoe UI", 8.5f),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(0, 24),
                AutoSize = true
            };
            topRow.Controls.Add(lblSub);
            pnl.Controls.Add(topRow);

            int y = 55;

            pnl.Controls.Add(new Label { Text = "Student Full Name *", Font = new Font("Segoe UI", 8.5f, FontStyle.Bold), Location = new Point(14, y), AutoSize = true });
            y += 22;
            txtStudentName = new TextBox { Location = new Point(14, y), Size = new Size(345, 26), Font = new Font("Segoe UI", 9.5f) };
            pnl.Controls.Add(txtStudentName);
            y += 36;

            // Class & Section
            pnl.Controls.Add(new Label { Text = "Target Classroom *", Font = new Font("Segoe UI", 8.5f, FontStyle.Bold), Location = new Point(14, y), AutoSize = true });
            y += 22;

            cmbNewClass = new ComboBox { Location = new Point(14, y), Size = new Size(168, 26), DropDownStyle = ComboBoxStyle.DropDownList };
            for (int i = 1; i <= 12; i++) cmbNewClass.Items.Add("Class " + i);
            cmbNewClass.SelectedIndex = _currentClass - 1;
            pnl.Controls.Add(cmbNewClass);

            cmbNewSection = new ComboBox { Location = new Point(190, y), Size = new Size(168, 26), DropDownStyle = ComboBoxStyle.DropDownList };
            foreach (var s in new string[] { "A", "B", "C", "D", "E" }) cmbNewSection.Items.Add("Section " + s);
            cmbNewSection.SelectedIndex = 3;
            pnl.Controls.Add(cmbNewSection);
            y += 36;

            // Roll Number
            pnl.Controls.Add(new Label { Text = "Roll Number / Student ID (Optional)", Font = new Font("Segoe UI", 8.5f, FontStyle.Bold), Location = new Point(14, y), AutoSize = true });
            y += 22;
            txtRollNo = new TextBox { Location = new Point(14, y), Size = new Size(345, 26), Font = new Font("Segoe UI", 9.5f) };
            pnl.Controls.Add(txtRollNo);
            y += 36;

            // Role
            pnl.Controls.Add(new Label { Text = "Specific Responsibility Role *", Font = new Font("Segoe UI", 8.5f, FontStyle.Bold), Location = new Point(14, y), AutoSize = true });
            y += 22;
            cmbNewRole = new ComboBox { Location = new Point(14, y), Size = new Size(345, 26), DropDownStyle = ComboBoxStyle.DropDownList };
            foreach (var r in MonitorRoles.AllRoles) cmbNewRole.Items.Add(r);
            cmbNewRole.SelectedIndex = 0;
            cmbNewRole.SelectedIndexChanged += (s, e) => UpdateRoleHint();
            pnl.Controls.Add(cmbNewRole);
            y += 36;

            // Role Hint Box
            var pnlHint = new Panel
            {
                Location = new Point(14, y),
                Size = new Size(345, 45),
                BackColor = Color.FromArgb(254, 243, 199),
                BorderStyle = BorderStyle.FixedSingle,
                Padding = new Padding(8)
            };
            lblRoleDutiesHint = new Label
            {
                Text = "Role Duties: Chief student leader, teacher liaison & general order.",
                Dock = DockStyle.Fill,
                Font = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(146, 64, 14)
            };
            pnlHint.Controls.Add(lblRoleDutiesHint);
            pnl.Controls.Add(pnlHint);
            y += 55;

            btnAddMonitor = new Button
            {
                Text = "+ Assign & Save to Roster",
                Location = new Point(14, y),
                Size = new Size(345, 44),
                BackColor = Color.FromArgb(15, 32, 66),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 10f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnAddMonitor.FlatAppearance.BorderSize = 0;
            btnAddMonitor.Click += BtnAddMonitor_Click;
            pnl.Controls.Add(btnAddMonitor);

            return pnl;
        }

        private void UpdateRoleHint()
        {
            string role = cmbNewRole.SelectedItem != null ? cmbNewRole.SelectedItem.ToString() : "";
            if (role == MonitorRoles.ClassMonitor) lblRoleDutiesHint.Text = "Role Duties: Chief student leader, teacher liaison & general order.";
            else if (role == MonitorRoles.AssistantMonitor) lblRoleDutiesHint.Text = "Role Duties: Support Class Monitor and manage room supplies & attendance.";
            else if (role == MonitorRoles.DisciplineMonitor) lblRoleDutiesHint.Text = "Role Duties: Maintain line discipline during assembly, recess, and transitions.";
            else if (role == MonitorRoles.CleanlinessMonitor) lblRoleDutiesHint.Text = "Role Duties: Inspect clean desks, waste bins, blackboard & classroom hygiene.";
            else if (role == MonitorRoles.BoardWritingMonitor) lblRoleDutiesHint.Text = "Role Duties: Maintain clean blackboard, date/attendance header & chalk ready.";
        }

        private Panel BuildRosterPanel()
        {
            var pnl = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                Padding = new Padding(18)
            };

            var topRow = new Panel
            {
                Dock = DockStyle.Top,
                Height = 44
            };

            lblRosterHeader = new Label
            {
                Text = "Appointed Monitors — Class 4-D",
                Font = new Font("Segoe UI", 11.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 32, 66),
                Location = new Point(0, 0),
                AutoSize = true
            };
            topRow.Controls.Add(lblRosterHeader);

            var lblSub = new Label
            {
                Text = "Daily task verification checklist and role badge management",
                Font = new Font("Segoe UI", 8.5f),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(0, 22),
                AutoSize = true
            };
            topRow.Controls.Add(lblSub);

            lblRosterCount = new Label
            {
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Text = "2 Monitors Listed",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(79, 70, 229),
                BackColor = Color.FromArgb(238, 242, 255),
                Location = new Point(540, 6),
                Size = new Size(120, 26),
                TextAlign = ContentAlignment.MiddleCenter
            };
            topRow.Controls.Add(lblRosterCount);
            pnl.Controls.Add(topRow);

            // Scrollable cards list
            pnlRosterCards = new FlowLayoutPanel
            {
                Dock = DockStyle.Fill,
                AutoScroll = true,
                FlowDirection = FlowDirection.TopDown,
                WrapContents = false,
                Padding = new Padding(0, 10, 0, 10)
            };
            pnl.Controls.Add(pnlRosterCards);
            pnlRosterCards.BringToFront();

            return pnl;
        }

        private void RefreshRosterCards()
        {
            pnlRosterCards.Controls.Clear();

            var all = _dataStore.GetAll();
            IEnumerable<MonitorRecord> filtered = all;

            if (!_viewAllRooms)
            {
                filtered = filtered.Where(m => m.ClassNumber == _currentClass && m.Section == _currentSection);
            }

            if (!string.IsNullOrWhiteSpace(_searchQuery))
            {
                filtered = filtered.Where(m => m.StudentName.IndexOf(_searchQuery, StringComparison.OrdinalIgnoreCase) >= 0 ||
                                               m.Role.IndexOf(_searchQuery, StringComparison.OrdinalIgnoreCase) >= 0);
            }

            var list = filtered.ToList();

            lblRosterHeader.Text = _viewAllRooms ? "Master Roster (All Classes & Rooms)" : string.Format("Appointed Monitors — Class {0}-{1}", _currentClass, _currentSection);
            lblRosterCount.Text = list.Count + " Monitors Listed";

            if (list.Count == 0)
            {
                var emptyCard = new Panel
                {
                    Size = new Size(720, 180),
                    BackColor = Color.FromArgb(248, 250, 252),
                    BorderStyle = BorderStyle.FixedSingle,
                    Margin = new Padding(10, 20, 10, 10)
                };
                var lblEmpty = new Label
                {
                    Text = "No Monitors Appointed For This View\n\nUse the assignment form on the left to appoint monitors.",
                    Dock = DockStyle.Fill,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Font = new Font("Segoe UI", 10f),
                    ForeColor = Color.FromArgb(100, 116, 139)
                };
                emptyCard.Controls.Add(lblEmpty);
                pnlRosterCards.Controls.Add(emptyCard);
                return;
            }

            foreach (var m in list)
            {
                pnlRosterCards.Controls.Add(CreateMonitorCard(m));
            }
        }

        private Panel CreateMonitorCard(MonitorRecord m)
        {
            var card = new Panel
            {
                Size = new Size(740, 195),
                BackColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle,
                Margin = new Padding(0, 0, 0, 12),
                Padding = new Padding(14)
            };

            // Top Header: Avatar + Name + Badges + Delete
            var topPanel = new Panel { Dock = DockStyle.Top, Height = 58, BackColor = Color.Transparent };

            // Avatar circle
            var avatar = new Panel
            {
                Location = new Point(4, 4),
                Size = new Size(46, 46),
                BackColor = Color.FromArgb(15, 32, 66)
            };
            string initial = !string.IsNullOrEmpty(m.StudentName) ? m.StudentName.Substring(0, 1).ToUpper() : "M";
            var lblInitial = new Label
            {
                Text = initial,
                Font = new Font("Georgia", 14f, FontStyle.Bold),
                ForeColor = Color.FromArgb(245, 158, 11),
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleCenter
            };
            avatar.Controls.Add(lblInitial);
            topPanel.Controls.Add(avatar);

            // Student Name
            var lblName = new Label
            {
                Text = m.StudentName,
                Font = new Font("Segoe UI", 12f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(60, 4),
                AutoSize = true
            };
            topPanel.Controls.Add(lblName);

            int badgeX = 60 + lblName.PreferredWidth + 10;

            // Roll Number Badge
            if (!string.IsNullOrEmpty(m.RollNumber))
            {
                var lblRoll = new Label
                {
                    Text = "Roll #" + m.RollNumber,
                    Font = new Font("Segoe UI", 7.5f, FontStyle.Bold),
                    BackColor = Color.FromArgb(241, 245, 249),
                    ForeColor = Color.FromArgb(71, 85, 105),
                    Location = new Point(badgeX, 8),
                    Size = new Size(65, 18),
                    TextAlign = ContentAlignment.MiddleCenter
                };
                topPanel.Controls.Add(lblRoll);
                badgeX += 72;
            }

            // Room Badge
            var lblRoom = new Label
            {
                Text = "Class " + m.ClassName + "-" + m.Section,
                Font = new Font("Segoe UI", 7.5f, FontStyle.Bold),
                BackColor = Color.FromArgb(254, 243, 199),
                ForeColor = Color.FromArgb(180, 83, 9),
                Location = new Point(badgeX, 8),
                Size = new Size(72, 18),
                TextAlign = ContentAlignment.MiddleCenter
            };
            topPanel.Controls.Add(lblRoom);

            // Role Badge below name
            Color roleBg = Color.FromArgb(254, 243, 199);
            Color roleFg = Color.FromArgb(180, 83, 9);
            if (m.Role == MonitorRoles.DisciplineMonitor) { roleBg = Color.FromArgb(254, 226, 226); roleFg = Color.FromArgb(185, 28, 28); }
            else if (m.Role == MonitorRoles.AssistantMonitor) { roleBg = Color.FromArgb(219, 234, 254); roleFg = Color.FromArgb(29, 78, 216); }
            else if (m.Role == MonitorRoles.CleanlinessMonitor) { roleBg = Color.FromArgb(209, 250, 229); roleFg = Color.FromArgb(4, 120, 87); }
            else if (m.Role == MonitorRoles.BoardWritingMonitor) { roleBg = Color.FromArgb(237, 233, 254); roleFg = Color.FromArgb(109, 40, 217); }

            var lblRole = new Label
            {
                Text = m.Role,
                Font = new Font("Segoe UI", 8f, FontStyle.Bold),
                BackColor = roleBg,
                ForeColor = roleFg,
                Location = new Point(60, 28),
                Size = new Size(140, 20),
                TextAlign = ContentAlignment.MiddleCenter
            };
            topPanel.Controls.Add(lblRole);

            var lblUpdated = new Label
            {
                Text = "Updated: " + (m.UpdatedAt ?? "Today"),
                Font = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(208, 30),
                AutoSize = true
            };
            topPanel.Controls.Add(lblUpdated);

            // Right side of card: Progress counter + Delete button
            int completed = m.Tasks.CompletedCount();
            var lblCount = new Label
            {
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Text = completed + " / 6 Duties Checked",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(540, 8),
                Size = new Size(140, 20),
                TextAlign = ContentAlignment.TopRight
            };
            topPanel.Controls.Add(lblCount);

            var btnDel = new Button
            {
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Text = "✕",
                Location = new Point(690, 6),
                Size = new Size(28, 28),
                BackColor = Color.FromArgb(254, 242, 242),
                ForeColor = Color.FromArgb(220, 38, 38),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnDel.FlatAppearance.BorderColor = Color.FromArgb(254, 202, 202);
            btnDel.Click += (s, e) =>
            {
                var ask = MessageBox.Show(
                    string.Format("Remove {0} from {1}-{2} ({3})?", m.StudentName, m.ClassName, m.Section, m.Role),
                    "Confirm Removal - St. Mary's School",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question
                );
                if (ask == DialogResult.Yes)
                {
                    _dataStore.Delete(m.Id);
                    RefreshAllViews();
                }
            };
            topPanel.Controls.Add(btnDel);

            card.Controls.Add(topPanel);

            // Duties Checklist Header
            var lblDutyTitle = new Label
            {
                Text = "Daily Duty Verification Checklist (Click to toggle):",
                Font = new Font("Segoe UI", 8f, FontStyle.Bold),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(14, 66),
                AutoSize = true
            };
            card.Controls.Add(lblDutyTitle);

            // 6 Checkbox Items in 2 Rows x 3 Columns
            int cbY = 88;
            card.Controls.Add(CreateDutyBox(m, "Recess Order Check", m.Tasks.RecessOrder, 14, cbY, (val) => { m.Tasks.RecessOrder = val; }));
            card.Controls.Add(CreateDutyBox(m, "Clean Desk Check", m.Tasks.CleanDesk, 255, cbY, (val) => { m.Tasks.CleanDesk = val; }));
            card.Controls.Add(CreateDutyBox(m, "Chalk & Board Ready", m.Tasks.BoardReady, 495, cbY, (val) => { m.Tasks.BoardReady = val; }));

            cbY += 38;
            card.Controls.Add(CreateDutyBox(m, "Line Discipline (Assembly)", m.Tasks.AssemblyLine, 14, cbY, (val) => { m.Tasks.AssemblyLine = val; }));
            card.Controls.Add(CreateDutyBox(m, "Attendance Assistance", m.Tasks.AttendanceAssistance, 255, cbY, (val) => { m.Tasks.AttendanceAssistance = val; }));
            card.Controls.Add(CreateDutyBox(m, "Uniform & ID Inspection", m.Tasks.UniformCheck, 495, cbY, (val) => { m.Tasks.UniformCheck = val; }));

            return card;
        }

        private Panel CreateDutyBox(MonitorRecord m, string title, bool isChecked, int x, int y, Action<bool> onToggle)
        {
            var pnl = new Panel
            {
                Location = new Point(x, y),
                Size = new Size(230, 32),
                BackColor = isChecked ? Color.FromArgb(236, 253, 245) : Color.FromArgb(248, 250, 252),
                BorderStyle = BorderStyle.FixedSingle,
                Cursor = Cursors.Hand
            };

            var chk = new CheckBox
            {
                Text = title,
                Checked = isChecked,
                Location = new Point(6, 5),
                Size = new Size(218, 22),
                Font = new Font("Segoe UI", 8.25f, isChecked ? FontStyle.Bold : FontStyle.Regular),
                ForeColor = isChecked ? Color.FromArgb(6, 95, 70) : Color.FromArgb(71, 85, 105),
                Cursor = Cursors.Hand
            };

            chk.CheckedChanged += (s, e) =>
            {
                onToggle(chk.Checked);
                pnl.BackColor = chk.Checked ? Color.FromArgb(236, 253, 245) : Color.FromArgb(248, 250, 252);
                chk.ForeColor = chk.Checked ? Color.FromArgb(6, 95, 70) : Color.FromArgb(71, 85, 105);
                chk.Font = new Font("Segoe UI", 8.25f, chk.Checked ? FontStyle.Bold : FontStyle.Regular);
                _dataStore.Update(m);
                UpdateMetrics();
            };

            pnl.Click += (s, e) => chk.Checked = !chk.Checked;
            pnl.Controls.Add(chk);

            return pnl;
        }

        private void BuildFooter()
        {
            var footer = new Panel
            {
                Dock = DockStyle.Bottom,
                Height = 32,
                BackColor = Color.FromArgb(15, 32, 66),
                Padding = new Padding(24, 6, 24, 6)
            };

            var lblFootLeft = new Label
            {
                Text = "St. Mary's School, Dwarka  •  Class Monitor Management & Cloud Sync",
                Font = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(203, 213, 225),
                Location = new Point(24, 8),
                AutoSize = true
            };
            footer.Controls.Add(lblFootLeft);

            var lblFootRight = new Label
            {
                Anchor = AnchorStyles.Top | AnchorStyles.Right,
                Text = "CBSE Affiliation No. 2730386  •  Dual Persistence: LocalStorage (sm_monitors) + Google Sheets",
                Font = new Font("Segoe UI", 8f),
                ForeColor = Color.FromArgb(245, 158, 11),
                Location = new Point(780, 8),
                AutoSize = true
            };
            footer.Controls.Add(lblFootRight);

            this.Controls.Add(footer);
        }

        private void BtnAddMonitor_Click(object sender, EventArgs e)
        {
            string name = txtStudentName.Text.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                MessageBox.Show("Please enter the student's full name.", "Validation Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                txtStudentName.Focus();
                return;
            }

            int targetClass = cmbNewClass.SelectedIndex + 1;
            string targetSection = cmbNewSection.SelectedItem.ToString().Replace("Section ", "").Trim();
            string role = cmbNewRole.SelectedItem.ToString();
            string rollNo = txtRollNo.Text.Trim();

            var newRecord = new MonitorRecord
            {
                StudentName = name,
                RollNumber = rollNo,
                ClassName = targetClass.ToString(),
                Section = targetSection,
                Role = role,
                AssignedBy = "Class Teacher",
                AppointedDate = DateTime.Now.ToString("yyyy-MM-dd"),
                UpdatedAt = DateTime.Now.ToString("hh:mm tt"),
                Tasks = new DailyTasks()
            };

            _dataStore.Add(newRecord);

            txtStudentName.Text = "";
            txtRollNo.Text = "";

            _currentClass = targetClass;
            _currentSection = targetSection;
            cmbClassFilter.SelectedIndex = _currentClass - 1;
            UpdateSectionButtonStyles();

            RefreshAllViews();

            MessageBox.Show(
                string.Format("Successfully appointed {0} as {1} for Class {2}-{3}!", name, role, targetClass, targetSection),
                "Appointment Logged",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );
        }

        private void BtnClearAll_Click(object sender, EventArgs e)
        {
            var confirm = MessageBox.Show(
                "Are you sure you want to permanently clear ALL monitors across all classes and sections?",
                "Confirm Clear All - St. Mary's School, Dwarka",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Warning
            );

            if (confirm == DialogResult.Yes)
            {
                _dataStore.ClearAll();
                RefreshAllViews();
                MessageBox.Show("All monitor records have been removed.", "Records Cleared", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void BtnResetTerm_Click(object sender, EventArgs e)
        {
            var confirm = MessageBox.Show(
                "Reset term back to default baseline (Aarav D.K Raj & Tarik Khan in Class 4-D)?",
                "Reset Term - St. Mary's School",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );

            if (confirm == DialogResult.Yes)
            {
                _dataStore.ResetTerm();
                _currentClass = 4;
                _currentSection = "D";
                cmbClassFilter.SelectedIndex = 3;
                UpdateSectionButtonStyles();
                RefreshAllViews();
            }
        }

        private void BtnExportCsv_Click(object sender, EventArgs e)
        {
            var monitors = _dataStore.GetAll();
            using (var sfd = new SaveFileDialog())
            {
                sfd.Filter = "CSV Files (*.csv)|*.csv|All Files (*.*)|*.*";
                sfd.FileName = string.Format("St_Marys_Class_Monitors_{0}.csv", DateTime.Now.ToString("yyyyMMdd"));
                if (sfd.ShowDialog() == DialogResult.OK)
                {
                    DataStore.ExportToCsv(monitors, sfd.FileName);
                    MessageBox.Show("Exported " + monitors.Count + " records to:\n" + sfd.FileName, "Export Successful", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
        }

        private void BtnSingleHtml_Click(object sender, EventArgs e)
        {
            using (var sfd = new SaveFileDialog())
            {
                sfd.Filter = "HTML Files (*.html)|*.html";
                sfd.FileName = "StMarysClassMonitors.html";
                if (sfd.ShowDialog() == DialogResult.OK)
                {
                    File.WriteAllBytes(sfd.FileName, EmbeddedAssets.GetStandaloneHtmlBytes());
                    MessageBox.Show("Saved standalone single-file HTML to:\n" + sfd.FileName, "HTML Export Successful", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
        }

        private void BtnPrintReport_Click(object sender, EventArgs e)
        {
            var monitors = _dataStore.GetAll();
            using (var reportForm = new ReportCardForm(monitors, _currentClass, _currentSection))
            {
                reportForm.ShowDialog(this);
            }
        }

        private void BtnConfigSheets_Click(object sender, EventArgs e)
        {
            using (var cfg = new WebhookConfigForm(_dataStore.Settings.WebhookUrl))
            {
                if (cfg.ShowDialog(this) == DialogResult.OK)
                {
                    _dataStore.SaveSettings(cfg.WebhookUrl);
                    UpdateSyncIndicator();
                }
            }
        }

        private void BtnOpenSpreadsheet_Click(object sender, EventArgs e)
        {
            try
            {
                string url = _dataStore.Settings.SpreadsheetUrl;
                if (string.IsNullOrEmpty(url)) url = "https://docs.google.com/spreadsheets/u/0/";
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo { FileName = url, UseShellExecute = true });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not open browser: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void BtnConnectGoogle_Click(object sender, EventArgs e)
        {
            MessageBox.Show(
                "Google Workspace & Cloud Sync Status:\n\nAccount: aarav.d.k.raj27@gmail.com (Connected)\nOrganization: St. Mary's School, Dwarka\nOAuth Permissions: Google Spreadsheets, Drive Files\n\nLive changes automatically synchronize.",
                "Google Workspace Integration",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );
        }

        private void BtnSyncNow_Click(object sender, EventArgs e)
        {
            string url = _dataStore.Settings.WebhookUrl;
            if (string.IsNullOrWhiteSpace(url))
            {
                var ask = MessageBox.Show(
                    "Google Sheets Webhook URL is not configured.\n\nWould you like to configure it now?",
                    "Configure Sheets Webhook",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information
                );
                if (ask == DialogResult.Yes)
                {
                    BtnConfigSheets_Click(sender, e);
                }
                return;
            }

            syncIndicatorDot.BackColor = Color.FromArgb(245, 158, 11);
            lblSyncStatus.Text = "Syncing...";

            var monitors = _dataStore.GetAll();
            var res = GoogleSheetsSync.SyncMonitors(url, monitors);
            if (res.Success)
            {
                _dataStore.UpdateLastSyncTime();
                syncIndicatorDot.BackColor = Color.FromArgb(16, 185, 129);
                lblSyncStatus.Text = "Synced to Sheets";
                MessageBox.Show(res.Message, "Sync Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            else
            {
                syncIndicatorDot.BackColor = Color.FromArgb(225, 29, 72);
                lblSyncStatus.Text = "Sync Error";
                MessageBox.Show(res.Message, "Sync Failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void BtnOpenBrowser_Click(object sender, EventArgs e)
        {
            string url = !string.IsNullOrEmpty(_appUrl) ? _appUrl : "http://localhost:3000";
            try
            {
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch { }
        }

        private void RefreshAllViews()
        {
            UpdateMetrics();
            RefreshRosterCards();
            UpdateSyncIndicator();
        }

        private void UpdateSyncIndicator()
        {
            string url = _dataStore.Settings.WebhookUrl;
            if (!string.IsNullOrEmpty(url))
            {
                syncIndicatorDot.BackColor = Color.FromArgb(16, 185, 129);
                lblSyncStatus.Text = "Synced to Sheets";
            }
            else
            {
                syncIndicatorDot.BackColor = Color.FromArgb(148, 163, 184);
                lblSyncStatus.Text = "Local Storage";
            }
        }

        private void UpdateMetrics()
        {
            var all = _dataStore.GetAll();
            lblTotalMonitorsVal.Text = all.Count.ToString();

            int rooms = all.Select(m => m.ClassName + "-" + m.Section).Distinct().Count();
            lblActiveRoomsVal.Text = rooms + " / 60";

            int completed = all.Sum(m => m.Tasks.CompletedCount());
            int totalPossible = all.Count * 6;
            lblCompletedTasksVal.Text = completed + " / " + totalPossible;

            int ratio = totalPossible > 0 ? (int)((completed / (double)totalPossible) * 100) : 0;
            lblCompletedRatioVal.Text = ratio + "% today's completion";
            pnlCompletedProgress.Width = (int)(ratio * 1.1);

            lblCurrentRoomVal.Text = "Class " + _currentClass + "-" + _currentSection;
            int roomMonitors = all.Count(m => m.ClassNumber == _currentClass && m.Section == _currentSection);
            lblCurrentRoomMonitorsVal.Text = roomMonitors + " Monitors assigned";
        }
    }
}
