## 2024-03-16 - [Queue Processing Optimization]
**Learning:** `queue.shift()` inside a `while` loop has O(N^2) complexity because V8 has to shift every array element down. For operations doing parallel work processing (like `runInParallel`), indexing `items[currentIndex++]` performs orders of magnitude faster (O(N)).
**Action:** When popping items from the front of an array in a loop, avoid `shift()`. Use a separate index counter instead, especially for queues that might grow large.
## 2026-03-19 - [Use HEAD Requests for Reachability Checks]
**Learning:** Checking URL reachability with `GET` requests downloads the entire response body, wasting bandwidth and time, especially for large resources or web pages. Using `HEAD` significantly reduces latency and resource usage. However, some servers reject `HEAD` requests (returning 405 Method Not Allowed or 403 Forbidden). So, fallback to `GET` is necessary for a robust check.
**Action:** When checking if a URL is accessible, default to `HEAD` requests to save bandwidth and improve performance. Implement a fallback to `GET` for servers that do not correctly support `HEAD`.
