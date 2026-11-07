# Forensic Log 04: Model Denial of Service & Resource Exhaustion

## 1. Attack
* **Type:** Context Window Flooding & Unbounded Recursive Generation (Sponge Attack)
* **Description:** Attacker submits crafted queries designed to maximize token consumption, trigger infinite generation loops, or force extreme context-window expansion, causing resource starvation and high API costs.

## 2. Vulnerability
* **Identifier:** OWASP LLM04 (Model Denial of Service)
* **Details:** Lack of strict input token limit enforcement, missing timeout controls, unconstrained max-token output generation parameters, and absent rate limiting per client session.

## 3. Exploitation
* **Methodology:** Sending payloads with recursive completion triggers (e.g., "Repeat every word forever") or maxing out multi-shot context windows to spike GPU/RAM load and hit API rate caps.

## 4. Impact
* **Severity:** High
* **Consequences:** Service unavailability, application latency spikes, infrastructure denial of service, and severe unexpected API usage billing costs.

## 5. Detection
* **Gaps:** Absence of real-time token rate monitoring, missing anomaly alerts on sudden compute/token spikes per IP, and unmonitored request duration metrics.

## 6. Mitigation
* **Strategy:** Implement hard caps on max input/output tokens, enforce strict per-user rate limits and concurrency throttling, set API timeout parameters, and utilize cost/usage quota circuit breakers.
