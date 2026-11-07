# Forensic Log 03: Training Data Poisoning & Model Supply Chain Vulnerabilities

## 1. Attack
* **Type:** Backdoor Data Poisoning & Compromised Model Weights
* **Description:** Insertion of trigger-conditioned malicious samples into training/fine-tuning datasets, forcing the model to produce targeted false outputs or bypass safety filters upon encountering a specific keyword or token.

## 2. Vulnerability
* **Identifier:** OWASP LLM03 (Training Data Poisoning) & OWASP LLM05 (Supply Chain Vulnerabilities)
* **Details:** Reliance on unverified public datasets and third-party model hubs without cryptographic signature verification, data integrity audits, or provenance tracking.

## 3. Exploitation
* **Methodology:** Data poisoning via public web scraping scraping (e.g., embedding secret trigger phrases mapped to malicious output behaviors) and distributing backdoored model artifacts on open model hubs.

## 4. Impact
* **Severity:** High
* **Consequences:** Permanent bias/corruption of model responses, selective safety-guardrail bypasses, loss of model trustworthiness, and credential compromise via poisoned tool outputs.

## 5. Detection
* **Gaps:** Lack of cryptographic hash checking (SHA-256) on dataset/weight downloads, missing statistical anomaly detection in training data distributions, and absence of red-team backdoor testing post-fine-tuning.

## 6. Mitigation
* **Strategy:** Enforce cryptographic signature verification (Signstore/GPG) for model weights, implement data lineage tracking (DVC), perform automated anomaly detection on fine-tuning pairs, and audit third-party dependencies against trusted registries.
