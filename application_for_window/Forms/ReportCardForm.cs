using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Printing;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using StMarysClassMonitors.Models;

namespace StMarysClassMonitors.Forms
{
    public class ReportCardForm : Form
    {
        private List<MonitorRecord> _monitors;
        private int _selectedClass;
        private string _selectedSection;
        private ComboBox cmbClass;
        private ComboBox cmbSection;
        private PrintDocument printDoc;
        private PrintPreviewControl previewControl;

        public ReportCardForm(List<MonitorRecord> monitors, int selectedClass, string selectedSection)
        {
            _monitors = monitors ?? new List<MonitorRecord>();
            _selectedClass = selectedClass;
            _selectedSection = selectedSection;
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "Official Monitor Roster Report Card - St. Mary's School, Dwarka";
            this.Size = new Size(950, 720);
            this.StartPosition = FormStartPosition.CenterParent;
            this.BackColor = Color.FromArgb(241, 245, 249);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // Top Toolbar
            var toolbar = new Panel
            {
                Dock = DockStyle.Top,
                Height = 60,
                BackColor = Color.FromArgb(15, 32, 66),
                Padding = new Padding(15, 12, 15, 12)
            };

            var lblScope = new Label
            {
                Text = "Report Scope:",
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                Location = new Point(15, 18),
                AutoSize = true
            };
            toolbar.Controls.Add(lblScope);

            cmbClass = new ComboBox
            {
                Location = new Point(115, 15),
                Size = new Size(110, 26),
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            cmbClass.Items.Add("All Classes");
            for (int i = 1; i <= 12; i++) cmbClass.Items.Add("Class " + i);
            cmbClass.SelectedIndex = _selectedClass >= 1 && _selectedClass <= 12 ? _selectedClass : 0;
            cmbClass.SelectedIndexChanged += FilterChanged;
            toolbar.Controls.Add(cmbClass);

            cmbSection = new ComboBox
            {
                Location = new Point(235, 15),
                Size = new Size(110, 26),
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            cmbSection.Items.Add("All Sections");
            foreach (var s in new string[] { "A", "B", "C", "D", "E" }) cmbSection.Items.Add("Section " + s);
            if (!string.IsNullOrEmpty(_selectedSection))
            {
                int sIdx = cmbSection.FindString("Section " + _selectedSection);
                cmbSection.SelectedIndex = sIdx >= 0 ? sIdx : 0;
            }
            else cmbSection.SelectedIndex = 0;
            cmbSection.SelectedIndexChanged += FilterChanged;
            toolbar.Controls.Add(cmbSection);

            var btnPrint = new Button
            {
                Text = "Print / Save PDF",
                Location = new Point(640, 12),
                Size = new Size(140, 34),
                BackColor = Color.FromArgb(245, 158, 11), // Gold
                ForeColor = Color.FromArgb(15, 23, 42),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnPrint.FlatAppearance.BorderSize = 0;
            btnPrint.Click += BtnPrint_Click;
            toolbar.Controls.Add(btnPrint);

            var btnClose = new Button
            {
                Text = "Close",
                Location = new Point(790, 12),
                Size = new Size(80, 34),
                BackColor = Color.FromArgb(30, 41, 59),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnClose.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            btnClose.Click += (s, e) => this.Close();
            toolbar.Controls.Add(btnClose);

            this.Controls.Add(toolbar);

            // Print Document Setup
            printDoc = new PrintDocument();
            printDoc.DefaultPageSettings.Margins = new Margins(40, 40, 40, 40);
            printDoc.PrintPage += PrintDoc_PrintPage;

            // Preview Control inside main body
            previewControl = new PrintPreviewControl
            {
                Dock = DockStyle.Fill,
                Document = printDoc,
                Zoom = 0.9,
                BackColor = Color.FromArgb(226, 232, 240)
            };
            this.Controls.Add(previewControl);
            previewControl.BringToFront();
        }

        private void FilterChanged(object sender, EventArgs e)
        {
            previewControl.InvalidatePreview();
        }

        private List<MonitorRecord> GetFilteredRecords()
        {
            var list = _monitors.AsEnumerable();
            if (cmbClass.SelectedIndex > 0)
            {
                int cls = cmbClass.SelectedIndex;
                list = list.Where(m => m.ClassNumber == cls);
            }
            if (cmbSection.SelectedIndex > 0)
            {
                string sec = cmbSection.SelectedItem.ToString().Replace("Section ", "").Trim();
                list = list.Where(m => m.Section == sec);
            }
            return list.OrderBy(m => m.ClassNumber).ThenBy(m => m.Section).ThenBy(m => m.StudentName).ToList();
        }

        private void BtnPrint_Click(object sender, EventArgs e)
        {
            using (var dlg = new PrintDialog())
            {
                dlg.Document = printDoc;
                dlg.UseEXDialog = true;
                if (dlg.ShowDialog() == DialogResult.OK)
                {
                    try
                    {
                        printDoc.Print();
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show("Printing error: " + ex.Message, "Print", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
        }

        private void PrintDoc_PrintPage(object sender, PrintPageEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

            var records = GetFilteredRecords();

            int left = e.MarginBounds.Left;
            int right = e.MarginBounds.Right;
            int top = e.MarginBounds.Top;
            int width = right - left;
            int y = top;

            // Header Banner (Navy)
            using (var navyBrush = new SolidBrush(Color.FromArgb(15, 32, 66)))
            {
                g.FillRectangle(navyBrush, left, y, width, 85);
            }

            // Gold Stripe
            using (var goldBrush = new SolidBrush(Color.FromArgb(245, 158, 11)))
            {
                g.FillRectangle(goldBrush, left, y + 82, width, 5);
            }

            // Title inside Navy Header
            using (var titleFont = new Font("Georgia", 16f, FontStyle.Bold))
            using (var subFont = new Font("Segoe UI", 9f, FontStyle.Regular))
            using (var whiteBrush = new SolidBrush(Color.White))
            using (var goldTextBrush = new SolidBrush(Color.FromArgb(251, 191, 36)))
            {
                g.DrawString("ST. MARY'S SCHOOL, DWARKA", titleFont, whiteBrush, left + 20, y + 14);
                g.DrawString("Sector 19, Dwarka, New Delhi - 110075 | CBSE Affiliation No. 2730386", subFont, goldTextBrush, left + 22, y + 42);
                g.DrawString("OFFICIAL CLASS MONITOR ROSTER & PERFORMANCE REPORT", subFont, whiteBrush, left + 22, y + 60);
            }

            y += 105;

            // Meta Info Bar
            using (var grayBrush = new SolidBrush(Color.FromArgb(248, 250, 252)))
            using (var borderPen = new Pen(Color.FromArgb(203, 213, 225), 1))
            using (var font = new Font("Segoe UI", 9f))
            using (var boldFont = new Font("Segoe UI", 9f, FontStyle.Bold))
            using (var textBrush = new SolidBrush(Color.FromArgb(15, 23, 42)))
            {
                g.FillRectangle(grayBrush, left, y, width, 32);
                g.DrawRectangle(borderPen, left, y, width, 32);

                string scopeText = cmbClass.SelectedIndex == 0 ? "All Classes" : cmbClass.SelectedItem.ToString();
                if (cmbSection.SelectedIndex > 0) scopeText += " - " + cmbSection.SelectedItem.ToString();

                g.DrawString("Scope: " + scopeText, boldFont, textBrush, left + 10, y + 8);
                g.DrawString("Total Records: " + records.Count, font, textBrush, left + 260, y + 8);
                g.DrawString("Generated: " + DateTime.Now.ToString("dd MMM yyyy, hh:mm tt"), font, textBrush, right - 220, y + 8);
            }

            y += 45;

            // Table Header
            using (var hdrBrush = new SolidBrush(Color.FromArgb(30, 41, 59)))
            using (var hdrFont = new Font("Segoe UI", 8.5f, FontStyle.Bold))
            using (var hdrTextBrush = new SolidBrush(Color.White))
            {
                g.FillRectangle(hdrBrush, left, y, width, 26);
                g.DrawString("#", hdrFont, hdrTextBrush, left + 8, y + 6);
                g.DrawString("Student Name", hdrFont, hdrTextBrush, left + 35, y + 6);
                g.DrawString("Class", hdrFont, hdrTextBrush, left + 190, y + 6);
                g.DrawString("Appointed Role", hdrFont, hdrTextBrush, left + 260, y + 6);
                g.DrawString("Duties Done", hdrFont, hdrTextBrush, left + 430, y + 6);
                g.DrawString("Grade", hdrFont, hdrTextBrush, left + 520, y + 6);
                g.DrawString("Assigned By", hdrFont, hdrTextBrush, left + 580, y + 6);
            }

            y += 28;

            if (records.Count == 0)
            {
                using (var emptyFont = new Font("Segoe UI", 10f, FontStyle.Italic))
                using (var emptyBrush = new SolidBrush(Color.FromArgb(100, 116, 139)))
                {
                    g.DrawString("No monitors currently assigned for the selected scope.", emptyFont, emptyBrush, left + 20, y + 20);
                }
                y += 60;
            }
            else
            {
                int idx = 1;
                using (var rowFont = new Font("Segoe UI", 8.5f))
                using (var boldRowFont = new Font("Segoe UI", 8.5f, FontStyle.Bold))
                using (var textBrush = new SolidBrush(Color.FromArgb(15, 23, 42)))
                using (var linePen = new Pen(Color.FromArgb(226, 232, 240)))
                using (var zebraBrush = new SolidBrush(Color.FromArgb(248, 250, 252)))
                {
                    foreach (var m in records)
                    {
                        if (y > e.MarginBounds.Bottom - 120)
                        {
                            // Page overflow protection for multi-page rosters
                            e.HasMorePages = true;
                            return;
                        }

                        if (idx % 2 == 0)
                        {
                            g.FillRectangle(zebraBrush, left, y, width, 24);
                        }

                        int completed = m.Tasks.CompletedCount();
                        string grade = completed >= 5 ? "A+" : completed >= 4 ? "A" : completed >= 2 ? "B" : "Needs Review";

                        g.DrawString(idx.ToString(), rowFont, textBrush, left + 8, y + 5);
                        g.DrawString(m.StudentName, boldRowFont, textBrush, left + 35, y + 5);
                        g.DrawString(m.ClassNumber + "-" + m.Section, rowFont, textBrush, left + 190, y + 5);
                        g.DrawString(m.Role, rowFont, textBrush, left + 260, y + 5);
                        g.DrawString(completed + "/6 (" + (int)m.Tasks.Percentage() + "%)", boldRowFont, textBrush, left + 430, y + 5);
                        g.DrawString(grade, boldRowFont, textBrush, left + 520, y + 5);
                        g.DrawString(m.AssignedBy ?? "Class Teacher", rowFont, textBrush, left + 580, y + 5);

                        g.DrawLine(linePen, left, y + 24, right, y + 24);
                        y += 25;
                        idx++;
                    }
                }
            }

            // Signatures Section at bottom
            y = Math.Max(y + 35, e.MarginBounds.Bottom - 80);

            using (var sigPen = new Pen(Color.FromArgb(71, 85, 105), 1) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dot })
            using (var sigFont = new Font("Segoe UI", 8.5f))
            using (var sigBrush = new SolidBrush(Color.FromArgb(51, 65, 85)))
            {
                // Class Teacher Signature
                g.DrawLine(sigPen, left + 40, y + 30, left + 220, y + 30);
                g.DrawString("Class Teacher Signature", sigFont, sigBrush, left + 55, y + 35);

                // Discipline In-Charge
                g.DrawLine(sigPen, left + 280, y + 30, left + 460, y + 30);
                g.DrawString("Discipline In-Charge", sigFont, sigBrush, left + 305, y + 35);

                // Principal Seal & Signature
                g.DrawLine(sigPen, right - 220, y + 30, right - 40, y + 30);
                g.DrawString("Principal / Head of School", sigFont, sigBrush, right - 200, y + 35);
            }

            e.HasMorePages = false;
        }
    }
}
