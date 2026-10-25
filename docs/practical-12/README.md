# Practical 12: CI/CD Pipeline with GitHub Actions — Evidence & Documentation

This directory contains the required submission evidence for Practical 12: **CI/CD Pipeline with GitHub Actions**.

---

## Required Screenshot Evidence Checklist

| File Name | Purpose | How & Where to Capture | Status |
| :--- | :--- | :--- | :---: |
| **`01_ci_workflow_success.png`** | Verify successful remote execution of the GitHub Actions CI workflow on push to `main`. | Navigate to [Workflow Run #40182257498](https://github.com/Aayushh910/My-Portfolio/actions/runs/40182257498) (or latest passing run). Capture the green checkmark with the `build-and-test` job and passing test steps. | ⏳ To be added |
| **`02_ci_workflow_failure.png`** | Verify deterministic CI pipeline failure caused by the deliberately broken assertion (`expect(201)`). | Navigate to GitHub Actions > Failed Workflow run. Capture the red cross with `Run automated tests` step expanded showing the Jest assertion failure. | ⏳ To be captured in Phase 4 |
| **`03_test_results.png`** | Document local test execution showing both automated test cases passing. | Capture your PowerShell terminal output running `npm test` inside `Task-Manager/backend`, showing `PASS tests/tasks.test.js` with 2 passed tests. | ⏳ To be added |
| **`04_workflow_configuration.png`** | Document the committed `.github/workflows/ci.yml` pipeline specification. | Capture `.github/workflows/ci.yml` open in your code editor or in GitHub repository file view. | ⏳ To be added |

---

## Workflow Details

- **Workflow File**: `.github/workflows/ci.yml`
- **Target Repository**: `Aayushh910/My-Portfolio`
- **Branch Trigger**: `push` on `main`
- **Runner Environment**: `ubuntu-latest`
- **Runtime**: Node.js 18 (`actions/setup-node@v4`)
- **Working Directory**: `Task-Manager/backend`
- **Test Runner**: Jest (`--experimental-vm-modules --runInBand --forceExit`) with Supertest
