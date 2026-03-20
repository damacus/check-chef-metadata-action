## 2024-03-16 - [Queue Processing Optimization]
**Learning:** `queue.shift()` inside a `while` loop has O(N^2) complexity because V8 has to shift every array element down. For operations doing parallel work processing (like `runInParallel`), indexing `items[currentIndex++]` performs orders of magnitude faster (O(N)).
**Action:** When popping items from the front of an array in a loop, avoid `shift()`. Use a separate index counter instead, especially for queues that might grow large.

## 2024-03-20 - [Concurrent Network Requests]
**Learning:** Sequential await calls on independent network requests (e.g., checking multiple URLs) artificially inflate total execution time.
**Action:** When validating multiple independent external resources, dispatch the requests concurrently and await them together using `Promise.all()` to minimize total latency.
