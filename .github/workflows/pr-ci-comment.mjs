/* global process */
/* global console */
import {readFile} from 'node:fs/promises';

const marker = '<!-- pr-ci-comment -->';
const playwrightResultsPath = process.env.PLAYWRIGHT_RESULTS_PATH || 'test-results/playwright-results.json';
const testResultsPath = process.env.TEST_RESULTS_PATH || 'test-results/test-results.json';

function iconFor(outcome) {
  if (outcome === 'success' || outcome === 'passed') return '\u2705';
  if (outcome === 'failure' || outcome === 'failed' || outcome === 'timedOut') return '\u274c';
  if (outcome === 'skipped' || outcome === 'not configured') return '\u26aa';
  if (outcome === 'cancelled' || outcome === 'interrupted') return '\u26a0\ufe0f';
  return '\u2754';
}

function labelFor(outcome) {
  if (outcome === 'success') return `${iconFor(outcome)} success`;
  if (outcome === 'failure') return `${iconFor(outcome)} failure`;
  if (outcome === 'skipped') return `${iconFor(outcome)} skipped`;
  if (outcome === 'cancelled') return `${iconFor(outcome)} cancelled`;
  return `${iconFor(outcome)} ${outcome || 'unknown'}`;
}

function details(summary, body) {
  return `<details>
<summary>${summary}</summary>

${body.trim() || '_No content._'}

</details>`;
}

function testTitle(parts, spec, test) {
  return [...parts, spec.title, test.projectName].filter(Boolean).join(' > ');
}

function finalRunnableResult(test) {
  const runnableResults = (test.results ?? []).filter((result) => result.status !== 'skipped');
  return runnableResults.at(-1) ?? (test.results ?? []).at(-1) ?? null;
}

function firstErrorMessage(result) {
  const error = result?.error ?? result?.errors?.[0];
  if (!error) return '';
  return error.message || error.stack || String(error);
}

function walkSuites(suites, stats, parts = []) {
  for (const suite of suites ?? []) {
    const nextParts = suite.title ? [...parts, suite.title] : parts;
    walkSuites(suite.suites, stats, nextParts);

    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const finalResult = finalRunnableResult(test);
        const status = finalResult?.status ?? 'skipped';

        if (status === 'skipped') {
          stats.skipped += 1;
          continue;
        }

        stats.total += 1;
        if (status === 'passed') {
          stats.passed += 1;
          continue;
        }

        stats.failed += 1;
        stats.failures.push({
          title: testTitle(nextParts, spec, test),
          status,
          retryCount: Math.max((test.results?.length ?? 1) - 1, 0),
          duration: finalResult?.duration ?? 0,
          error: firstErrorMessage(finalResult),
        });
      }
    }
  }
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '';
  return `, ${Math.round(ms / 1000)}s`;
}

function formatFailures(failures) {
  if (failures.length === 0) return 'No failed Playwright test cases.';

  return failures
    .map((failure) => {
      const retryText = failure.retryCount > 0 ? `, retries: ${failure.retryCount}` : '';
      const header = `- ${iconFor(failure.status)} ${failure.title} (${failure.status}${retryText}${formatDuration(failure.duration)})`;
      if (!failure.error) return header;
      return `${header}\n\n  \`\`\`text\n${failure.error}\n  \`\`\``;
    })
    .join('\n\n');
}

async function readPlaywrightStats() {
  try {
    const raw = await readFile(playwrightResultsPath, 'utf8');
    const report = JSON.parse(raw);
    const stats = { passed: 0, failed: 0, skipped: 0, total: 0, failures: [] };
    walkSuites(report.suites, stats);
    return stats;
  } catch {
    return { passed: 0, failed: 0, skipped: 0, total: 0, failures: [] };
  }
}

async function readTestStats() {
  try {
    const raw = await readFile(testResultsPath, 'utf8');
    const report = JSON.parse(raw);
    const {numFailedTestSuites: failed, numTotalTests:total,numPassedTests:passed} = report;
    return {passed: passed, failed, skipped: 0, total, failures: []};
  } catch {
    return { passed: 0, failed: 0, skipped: 0, total: 0, failures: [] };
  }
}

const build = labelFor(process.env.BUILD_OUTCOME);
const lint = labelFor(process.env.LINT_OUTCOME);
const test = labelFor(process.env.TEST_OUTCOME);
const e2e = labelFor(process.env.E2E_OUTCOME);
const reportUrl = process.env.PLAYWRIGHT_REPORT_URL || process.env.RUN_URL || '';
const playwright = await readPlaywrightStats();
const testResult = await readTestStats();

const summary = [
  marker,
  '## PR CI',
  '',
  '',
  '| Check | Status |',
  '| --- | --- |',
  `| Build | ${build} |`,
  `| Lint | ${lint} |`,
  `| test | ${test} |`,
  `| E2E tests | ${e2e} |`,
  '',
  '',
  details(
    `Playwright failures (${playwright.failed})`,
    formatFailures(playwright.failures),
  ),
  '',
  '',
  details(
      `Test failures (${testResult.failed})`,
      formatFailures(testResult.failures),
  ),
  '',
  '',
  details(
    'Artifacts',
    [
      reportUrl ? `- [playwright-report](${reportUrl})` : '- playwright-report: not available',
      process.env.TEST_RESULTS_URL ? `- [test-results](${process.env.TEST_RESULTS_URL})` : '- test-results: not available',
      process.env.RUN_URL ? `- [workflow run](${process.env.RUN_URL})` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  ),
  '',
].join('\n');

console.log(summary);