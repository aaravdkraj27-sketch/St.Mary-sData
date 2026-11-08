using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using StMarysClassMonitors.Models;

namespace StMarysClassMonitors.Services
{
    public class DataStore
    {
        private static readonly string AppDir = AppDomain.CurrentDomain.BaseDirectory;
        private static readonly string DataFilePath = Path.Combine(AppDir, "sm_monitors.json");
        private static readonly string SettingsFilePath = Path.Combine(AppDir, "sm_settings.json");

        private List<MonitorRecord> _monitors;
        private AppSettings _settings;

        public DataStore()
        {
            _monitors = LoadMonitorsInternal();
            _settings = LoadSettingsInternal();
        }

        public List<MonitorRecord> GetAll()
        {
            return new List<MonitorRecord>(_monitors);
        }

        public AppSettings Settings => _settings;

        public void SaveSettings(string webhookUrl)
        {
            _settings.WebhookUrl = webhookUrl != null ? webhookUrl.Trim() : "";
            SaveSettingsInternal();
        }

        public void UpdateLastSyncTime()
        {
            _settings.LastSyncTime = DateTime.Now.ToString("dd MMM yyyy, hh:mm tt");
            SaveSettingsInternal();
        }

        public void Add(MonitorRecord record)
        {
            if (record == null) return;
            if (string.IsNullOrEmpty(record.Id))
            {
                record.Id = "sm_" + DateTime.UtcNow.Ticks;
            }
            record.UpdatedAt = DateTime.Now.ToString("hh:mm tt");
            _monitors.Insert(0, record);
            SaveToFile();
        }

        public bool Update(MonitorRecord updated)
        {
            if (updated == null) return false;
            int idx = _monitors.FindIndex(m => m.Id == updated.Id);
            if (idx >= 0)
            {
                updated.UpdatedAt = DateTime.Now.ToString("hh:mm tt");
                _monitors[idx] = updated;
                SaveToFile();
                return true;
            }
            return false;
        }

        public bool Delete(string id)
        {
            int removed = _monitors.RemoveAll(m => m.Id == id);
            if (removed > 0)
            {
                SaveToFile();
                return true;
            }
            return false;
        }

        public void ClearAll()
        {
            _monitors.Clear();
            SaveToFile();
        }

        public void ResetTerm()
        {
            _monitors = GetDefaultSeed();
            SaveToFile();
        }

