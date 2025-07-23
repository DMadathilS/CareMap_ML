# Gitleaks Usage Guide

## 1. Scan the Project with Custom Rules

```bash
.\gitleaks.exe detect --source . --config .gitleaks.toml
```

```bash

.\gitleaks.exe detect --source . --config .gitleaks.toml --verbose
```

```bash

.\gitleaks.exe detect --source . --config .gitleaks.toml --report-format json --report-path gitleaks-report.json
```
