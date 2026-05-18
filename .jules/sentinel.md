## 2024-05-18 - Input Length Check for ReDoS Prevention in SemVer Regex
**Vulnerability:** Potential Regular Expression Denial of Service (ReDoS) vulnerability due to unbounded execution of a complex SemVer regex in `src/metadata.ts`.
**Learning:** Even well-established and standard regex patterns (like the official SemVer regex) can consume excessive CPU resources when executed on overly long strings. Unbounded input length is a common vector for ReDoS.
**Prevention:** Always bound input lengths (e.g., `if (version.length > 256) return false`) before executing complex regular expressions on externally provided data.
