using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Text;
using StMarysClassMonitors.Models;

namespace StMarysClassMonitors.Services
{
    public class SyncResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int RecordsCount { get; set; }
    }

    public static class GoogleSheetsSync
    {
        public static SyncResult SyncMonitors(string webhookUrl, List<MonitorRecord> monitors)
        {
            if (string.IsNullOrWhiteSpace(webhookUrl))
            {
                return new SyncResult
                {
                    Success = false,
                    Message = "Google Sheets Webhook URL is not configured."
                };
            }

            try
            {
                // Prepare JSON payload
                string jsonPayload;
                var serializer = new DataContractJsonSerializer(typeof(List<MonitorRecord>));
                using (var ms = new MemoryStream())
                {
                    serializer.WriteObject(ms, monitors);
                    string monitorsJson = Encoding.UTF8.GetString(ms.ToArray());
                    
                    // Wrap in envelope
                    jsonPayload = string.Format(
                        "{{\"school\":\"ST. MARY'S SCHOOL, DWARKA\",\"timestamp\":\"{0}\",\"monitors\":{1}}}",
                        DateTime.UtcNow.ToString("o"),
                        monitorsJson
                    );
                }

                byte[] data = Encoding.UTF8.GetBytes(jsonPayload);

                var request = (HttpWebRequest)WebRequest.Create(webhookUrl);
                request.Method = "POST";
                request.ContentType = "application/json; charset=utf-8";
                request.ContentLength = data.Length;
                request.Timeout = 15000; // 15 seconds

                using (var reqStream = request.GetRequestStream())
                {
                    reqStream.Write(data, 0, data.Length);
                }

                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    using (var reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8))
                    {
                        reader.ReadToEnd();
                        return new SyncResult
                        {
                            Success = true,
                            Message = "Sync completed successfully at " + DateTime.Now.ToString("hh:mm:ss tt"),
                            RecordsCount = monitors.Count
                        };
                    }
                }
            }
            catch (WebException wex)
            {
                string extra = "";
                if (wex.Response != null)
                {
                    try
                    {
                        using (var reader = new StreamReader(wex.Response.GetResponseStream()))
                        {
                            extra = " (" + reader.ReadToEnd() + ")";
                        }
                    }
                    catch { }
                }
                return new SyncResult
                {
                    Success = false,
                    Message = "Network error: " + wex.Message + extra
                };
            }
            catch (Exception ex)
            {
                return new SyncResult
                {
                    Success = false,
                    Message = "Sync failed: " + ex.Message
                };
            }
        }

        public static SyncResult TestWebhook(string webhookUrl)
        {
            if (string.IsNullOrWhiteSpace(webhookUrl))
            {
                return new SyncResult { Success = false, Message = "Please enter a valid URL." };
            }

            try
            {
                string payload = string.Format(
                    "{{\"test\":true,\"school\":\"ST. MARY'S SCHOOL, DWARKA\",\"pingTime\":\"{0}\"}}",
                    DateTime.Now.ToString("s")
                );
                byte[] data = Encoding.UTF8.GetBytes(payload);

                var request = (HttpWebRequest)WebRequest.Create(webhookUrl);
                request.Method = "POST";
                request.ContentType = "application/json; charset=utf-8";
                request.ContentLength = data.Length;
                request.Timeout = 10000;

                using (var reqStream = request.GetRequestStream())
                {
                    reqStream.Write(data, 0, data.Length);
                }

                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    return new SyncResult
                    {
                        Success = true,
                        Message = "Endpoint responded with HTTP " + (int)response.StatusCode + " (" + response.StatusDescription + ")"
                    };
                }
            }
            catch (Exception ex)
            {
                return new SyncResult
                {
                    Success = false,
                    Message = "Endpoint check failed: " + ex.Message
                };
            }
        }
    }
}
