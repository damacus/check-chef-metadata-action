## 2024-05-18 - Input Length Check for ReDoS Prevention in SemVer Regex
**Vulnerability:** Potential Regular Expression Denial of Service (ReDoS) vulnerability due to unbounded execution of a complex SemVer regex in `src/metadata.ts`.
**Learning:** Even well-established and standard regex patterns (like the official SemVer regex) can consume excessive CPU resources when executed on overly long strings. Unbounded input length is a common vector for ReDoS.
**Prevention:** Always bound input lengths (e.g., `if (version.length > 256) return false`) before executing complex regular expressions on externally provided data.

## 2024-03-16 - SSRF Protection via URL Validation
**Vulnerability:** The action fetches URLs from metadata.rb (source_url, issues_url) using `undici.request` without validating the URL scheme or hostname. This creates a potential Server-Side Request Forgery (SSRF) risk, allowing arbitrary file reading via `file://` or fetching cloud metadata/internal endpoints via `http://`.
**Learning:** External inputs like URLs from metadata files must be validated for allowed protocols (HTTP/HTTPS) and protected against targeting internal metadata services (e.g., 169.254.169.254), particularly in GitHub Actions which run in cloud environments.
**Prevention:** Implement a rigorous URL validation check before passing strings to the `request` function. Check both the protocol/scheme and block known cloud metadata IPs and localhost addresses.

## 2024-03-16 - SSRF Bypass via DNS Rebinding and Alternate IP Encoding
**Vulnerability:** Even though string-based filtering was implemented to block common loopback (localhost) and internal IP addresses, alternate encodings (e.g. decimal `0x7f000001` or octal) or public DNS names mapping to local IPs (e.g., `localtest.me` pointing to `127.0.0.1`) bypassed these checks.
**Learning:** Checking a hostname string against a hardcoded blocklist is insufficient for SSRF protection because attackers can construct various domain strings that ultimately resolve to forbidden IP ranges. A malicious domain can also use DNS Rebinding to switch resolution from a benign IP to a private IP after validation.
**Prevention:** Always use tools like `dns.promises.lookup()` to first resolve any hostname or IP literal to a concrete IP address before performing validation. Validate the underlying resolved IP against disallowed loopback (127.x.x.x), link-local (169.254.x.x), or private network ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x) rather than matching the raw input string.

## 2024-05-24 - SSRF Bypass via Incomplete IPv6 Checks
**Vulnerability:** The code protected against SSRF by checking for known private IPs. However, it used simple `startsWith` checks for IPv6 (e.g. `ip.startsWith('fc00:')`) which fails to block all valid private ranges (e.g., `fd00:` is also ULA, and `fc...` can be written in many compressed/uncompressed formats). Furthermore, IPv4-mapped IPv6 addresses (e.g., `::ffff:127.0.0.1`) could bypass the loopback check if not exact matched.
**Learning:** Checking IPv6 representations via strings is dangerous and flawed due to multiple valid representations (zero compression, leading zero dropping, uppercase/lowercase, and v4 mapped formats).
**Prevention:** Normalize IPv6 addresses securely before validation. Node.js `URL` object can normalize them (`new URL('http://[' + ip + ']').hostname`). And always map IPv4-mapped IPv6 formats back to their IPv4 equivalents before applying blacklist logic.

## 2024-05-24 - Conventional Commits in PR Titles
**Vulnerability:** CI fails on PR creation if the title doesn't follow Conventional Commits formatting.
**Learning:** The `amannn/action-semantic-pull-request` action strictly enforces Conventional Commit prefixes (`fix:`, `feat:`, etc.). My persona formatting (`🛡️ Sentinel: ...`) caused validation to fail.
**Prevention:** Always prefix PR titles with a Conventional Commit type (e.g., `fix: 🛡️ Sentinel: ...`).
