/* global process */
/* global console */
import { readFile } from "node:fs/promises";

const marker = "<!-- pr-ci-comment -->";
const playwrightResultsPath =
  process.env.PLAYWRIGHT_RESULTS_PATH || "test-results/playwright-results.json";
const testResultsPath = process.env.TEST_RESULTS_PATH || "unit-test-results/test-results.json";
const emptyStats = () => ({ passed: 0, failed: 0, skipped: 0, total: 0, failures: [] });

function iconFor(outcome) {
  if (outcome === "success" || outcome === "passed") return "\u2705";
  if (outcome === "failure" || outcome === "failed" || outcome === "timedOut") return "\u274c";
  if (outcome === "skipped" || outcome === "not configured") return "\u26aa";
  if (outcome === "cancelled" || outcome === "interrupted") return "\u26a0\ufe0f";
  return "\u2754";
}

function labelFor(outcome) {
  if (outcome === "success") return `${iconFor(outcome)} success`;
  if (outcome === "failure") return `${iconFor(outcome)} failure`;
  if (outcome === "skipped") return `${iconFor(outcome)} skipped`;
  if (outcome === "cancelled") return `${iconFor(outcome)} cancelled`;
  return `${iconFor(outcome)} ${outcome || "unknown"}`;
}

function details(summary, body) {
  return `<details>
<summary>${summary}</summary>

${body.trim() || "_No content._"}

</details>`;
}

function basename(path) {
  return String(path ?? "")
    .split(/[\\/]/)
    .pop();
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "";
  return `, ${Math.round(ms / 1000)}s`;
}

function firstErrorMessage(result) {
  const error = result?.error ?? result?.errors?.[0];
  if (!error) return "";
  return error.message || error.stack || String(error);
}

function isFailingStatus(status) {
  return status && status !== "passed" && status !== "success" && status !== "skipped";
}

const PlaywrightReport = {
  emptyMessage: "No failed Playwright test cases.",

  async read(path) {
    try {
      const report = JSON.parse(await readFile(path, "utf8"));
      const stats = emptyStats();
      this.walkSuites(report.suites, stats);
      return stats;
    } catch {
      return emptyStats();
    }
  },

  walkSuites(suites, stats, parts = []) {
    for (const suite of suites ?? []) {
      const nextParts = suite.title ? [...parts, suite.title] : parts;
      this.walkSuites(suite.suites, stats, nextParts);

      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          this.collectTest(stats, nextParts, spec, test);
        }
      }
    }
  },

  collectTest(stats, parts, spec, test) {
    const finalResult = this.finalRunnableResult(test);
    const status = finalResult?.status ?? "skipped";

    if (status === "skipped") {
      stats.skipped += 1;
      return;
    }

    stats.total += 1;
    if (status === "passed") {
      stats.passed += 1;
      return;
    }

    stats.failed += 1;
    stats.failures.push({
      title: [...parts, spec.title, test.projectName].filter(Boolean).join(" > "),
      status,
      retryCount: Math.max((test.results?.length ?? 1) - 1, 0),
      duration: finalResult?.duration ?? 0,
      error: firstErrorMessage(finalResult)
    });
  },

  finalRunnableResult(test) {
    const runnableResults = (test.results ?? []).filter((result) => result.status !== "skipped");
    return runnableResults.at(-1) ?? (test.results ?? []).at(-1) ?? null;
  },

  formatFailures(failures) {
    if (failures.length === 0) return this.emptyMessage;

    return failures
      .map((failure) => {
        const retryText = failure.retryCount > 0 ? `, retries: ${failure.retryCount}` : "";
        return `- ${iconFor(failure.status)} ${failure.title} (${failure.status}${retryText}${formatDuration(failure.duration)})`;
      })
      .join("\n\n");
  }
};

