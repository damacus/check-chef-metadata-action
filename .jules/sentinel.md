## 2024-03-16 - SSRF Protection via URL Validation
**Vulnerability:** The action fetches URLs from metadata.rb (source_url, issues_url) using `undici.request` without validating the URL scheme or hostname. This creates a potential Server-Side Request Forgery (SSRF) risk, allowing arbitrary file reading via `file://` or fetching cloud metadata/internal endpoints via `http://`.
**Learning:** External inputs like URLs from metadata files must be validated for allowed protocols (HTTP/HTTPS) and protected against targeting internal metadata services (e.g., 169.254.169.254), particularly in GitHub Actions which run in cloud environments.
**Prevention:** Implement a rigorous URL validation check before passing strings to the `request` function. Check both the protocol/scheme and block known cloud metadata IPs and localhost addresses.

## 2024-03-20 - Incomplete SSRF Protection in metadata validation
**Vulnerability:** The existing SSRF protection for `source_url` and `issues_url` checked string inclusion of specific blocked IPs like '127.0.0.1' and '169.254.169.254'. This was vulnerable to trivial bypass using alternate IP encodings (e.g., `0x7f000001` or `127.0.0.2`), unroutable `0.0.0.0`, or DNS resolution to a private IP (e.g., `localtest.me`).
**Learning:** Checking string match against URLs for IP addresses is insufficient due to canonicalization rules and DNS rebinding.
**Prevention:** Always use a DNS resolver (`dns.promises.lookup`) to find the actual IP address behind the hostname, then validate against complete private/loopback RFC subnet boundaries using `net.isIPv4` and `net.isIPv6`.
