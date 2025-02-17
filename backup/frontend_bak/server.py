import http.server
import socketserver
import os
import webbrowser

PORT = 8000
INDEX_FILE = "index.html"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        if self.path == "/":
            self.path = INDEX_FILE
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

# Check if the index.html file exists
if not os.path.exists(INDEX_FILE):
    print(f"Error: {INDEX_FILE} not found in the current directory.")
    exit()

try:
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving at port {PORT}")
        webbrowser.open(f"http://localhost:{PORT}")
        httpd.serve_forever()
except OSError as e:
    print(f"Error: Could not start server on port {PORT}: {e}")
    exit()