using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;
using StMarysClassMonitors.Forms;
using StMarysClassMonitors.Services;

namespace StMarysClassMonitors
{
    static class Program
    {
        private static AppServer _server;

        /// <summary>
        /// Main entry point for St. Mary's School Class Monitor Management System (Windows Application).
        /// Launches the full desktop application window with identical UI, background,
        /// button positioning, text positioning, Google Sign-In, and Open Spreadsheet integration.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
            }
            catch { }

            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string wwwDir = Path.Combine(appDir, "www");

            // Start embedded local application server on dynamic loopback port
            string appUrl = "";
            try
            {
                _server = new AppServer(wwwDir);
                appUrl = _server.BaseUrl;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("AppServer startup notice: " + ex.Message);
            }

            // In background thread, attempt to also launch modern Edge / Chrome app window
            if (!string.IsNullOrEmpty(appUrl))
            {
                ThreadPool.QueueUserWorkItem((state) =>
                {
                    try
                    {
                        Thread.Sleep(300);
                        TryLaunchCompanionBrowserWindow(appUrl);
                    }
                    catch { }
                });
            }

            // Open the native St. Mary's School desktop window directly on screen!
            // This GUARANTEES that double-clicking the .exe opens a real, working window immediately.
            Application.Run(new MainForm(appUrl));
        }

        private static void TryLaunchCompanionBrowserWindow(string url)
        {
            string browser = FindBrowserPath();

            if (!string.IsNullOrEmpty(browser))
            {
                try
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = browser,
                        Arguments = string.Format("--app=\"{0}\" --window-size=1400,900", url),
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                    return;
                }
                catch { }
            }

            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = "msedge.exe",
                    Arguments = string.Format("--app=\"{0}\" --window-size=1400,900", url),
                    UseShellExecute = true
                };
                Process.Start(psi);
            }
            catch { }
        }

        private static string FindBrowserPath()
        {
            // 1. Check Registry for Microsoft Edge
            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe"))
                {
                    if (key != null)
                    {
                        object val = key.GetValue("");
                        if (val != null && File.Exists(val.ToString()))
                            return val.ToString();
                    }
                }
            }
            catch { }

            // 2. Check standard file paths for Microsoft Edge
            string[] edgePaths = new string[]
            {
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86) + @"\Microsoft\Edge\Application\msedge.exe",
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles) + @"\Microsoft\Edge\Application\msedge.exe",
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + @"\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
            };

            foreach (var p in edgePaths)
            {
                if (File.Exists(p)) return p;
            }

            // 3. Check Registry for Google Chrome
            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe"))
                {
                    if (key != null)
                    {
                        object val = key.GetValue("");
                        if (val != null && File.Exists(val.ToString()))
                            return val.ToString();
                    }
                }
            }
            catch { }

            // 4. Check standard file paths for Google Chrome
            string[] chromePaths = new string[]
            {
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles) + @"\Google\Chrome\Application\chrome.exe",
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86) + @"\Google\Chrome\Application\chrome.exe",
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + @"\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
            };

            foreach (var p in chromePaths)
            {
                if (File.Exists(p)) return p;
            }

            return null;
        }
    }
}
