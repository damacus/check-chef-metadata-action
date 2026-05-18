## 2024-03-16 - [Queue Processing Optimization]
**Learning:** `queue.shift()` inside a `while` loop has O(N^2) complexity because V8 has to shift every array element down. For operations doing parallel work processing (like `runInParallel`), indexing `items[currentIndex++]` performs orders of magnitude faster (O(N)).
**Action:** When popping items from the front of an array in a loop, avoid `shift()`. Use a separate index counter instead, especially for queues that might grow large.

## 2024-05-18 - Avoid Redundant Async Calls in High-Frequency Paths
**Learning:** In `src/reportPR.ts`, a small helper function `commentGeneralOptions` was returning a `Promise<Issue>` even though its internal operations (`github.context` access and `core.getInput`) are purely synchronous. Because this function was being awaited multiple times within the `reportPR` function (which can be called frequently), it introduced unnecessary micro-task overhead. Furthermore, its execution was unnecessarily repeated when a simple variable assignment to cache its return value would suffice.
**Action:** Always verify if a function genuinely needs to be `async`. If all its operations are synchronous, remove `async` to reduce overhead. Cache the result in a variable and reuse it within the scope to avoid repetitive execution and allocations.
