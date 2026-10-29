"""HTTP server that returns transient errors before normal basic-auth behavior."""
import base64
import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

USER = os.environ.get("TEST_USER", "u")
PASS = os.environ.get("TEST_PASS", "p")
TRANSIENT_CODE = int(os.environ.get("TRANSIENT_CODE", "522"))
TRANSIENT_REMAINING = int(os.environ.get("TRANSIENT_COUNT", "1"))
ALWAYS_TRANSIENT = os.environ.get("ALWAYS_TRANSIENT", "")
TRANSIENT_ONLY_AUTH = os.environ.get("TRANSIENT_ONLY_AUTH", "")


class Handler(BaseHTTPRequestHandler):
    transient_remaining = TRANSIENT_REMAINING

    def log_message(self, *args):
        pass

    def _maybe_transient(self, *, authed):
        if TRANSIENT_ONLY_AUTH and not authed:
            return False
        if ALWAYS_TRANSIENT:
            self.send_response(TRANSIENT_CODE)
            self.end_headers()
            return True
        if Handler.transient_remaining > 0:
            Handler.transient_remaining -= 1
            self.send_response(TRANSIENT_CODE)
            self.end_headers()
            return True
        return False

    def do_GET(self):
        auth = self.headers.get("Authorization", "")
        has_auth = auth.startswith("Basic ")
        if not has_auth:
            if self._maybe_transient(authed=False):
                return
            self.send_response(401)
            self.send_header("WWW-Authenticate", 'Basic realm="test"')
            self.end_headers()
            return

        if self._maybe_transient(authed=True):
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
    server = HTTPServer(("127.0.0.1", 0), Handler)
    print(server.server_address[1], flush=True)
    sys.stdout.close()
    server.serve_forever()
