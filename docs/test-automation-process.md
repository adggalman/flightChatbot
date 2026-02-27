# Test Automation Process Guide

> For AD + AI internal reference. Covers the full lifecycle from Jira ticket to merged test running in CI.
>
> **For a QA-team-facing version (no AI tooling assumed), see** `docs/qa-guide.md` (KANBAN #38 — pending).

---

## Table of Contents
1. [Jira Structure](#1-jira-structure)
2. [E2E Automation Flow](#2-e2e-automation-flow)
3. [Branching Strategy](#3-branching-strategy)
4. [New Feature → MR → Merge](#4-new-feature--mr--merge)
5. [Jira Ticket Template](#5-jira-ticket-template)
6. [Where to See Results](#6-where-to-see-results)
7. [Post-Implementation Doc Updates](#7-post-implementation-doc-updates)

---

## 1. Jira Structure

Test automation work is organised into a 3-level hierarchy:

```
Epic: API Contracts Automation
  └── Task: <Endpoint Group>              ← maps to one feature file
        └── Subtask: <Scenario>           ← maps to one @tms Xray Test (AAR-XXXX)

Epic: Flows Automation
  └── Task: <Flow Name>                   ← maps to one feature file
        └── Subtask: <Scenario>           ← maps to one @tms Xray Test (AAR-XXXX)
```

**Example:**
```
Epic: Flows Automation
  └── Task: Happy Path Cash
        ├── Subtask → AAR-9687: STEP0 — Driver goes online
        ├── Subtask → AAR-9688: STEP0.5 — Driver updates location
        └── ... (21 scenarios total)
```

**Rules:**
- Task = feature file = assigned to one QA engineer per sprint
- Subtask = scenario = the existing Xray Test issue (link, don't recreate)
- Epic gives the lead a single rollup of automation coverage per type

---

## 2. E2E Automation Flow

### How a test run works

```
Trigger
  ↓
GitLab CI job starts
  ↓
Install deps (JDK + npm via JFrog)
  ↓
Create Xray Test Execution (GraphQL API) → writes TE key
  ↓
Run Cucumber tests (tag-filtered)
  ↓
cucumber-report.json + allure-results/ written
  ↓
Import results to Xray TE (always runs, even on test failure)
  ↓
Generate Allure report → upload as CI artifact
  ↓
Push Allure + summary.json to GCS → moveqa.airasia.com
```

### Trigger types

| Trigger | How | What runs |
|---------|-----|-----------|
| EOD Schedule | GitLab CI schedule (7pm daily) | `api_contracts_eod` or `flows_happy_path_eod` |
| Jira Automation | TE status → "EXECUTING" fires pipeline trigger | `regression_tests` with `LABELS` variable |
| Manual push | `git push` to `main` | `regression_tests` (tag-filtered) |

### Test types

| Type | Tag | Feature location | What it tests |
|------|-----|-----------------|---------------|
| API Contracts | `@api-contracts` | `src/features/api-contracts/` | Individual endpoints, stateless, isolated |
| Flows | `@happy-path-cash` | `src/features/flows/` | Full E2E booking journeys, stateful |

---

## 3. Branching Strategy

```
main (protected)
  ↑ MR only — no direct pushes
feature/AAR-XXXX-<short-desc>    ← all new test development here
```

**Why feature branches can't run full CI:**
`JFROG_NPM_CONFIG_B64` (npm registry auth) is only available on the protected `main` branch. Feature branch pipelines cannot install dependencies or hit staging. MR pipelines run lint/syntax checks only.

**Consequence:** tests are verified on the first EOD run after merge, not during MR. The MR review checklist (see step 4) is the quality gate.

---

## 4. New Feature → MR → Merge

### Step 1 — Pick up the ticket

A Jira task lands on QA. Before writing code, collect:

1. **The ticket** — acceptance criteria, what endpoint/flow is in scope
2. **The curl** — captured from **Chucker** (real app on staging) or **Postman**

The curl provides:
- Exact URL, method, and all required headers
- Request body shape
- Real response body → used to generate the JSON schema
- Status code → defines the passing assertion

> The curl is the ground truth. Never write a test by guessing the schema.

---

### Step 2 — Create branch

```bash
git checkout -b feature/AAR-XXXX-<short-desc>
# e.g. feature/AAR-9870-booking-details
```

---

### Step 3 — Classify the test

| Type | Criteria | Target location |
|------|----------|----------------|
| **API Contract** | Stateless — can run independently without prior booking state | `src/features/api-contracts/<driver\|passenger>/<name>.feature` |
| **Flow step** | Requires booking state chain (accept → arrived → complete) | `src/features/flows/happy-path/instant-cash.feature` |

---

### Step 4 — Implement

```
a. Add endpoint to src/const/apiSpec.js
b. Add response schema JSON to src/const/schema/RIDE/
c. Add custom step definitions to rideSteps.js  (only if common-lib can't handle it)
d. Write .feature file:
   - No @tms tag yet — sync script adds it automatically
   - Minimum 1 actor tag (@DRIVER or @PASSENGER) — required for sync routing
```

See `docs/ADD_NEW_FEATURE_GUIDE.md` for code examples and implementation details.

---

### Step 5 — Sync to Xray

```bash
node scripts/sync-feature.js src/features/api-contracts/driver/<file>.feature --covers=AAR-XXXX
```

`--covers` links each automation test as covering the corresponding manual Jira test.
Omit if no manual test exists. Pass comma-separated keys for 1:N granularization:

```bash
# 1 manual test → 3 automation tests
node scripts/sync-feature.js src/features/flows/happy-path/instant-cash.feature --covers=AAR-7098
```

The script:
1. Creates a Jira Test issue (type: Cucumber) in the correct Test Repository folder
2. Sets the Gherkin definition from the feature file
3. Writes `@tms=AAR-XXXX @AAR-XXXX` directly into the feature file
4. Adds the test to the correct test plan + plan subfolder
5. Updates the local `test-plans/*.json`
6. For existing scenarios: syncs updated Gherkin to Xray without creating a duplicate

Routing by file path:
- `api-contracts/driver/` → Repo `/Driver`, Plan 2707521, Folder `/API Contracts/Driver`
- `api-contracts/passenger/` → Repo `/Passenger`, Plan 2707521, Folder `/API Contracts/Passenger`
- `flows/happy-path/` → Plan 2736289, Folder `/Flows/Happy Path Cash`

> Always run this before committing. A feature file without `@tms` runs in CI but results are never imported to Xray — the TE will be blank.

---

### Step 6 — Update the conversion map

If this scenario converts a manual Xray test, update `context_docs/manual-to-automation-map.md`:

| Column | Value |
|--------|-------|
| Converted | `✅` |
| Feature File | Relative path |
| Granularized | `1:1` if one scenario, `1:N` if split into multiple |
| Automation Keys | New AAR key(s) from sync script output |

---

### Step 7 — Commit and push

Stage only the files you touched:
```bash
git add src/features/.../<file>.feature
git add src/const/apiSpec.js
git add src/const/schema/RIDE/<schema>.json
git add src/features/step-definitions/rideSteps.js   # if modified
git add test-plans/api-contracts.json                # updated by sync-feature.js

git commit -m "feat: AAR-XXXX add <endpoint> test"
git push origin feature/AAR-XXXX-<short-desc>
```

---

### Step 8 — Open MR

- **Target branch:** `main`
- **Title:** `AAR-XXXX — <what the test covers>`
- **Description:** link to Jira ticket, list @tms IDs added

---

### Step 9 — MR Review Checklist

| # | Check | What to look for |
|---|-------|-----------------|
| 1 | `@tms=AAR-XXXX` on every scenario | No scenario left unlinked |
| 2 | `@AAR-XXXX` mirror tag present | Required for Xray import mapping |
| 3 | Schema file included | New endpoint has `.json` in `src/const/schema/RIDE/` |
| 4 | No hardcoded credentials | No tokens, passwords, or secrets in any file |
| 5 | Step reuse | Custom steps only where common-lib cannot handle |
| 6 | Correct CI tag | `@api-contracts` or `@happy-path-cash` so CI picks it up |
| 7 | `test-plans/*.json` updated | `sync-feature.js` was run |
| 8 | No `@tms=AAR-PENDING` | Placeholder tags removed before merge |

---

### Step 10 — Merge and first run

Squash merge preferred — keeps `main` history clean (one commit per feature file).

Next EOD schedule (or manual trigger) picks up the new test automatically. Result appears in Xray TE and Allure report. If it fails: open a bug sub-task under the same Task, fix in a new branch, repeat.

---

### Granularization rules

Some manual tests are too broad for a single automated scenario. Split when:
- The manual test covers multiple distinct API calls (e.g. wallet exists + txn list + txn detail → 3 scenarios)
- Each split maps to a separate Jira test (`1:N`)
- Run `sync-feature.js` once — it creates one Jira test per scenario
- List all resulting automation keys in the conversion map

---

## 5. Jira Ticket Template

**Issue type:** Task (or sub-task under the feature story)

**Summary:**
```
[TA] AAR-XXXX — <Actor> <Action> — <Method> <Endpoint>
```
Example: `[TA] AAR-9865 — Driver clear location status on logout — DELETE /location/api/v1`

**Description:**
```
## What to test
<One line summary>

## Endpoint
- Method:
- URL:
- Service:
- Type: [ ] api-contracts   [ ] flows

## Curl (from Chucker / Postman)
<Paste full request — method, URL, headers, body>

## Response
- Status:
- Body: <Paste actual response body>

## Acceptance criteria
- [ ] Response status is <expected>
- [ ] Response body matches schema
- [ ] <business logic assertions>

## Links
- Manual test (if exists): AAR-XXXX   ← used for --covers in sync-feature.js
- Feature story: AAR-XXXX
```

**Labels:** `test-automation` + `api-contracts` or `flows`

---

## 6. Where to See Results

| Where | What | Who uses it |
|-------|------|-------------|
| **Xray TE in Jira** | Per-test PASS/FAIL linked to manual cases | QA lead, dev team |
| **Allure report** | Visual breakdown, step-by-step, attachments | QA engineer debugging |
| **moveqa.airasia.com** | Cross-project dashboard, trend over time | Manager, QA lead |
| **GitLab CI job** | Raw logs + artifacts | QA engineer debugging |
| `node scripts/get-ci-results.js <job-id>` | Quick CLI pass/fail summary with error excerpt | QA engineer |
| `node scripts/get-ci-results.js trace <job-id>` | Filtered CI log (errors, status codes) | QA engineer |

---

## 7. Post-Implementation Doc Updates

After completing any implementation (new test, bug fix, refactor, or tooling change), update docs in this order.

### 7.1 Always

| # | Doc | What to update |
|---|-----|----------------|
| 1 | `context_docs/KANBAN.md` | Move completed items to Done. Append `[CL/AD/GM date]` to Notes. Update "Last updated" timestamp. |
| 2 | `memory/MEMORY.md` | Update CI scenario counts, new patterns, key facts for next session. Remove stale TODOs. |
| 3 | `context_docs/CLAUDE.md` | Update flow tables (@tms tags, manual link status). Update implementation status checklists. |

### 7.2 When a manual test was converted

| # | Doc | What to update |
|---|-----|----------------|
| 4 | `context_docs/manual-to-automation-map.md` | Mark row ✅. Fill Converted, Feature File, Granularized, Automation Keys. |

### 7.3 When Gemini has follow-up work

| # | Doc | What to update |
|---|-----|----------------|
| 5 | `context_docs/HANDOFF_TO_GEMINI.md` | Add new "Current Status" section at top with scenario counts, new scripts, pending tasks. Old session notes stay as history — do not delete. |

### 7.4 When the process or tooling changed

| # | Doc | What to update |
|---|-----|----------------|
| 6 | `context_docs/test-automation-process.md` | Update if CI flow, trigger types, scenario counts in examples changed. |
| 7 | `docs/ADD_NEW_FEATURE_GUIDE.md` | Update if file structure, step patterns, or implementation steps changed. |
| 8 | `docs/confluence_doc_draft.md` | Edit draft to reflect process changes, then push: `node scripts/update-confluence.js` |

### Scenario count reference

Always keep these in sync across MEMORY.md, CLAUDE.md, and HANDOFF_TO_GEMINI.md:

| Metric | Source of truth |
|--------|----------------|
| api-contracts CI count | Count `@api-contracts` tagged scenarios in `src/features/api-contracts/**/*.feature` |
| flows-happy-path-cash count | Count scenarios in `src/features/flows/happy-path/instant-cash.feature` |
| Total unique Xray tests | api-contracts + flows − shared scenarios (currently 8 shared: AAR-9687, 9688, 9695, 9615, 9614, 9613, 9625, 9838) |

### Quick command reference

| Task | Command |
|------|---------|
| Sync new/existing feature to Xray | `node scripts/sync-feature.js src/features/.../<file>.feature [--covers=AAR-XXXX]` |
| Backfill manual link for existing test | `node scripts/api-query.js link-tests AAR-XXXX AAR-9687 AAR-9836` |
| Lookup issueId | `node scripts/api-query.js jira-issue <KEY>` |
| List plan tests | `node scripts/api-query.js xray-tests 2707521 "/API Contracts/Driver"` |
| Search Jira | `node scripts/api-query.js jira-search "project=AAR AND summary ~ \"keyword\""` |
| Introspect Xray GraphQL schema | `node scripts/api-query.js xray-introspect <TypeName>` |