const VitestReport = {
  emptyMessage: "No failed test cases.",

  async read(path) {
    try {
      const report = JSON.parse(await readFile(path, "utf8"));
      const { numTotalTests: total = 0, numPassedTests: passed = 0 } = report;
      const failures = this.collectFailures(report);

      return { passed, failed: failures.length, skipped: 0, total, failures };
    } catch {
      return emptyStats();
    }
  },

  collectFailures(report) {
    const failures = [];

    for (const testResult of report.testResults ?? []) {
      const filename = basename(testResult.name);
      this.collectAssertionFailures(testResult.assertionResults, filename, failures);
      this.collectTaskFailures(
        testResult.tasks ?? testResult.children ?? testResult.testResults,
        filename,
        failures
      );
    }

    this.collectTaskFailures(report.tasks ?? report.children ?? report.files, "", failures);
    return failures;
  },

  collectAssertionFailures(assertionResults, filename, failures) {
    for (const assertion of assertionResults ?? []) {
      if (Array.isArray(assertion)) {
        this.collectAssertionFailures(assertion, filename, failures);
        continue;
      }

      if (!assertion || !isFailingStatus(assertion.status)) continue;

      failures.push({
        filename,
        title:
          assertion.fullName ||
          [...(assertion.ancestorTitles ?? []), assertion.title].filter(Boolean).join(" > "),
        status: assertion.status,
        duration: assertion.duration,
        error: this.assertionError(assertion)
      });
    }
  },

  collectTaskFailures(tasks, filename, failures, parts = []) {
    for (const task of tasks ?? []) {
      if (Array.isArray(task)) {
        this.collectTaskFailures(task, filename, failures, parts);
        continue;
      }

      if (!task || typeof task !== "object") continue;

      const title = this.taskName(task);
      const nextParts = title ? [...parts, title] : parts;
      const children = task.tasks ?? task.children ?? task.suites ?? task.tests;

      if (children) {
        this.collectTaskFailures(children, filename, failures, nextParts);
        continue;
      }

      const status = this.taskStatus(task);
      if (!isFailingStatus(status)) continue;

      failures.push({
        filename,
        title: nextParts.join(" > ") || title || filename,
        status,
        duration: task.result?.duration ?? task.duration,
        error: this.taskError(task)
      });
    }
  },

  assertionError(assertion) {
    return assertion.failureMessages?.[0] || assertion.message || firstErrorMessage(assertion);
  },

  taskName(task) {
    return task?.name || task?.title || task?.fullName || "";
  },

  taskStatus(task) {
    return task?.status || task?.result?.state || task?.result?.status;
  },

  taskError(task) {
    const error =
      task?.result?.errors?.[0] ?? task?.result?.error ?? task?.errors?.[0] ?? task?.error;
    if (!error) return "";
    return error.message || error.stack || String(error);
  },

  formatFailures(failures) {
    if (failures.length === 0) return this.emptyMessage;

    return failures
      .map(
        (failure) =>
          `- ${iconFor(failure.status)} ${failure.title} (${failure.filename}${formatDuration(failure.duration)})`
      )
      .join("\n\n");
  }
};

const build = labelFor(process.env.BUILD_OUTCOME);
const lint = labelFor(process.env.LINT_OUTCOME);
const test = labelFor(process.env.TEST_OUTCOME);
const prettier = labelFor(process.env.PRETTIER_OUTCOME);
const e2e = labelFor(process.env.E2E_OUTCOME);
const reportUrl = process.env.PLAYWRIGHT_REPORT_URL || process.env.RUN_URL || "";
const playwright = await PlaywrightReport.read(playwrightResultsPath);
const testResult = await VitestReport.read(testResultsPath);

const summary = [
  marker,
  "## PR CI Summary",
  "",
  "",
  "| Check | Status |",
  "| --- | --- |",
  `| Build | ${build} |`,
  `| Lint | ${lint} |`,
  `| Prettier | ${prettier} |`,
  `| Test | ${test} |`,
  `| E2E tests | ${e2e} |`,
  "",
  "",
  details(
    `Playwright failures (${playwright.failed})`,
    PlaywrightReport.formatFailures(playwright.failures)
  ),
  "",
  "",
  details(`Test failures (${testResult.failed})`, VitestReport.formatFailures(testResult.failures)),
  "",
  "",
  details(
    "Artifacts",
    [
      reportUrl ? `- [playwright-report](${reportUrl})` : "- playwright-report: not available",
      process.env.TEST_RESULTS_URL
        ? `- [test-results](${process.env.TEST_RESULTS_URL})`
        : "- test-results: not available",
      process.env.RUN_URL ? `- [workflow run](${process.env.RUN_URL})` : ""
    ]
      .filter(Boolean)
      .join("\n")
  ),
  ""
].join("\n");

console.log(summary);
