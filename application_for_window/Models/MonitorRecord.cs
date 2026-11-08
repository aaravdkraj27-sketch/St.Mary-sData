using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace StMarysClassMonitors.Models
{
    [DataContract]
    public class DailyTasks
    {
        [DataMember(Name = "recessOrder")]
        public bool RecessOrder { get; set; }

        [DataMember(Name = "cleanDesk")]
        public bool CleanDesk { get; set; }

        [DataMember(Name = "boardReady")]
        public bool BoardReady { get; set; }

        [DataMember(Name = "assemblyLine")]
        public bool AssemblyLine { get; set; }

        [DataMember(Name = "attendanceAssistance")]
        public bool AttendanceAssistance { get; set; }

        [DataMember(Name = "uniformCheck")]
        public bool UniformCheck { get; set; }

        public int CompletedCount()
        {
            int count = 0;
            if (RecessOrder) count++;
            if (CleanDesk) count++;
            if (BoardReady) count++;
            if (AssemblyLine) count++;
            if (AttendanceAssistance) count++;
            if (UniformCheck) count++;
            return count;
        }

        public int TotalCount() => 6;

        public double Percentage() => (CompletedCount() / 6.0) * 100.0;
    }

    [DataContract]
    public class MonitorRecord
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "name")]
        public string StudentName { get; set; }

        [DataMember(Name = "rollNumber")]
        public string RollNumber { get; set; }

        [DataMember(Name = "className")]
        public string ClassName { get; set; }

        public int ClassNumber
        {
            get
            {
                int val;
                if (int.TryParse(ClassName, out val)) return val;
                return 4;
            }
            set
            {
                ClassName = value.ToString();
            }
        }

        [DataMember(Name = "section")]
        public string Section { get; set; }

        [DataMember(Name = "role")]
        public string Role { get; set; }

        [DataMember(Name = "appointedDate")]
        public string AppointedDate { get; set; }

        [DataMember(Name = "assignedBy")]
        public string AssignedBy { get; set; }

        [DataMember(Name = "updatedAt")]
        public string UpdatedAt { get; set; }

        [DataMember(Name = "tasks")]
        public DailyTasks Tasks { get; set; }

        public MonitorRecord()
        {
            Id = "sm_" + DateTime.UtcNow.Ticks;
            AppointedDate = DateTime.Now.ToString("yyyy-MM-dd");
            UpdatedAt = DateTime.Now.ToString("hh:mm tt");
            AssignedBy = "Class Teacher";
            RollNumber = "";
            ClassName = "4";
            Section = "D";
            Tasks = new DailyTasks();
        }

        public string GetClassroom()
        {
            return "Class " + ClassName + "-" + Section;
        }
    }

    [DataContract]
    public class AppSettings
    {
        [DataMember(Name = "webhookUrl")]
        public string WebhookUrl { get; set; }

        [DataMember(Name = "spreadsheetUrl")]
        public string SpreadsheetUrl { get; set; }

        [DataMember(Name = "lastSyncTime")]
        public string LastSyncTime { get; set; }

        public AppSettings()
        {
            WebhookUrl = "";
            SpreadsheetUrl = "";
            LastSyncTime = "";
        }
    }

    public static class MonitorRoles
    {
        public const string ClassMonitor = "Class Monitor";
        public const string AssistantMonitor = "Assistant Monitor";
        public const string DisciplineMonitor = "Discipline Monitor";
        public const string CleanlinessMonitor = "Cleanliness Monitor";
        public const string BoardWritingMonitor = "Board Writing Monitor";

        public static readonly string[] AllRoles = new string[]
        {
            ClassMonitor,
            AssistantMonitor,
            DisciplineMonitor,
            CleanlinessMonitor,
            BoardWritingMonitor
        };
    }
}
