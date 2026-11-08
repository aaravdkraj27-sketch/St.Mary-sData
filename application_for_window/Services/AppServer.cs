using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace StMarysClassMonitors.Services
{
    public class AppServer
    {
        private TcpListener _listener;
        private Thread _thread;
        private volatile bool _running;
        private readonly int _port;
        private readonly string _webRoot;

        public int Port => _port;
        public string BaseUrl => "http://127.0.0.1:" + _port + "/";

        public AppServer(string webRoot)
        {
            _webRoot = webRoot;

            // Automatically unpack standalone HTML if missing on disk
            UnpackIfNeeded();

            // Bind to loopback IP with port 0 (OS allocates guaranteed free ephemeral port)
            _listener = new TcpListener(IPAddress.Loopback, 0);
            _listener.Start();
            _port = ((IPEndPoint)_listener.LocalEndpoint).Port;
            _running = true;

            _thread = new Thread(ListenLoop)
            {
                IsBackground = true,
                Name = "StMarysTcpServer"
            };
            _thread.Start();
        }

        private void UnpackIfNeeded()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string htmlPath = Path.Combine(baseDir, "StMarysClassMonitors.html");
                if (!File.Exists(htmlPath))
                {
                    File.WriteAllBytes(htmlPath, EmbeddedAssets.GetStandaloneHtmlBytes());
                }

                if (!Directory.Exists(_webRoot))
                {
                    Directory.CreateDirectory(_webRoot);
                }

                string wwwIndex = Path.Combine(_webRoot, "index.html");
                if (!File.Exists(wwwIndex))
                {
                    File.WriteAllBytes(wwwIndex, EmbeddedAssets.GetStandaloneHtmlBytes());
                }
            }
            catch { }
        }

        public void Stop()
        {
            _running = false;
            try
            {
                _listener?.Stop();
            }
            catch { }
        }

        private void ListenLoop()
        {
            while (_running)
            {
                try
                {
                    var client = _listener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(HandleClient, client);
                }
                catch
                {
                    if (!_running) break;
                }
            }
        }

        private void HandleClient(object obj)
        {
            using (var client = (TcpClient)obj)
            {
                try
                {
                    client.ReceiveTimeout = 6000;
                    client.SendTimeout = 6000;

                    using (var stream = client.GetStream())
                    {
                        byte[] buffer = new byte[8192];
                        int read = stream.Read(buffer, 0, buffer.Length);
                        if (read <= 0) return;

                        string rawRequest = Encoding.ASCII.GetString(buffer, 0, read);
                        string[] lines = rawRequest.Split(new[] { "\r\n" }, StringSplitOptions.None);
                        if (lines.Length == 0) return;

                        string[] reqLine = lines[0].Split(' ');
                        if (reqLine.Length < 2) return;

                        string path = reqLine[1].Trim();
                        int queryIdx = path.IndexOf('?');
                        if (queryIdx >= 0) path = path.Substring(0, queryIdx);

                        if (path == "/" || string.IsNullOrEmpty(path))
                        {
                            path = "/index.html";
                        }

                        byte[] contentBytes = null;
                        string mimeType = "text/html; charset=utf-8";

                        // Try locating file in webRoot
                        string sanitized = path.TrimStart('/').Replace("..", "").Replace('/', Path.DirectorySeparatorChar);
                        string diskFile = Path.Combine(_webRoot, sanitized);

                        if (File.Exists(diskFile))
                        {
                            contentBytes = File.ReadAllBytes(diskFile);
                            mimeType = GetMimeType(diskFile);
                        }
                        else
                        {
                            // Check app folder for StMarysClassMonitors.html
                            string baseFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, sanitized);
                            if (File.Exists(baseFile))
                            {
                                contentBytes = File.ReadAllBytes(baseFile);
                                mimeType = GetMimeType(baseFile);
                            }
                            else if (path.EndsWith(".html") || path == "/index.html")
                            {
                                // Use embedded HTML bundle!
                                contentBytes = EmbeddedAssets.GetStandaloneHtmlBytes();
                                mimeType = "text/html; charset=utf-8";
                            }
                        }

                        if (contentBytes == null)
                        {
                            // If any other file requested, serve standalone HTML
                            contentBytes = EmbeddedAssets.GetStandaloneHtmlBytes();
                            mimeType = "text/html; charset=utf-8";
                        }

                        // Write HTTP response headers
                        string headers = string.Format(
                            "HTTP/1.1 200 OK\r\n" +
                            "Content-Type: {0}\r\n" +
                            "Content-Length: {1}\r\n" +
                            "Access-Control-Allow-Origin: *\r\n" +
                            "Cache-Control: no-cache, no-store, must-revalidate\r\n" +
                            "Connection: close\r\n\r\n",
                            mimeType, contentBytes.Length
                        );

                        byte[] headerBytes = Encoding.UTF8.GetBytes(headers);
                        stream.Write(headerBytes, 0, headerBytes.Length);
                        stream.Write(contentBytes, 0, contentBytes.Length);
                        stream.Flush();
                    }
                }
                catch { }
            }
        }

        private static string GetMimeType(string path)
        {
            string ext = Path.GetExtension(path).ToLowerInvariant();
            switch (ext)
            {
                case ".html":
                case ".htm":
                    return "text/html; charset=utf-8";
                case ".js":
                case ".mjs":
                    return "application/javascript; charset=utf-8";
                case ".css":
                    return "text/css; charset=utf-8";
                case ".json":
                    return "application/json; charset=utf-8";
                case ".svg":
                    return "image/svg+xml";
                case ".png":
                    return "image/png";
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".ico":
                    return "image/x-icon";
                case ".woff":
                    return "font/woff";
                case ".woff2":
                    return "font/woff2";
                case ".ttf":
                    return "font/ttf";
                default:
                    return "application/octet-stream";
            }
        }
    }
}
