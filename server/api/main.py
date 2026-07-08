"""uHomeNest API server — HTTP handler with CORS, JSON bodies, and
dynamic route matching.

Run from the repo root:
    cd server && python3 api/main.py

Or from anywhere:
    PYTHONPATH=server python3 -m api.main
"""

import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

# Allow imports relative to either server/ (run from server/)
# or server/api/ (run directly)
if __package__ is None:
    from pathlib import Path
    _here = Path(__file__).resolve().parent
    _srv = _here.parent
    if str(_srv) not in sys.path:
        sys.path.insert(0, str(_srv))
    if str(_here) not in sys.path:
        sys.path.insert(0, str(_here))

from router import route_request


class Handler(BaseHTTPRequestHandler):
    """HTTP request handler with JSON responses and CORS headers."""

    def _cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS",
        )
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
        )

    def _json(self, payload: dict, code: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self) -> dict | None:
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return None
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors_headers()
        self.end_headers()

    def _client_ip(self) -> str:
        """Extract client IP from request headers or socket."""
        forwarded = self.headers.get("X-Forwarded-For", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return self.client_address[0]

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        code, payload = route_request(
            "GET", parsed.path, parsed.query,
            client_ip=self._client_ip(),
        )
        self._json(payload, code)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        body = self._read_body()
        code, payload = route_request(
            "POST", parsed.path, parsed.query, body,
            client_ip=self._client_ip(),
        )
        self._json(payload, code)


def run() -> None:
    server = HTTPServer(("127.0.0.1", 7890), Handler)
    print("uHomeNest API listening on http://127.0.0.1:7890")
    server.serve_forever()


if __name__ == "__main__":
    run()