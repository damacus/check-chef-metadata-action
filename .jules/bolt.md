## 2024-03-16 - [Queue Processing Optimization]
**Learning:** `queue.shift()` inside a `while` loop has O(N^2) complexity because V8 has to shift every array element down. For operations doing parallel work processing (like `runInParallel`), indexing `items[currentIndex++]` performs orders of magnitude faster (O(N)).
**Action:** When popping items from the front of an array in a loop, avoid `shift()`. Use a separate index counter instead, especially for queues that might grow large.

## 2025-02-13 - URL Reachability Optimization
**Learning:** Checking URL reachability sequentially and using `GET` methods creates significant network latency bottlenecks when validating multiple metadata files that may share common URLs (like repo or issue links).
**Action:** Always check independent network calls concurrently with `Promise.all`. For reachability checks, prefer `HEAD` requests over `GET` to avoid downloading response bodies, and memoize the promises to prevent duplicate requests across batches.
