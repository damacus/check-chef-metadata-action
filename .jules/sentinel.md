## 2024-03-16 - SSRF Protection via URL Validation
**Vulnerability:** The action fetches URLs from metadata.rb (source_url, issues_url) using `undici.request` without validating the URL scheme or hostname. This creates a potential Server-Side Request Forgery (SSRF) risk, allowing arbitrary file reading via `file://` or fetching cloud metadata/internal endpoints via `http://`.
**Learning:** External inputs like URLs from metadata files must be validated for allowed protocols (HTTP/HTTPS) and protected against targeting internal metadata services (e.g., 169.254.169.254), particularly in GitHub Actions which run in cloud environments.
**Prevention:** Implement a rigorous URL validation check before passing strings to the `request` function. Check both the protocol/scheme and block known cloud metadata IPs and localhost addresses.

## 2025-05-24 - Advanced SSRF Protection via IP validation
**Vulnerability:** The initial SSRF protection using a simple blocklist for hostnames (`localhost`, `127.0.0.1`, `[::1]`) was easily bypassed using obfuscated IP formats (e.g., `2130706433`, `0x7f.0.0.1`) and other private or reserved network ranges (e.g., `10.0.0.1`, `169.254.169.254`).
**Learning:** Checking hostnames directly against a blocklist of strings is insufficient for SSRF protection because URL parsers normalize various representations into IP addresses. Attackers exploit IP obfuscation to bypass simple checks.
**Prevention:** Always parse the hostname from the URL, determine if it represents an IP address (e.g., using `net.isIP()`), and then validate the underlying IP address against known private/internal/reserved ranges (RFC 1918, RFC 4193, loopback, etc.), handling both IPv4 and IPv6 variations (including IPv4-mapped IPv6 addresses).