        public void SaveToFile()
        {
            try
            {
                var serializer = new DataContractJsonSerializer(typeof(List<MonitorRecord>));
                using (var ms = new MemoryStream())
                {
                    serializer.WriteObject(ms, _monitors);
                    string json = Encoding.UTF8.GetString(ms.ToArray());
                    File.WriteAllText(DataFilePath, json, Encoding.UTF8);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error saving data: " + ex.Message);
            }
        }

        private List<MonitorRecord> LoadMonitorsInternal()
        {
            try
            {
                if (File.Exists(DataFilePath))
                {
                    string json = File.ReadAllText(DataFilePath, Encoding.UTF8);
                    if (!string.IsNullOrWhiteSpace(json))
                    {
                        var serializer = new DataContractJsonSerializer(typeof(List<MonitorRecord>));
                        using (var ms = new MemoryStream(Encoding.UTF8.GetBytes(json)))
                        {
                            var list = serializer.ReadObject(ms) as List<MonitorRecord>;
                            if (list != null && list.Count > 0)
                            {
                                return list;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error loading data: " + ex.Message);
            }

            var defaults = GetDefaultSeed();
            try
            {
                var serializer = new DataContractJsonSerializer(typeof(List<MonitorRecord>));
                using (var ms = new MemoryStream())
                {
                    serializer.WriteObject(ms, defaults);
                    string json = Encoding.UTF8.GetString(ms.ToArray());
                    File.WriteAllText(DataFilePath, json, Encoding.UTF8);
                }
            }
            catch { }
            return defaults;
        }

        public static List<MonitorRecord> GetDefaultSeed()
        {
            return new List<MonitorRecord>
            {
                new MonitorRecord
                {
                    Id = "sm-demo-01",
                    StudentName = "Aarav D.K Raj",
                    RollNumber = "04",
                    ClassName = "4",
                    Section = "D",
                    Role = MonitorRoles.ClassMonitor,
                    AppointedDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    UpdatedAt = "08:15 AM",
                    AssignedBy = "Mrs. Sunita Sharma (Class Teacher)",
                    Tasks = new DailyTasks
                    {
                        RecessOrder = true,
                        CleanDesk = true,
                        BoardReady = true,
                        AssemblyLine = false,
                        AttendanceAssistance = true,
                        UniformCheck = true
                    }
                },
                new MonitorRecord
                {
                    Id = "sm-demo-02",
                    StudentName = "Tarik Khan",
                    RollNumber = "19",
                    ClassName = "4",
                    Section = "D",
                    Role = MonitorRoles.DisciplineMonitor,
                    AppointedDate = DateTime.Now.ToString("yyyy-MM-dd"),
                    UpdatedAt = "08:20 AM",
                    AssignedBy = "Mrs. Sunita Sharma (Class Teacher)",
                    Tasks = new DailyTasks
                    {
                        RecessOrder = true,
                        CleanDesk = false,
                        BoardReady = false,
                        AssemblyLine = true,
                        AttendanceAssistance = false,
                        UniformCheck = true
                    }
                }
            };
        }

        private AppSettings LoadSettingsInternal()
        {
            try
            {
                if (File.Exists(SettingsFilePath))
                {
                    string json = File.ReadAllText(SettingsFilePath, Encoding.UTF8);
                    if (!string.IsNullOrWhiteSpace(json))
                    {
                        var serializer = new DataContractJsonSerializer(typeof(AppSettings));
                        using (var ms = new MemoryStream(Encoding.UTF8.GetBytes(json)))
                        {
                            var s = serializer.ReadObject(ms) as AppSettings;
                            if (s != null) return s;
                        }
                    }
                }
            }
            catch { }
            return new AppSettings();
        }

        private void SaveSettingsInternal()
        {
            try
            {
                var serializer = new DataContractJsonSerializer(typeof(AppSettings));
                using (var ms = new MemoryStream())
                {
                    serializer.WriteObject(ms, _settings);
                    string json = Encoding.UTF8.GetString(ms.ToArray());
                    File.WriteAllText(SettingsFilePath, json, Encoding.UTF8);
                }
            }
            catch { }
        }

        public static string ExportToCsv(List<MonitorRecord> list, string filePath)
        {
            var sb = new StringBuilder();
            sb.AppendLine("ID,Student Name,Roll No,Class,Section,Role,Appointed Date,Assigned By,Recess Order Check,Clean Desk Check,Chalk & Board Ready,Line Discipline (Assembly),Attendance Assistance,Uniform & ID Inspection,Completed Tasks,Total Tasks,Completion %");

            foreach (var m in list)
            {
                sb.AppendLine(string.Format("\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\",\"{5}\",\"{6}\",\"{7}\",{8},{9},{10},{11},{12},{13},{14},{15},{16:0.0}%",
                    m.Id,
                    m.StudentName.Replace("\"", "\"\""),
                    m.RollNumber,
                    m.ClassName,
                    m.Section,
                    m.Role,
                    m.AppointedDate,
                    (m.AssignedBy ?? "").Replace("\"", "\"\""),
                    m.Tasks.RecessOrder ? "DONE" : "PENDING",
                    m.Tasks.CleanDesk ? "DONE" : "PENDING",
                    m.Tasks.BoardReady ? "DONE" : "PENDING",
                    m.Tasks.AssemblyLine ? "DONE" : "PENDING",
                    m.Tasks.AttendanceAssistance ? "DONE" : "PENDING",
                    m.Tasks.UniformCheck ? "DONE" : "PENDING",
                    m.Tasks.CompletedCount(),
                    m.Tasks.TotalCount(),
                    m.Tasks.Percentage()
                ));
            }

            File.WriteAllText(filePath, sb.ToString(), Encoding.UTF8);
            return filePath;
        }
    }
}
