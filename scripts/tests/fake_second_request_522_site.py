"""Site that 522s a second authorized GET to the same path within 50ms (split-fetch probe)."""
import base64
import os
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

USER = os.environ.get("TEST_USER", "u")
PASS = os.environ.get("TEST_PASS", "p")
DUPLICATE_WINDOW_SEC = float(os.environ.get("DUPLICATE_WINDOW_SEC", "0.05"))


class Handler(BaseHTTPRequestHandler):
    last_authed_path = ""
    last_authed_at = 0.0

    def log_message(self, *args):
        pass

    def do_GET(self):
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Basic "):
            self.send_response(401)
            self.send_header("WWW-Authenticate", 'Basic realm="test"')
            self.end_headers()
            return

        now = time.monotonic()
        if (
            self.path == Handler.last_authed_path
            and (now - Handler.last_authed_at) < DUPLICATE_WINDOW_SEC
        ):
            self.send_response(522)
            self.end_headers()
            return
        Handler.last_authed_path = self.path
        Handler.last_authed_at = now

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
    server = HTTPServer(("127.0.0.1", 0), Handler)
    print(server.server_address[1], flush=True)
    sys.stdout.close()
    server.serve_forever()
