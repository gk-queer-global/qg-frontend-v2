"""Basic-auth site that starts listening after START_DELAY seconds (connection refused first)."""
import base64
import os
import socket
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

USER = os.environ.get("TEST_USER", "u")
PASS = os.environ.get("TEST_PASS", "p")
START_DELAY = float(os.environ.get("START_DELAY", "2"))


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_GET(self):
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Basic "):
            self.send_response(401)
            self.send_header("WWW-Authenticate", 'Basic realm="test"')
            self.end_headers()
            return
        try:
            decoded = base64.b64decode(auth[6:]).decode()
        except Exception:
            self.send_response(401)
            self.end_headers()
            return
        if decoded != f"{USER}:{PASS}":
            self.send_response(401)
            self.end_headers()
            return
        body = b"<html><div id=\"root\"></div></html>"
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    probe.bind(("127.0.0.1", 0))
    port = probe.getsockname()[1]
    probe.close()
    print(port, flush=True)
    sys.stdout.close()
    time.sleep(START_DELAY)
    server = HTTPServer(("127.0.0.1", port), Handler)
    server.serve_forever()
