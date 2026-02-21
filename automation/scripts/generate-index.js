require('dotenv').config();
  const fs = require('fs');
  const path = require('path');

  const GH_PAGES_DIR = path.join(__dirname, '../../gh-pages');
  const ALLURE_REPORT_DIR = path.join(__dirname, '../reports/allure/allure-report');
  const CUCUMBER_REPORT = path.join(__dirname, '../reports/cucumber-report.json');

  // Read existing runs from gh-pages
  const runsFile = path.join(GH_PAGES_DIR, 'runs.json');
  const runs = fs.existsSync(runsFile)
    ? JSON.parse(fs.readFileSync(runsFile, 'utf8'))
    : [];

  // Determine pass/fail from cucumber report
  const report = JSON.parse(fs.readFileSync(CUCUMBER_REPORT, 'utf8'));
  const allPassed = report.every(f =>
    f.elements.every(s =>
      s.steps.filter(step => step.keyword !== 'Before ' && step.keyword !== 'After ').every(step =>
  step.result.status === 'passed')
    )
  );

  // Build run entry
  const runNumber = process.env.GITHUB_RUN_NUMBER || 'local';
  const runId = process.env.GITHUB_RUN_ID || '';
  const trigger = process.env.GITHUB_EVENT_NAME || 'local';
  const linearLabel = process.env.CREATE_LINEAR_TICKETS === 'true'
    ? `ci-#${runNumber}`
    : '-';

  runs.unshift({
    run: runNumber,
    runId,
    date: new Date().toISOString(),
    trigger,
    status: allPassed ? 'pass' : 'fail',
    linear: linearLabel,
  });

  // Write updated runs.json into allure-report (gets deployed)
  fs.writeFileSync(
    path.join(ALLURE_REPORT_DIR, 'runs.json'),
    JSON.stringify(runs, null, 2)
  );

  // Generate runs.html
  const rows = runs.map(r => {
    const date = new Date(r.date).toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' });
    const runLink = r.runId
      ? `<a href="https://github.com/adggalman/flightChatbot/actions/runs/${r.runId}"
  target="_blank">#${r.run}</a>`
      : `#${r.run}`;
    const reportLink = `<a href="reports/ci-${r.run}/index.html" target="_blank">View Report</a>`;
    const status = r.status === 'pass' ? '✅' : '❌';
    const linear = r.linear !== '-'
      ? `<span>${r.linear}</span>`
      : '-';

    return `<tr class="${r.status}">
      <td>${runLink}</td>
      <td>${date}</td>
      <td>${r.trigger}</td>
      <td>${status}</td>
      <td>${linear}</td>
      <td>${reportLink}</td>
    </tr>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Flight Chatbot - Test Reports</title>
    <style>
      body { font-family: sans-serif; margin: 40px; color: #1a1a1a; }
      h1 { font-size: 1.6rem; margin-bottom: 8px; }
      .latest { margin-bottom: 32px; }
      .btn { background: #22c55e; color: white; padding: 10px 20px;
             text-decoration: none; border-radius: 4px; font-weight: bold; }
      table { border-collapse: collapse; width: 100%; margin-top: 16px; }
      th, td { padding: 10px 14px; border: 1px solid #e5e7eb; text-align: left; font-size: 0.9rem; }
      th { background: #f9fafb; font-weight: 600; }
      tr.pass { background: #f0fdf4; }
      tr.fail { background: #fff1f2; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    <h1>Flight Booking Automation - Test Reports</h1>

    <div class="latest">
      <a class="btn" href="index.html">View Latest Allure Report</a>
      <p style="margin-top:8px; color:#6b7280; font-size:0.85rem;">
        Most recent run deployed to GitHub Pages.
      </p>
    </div>

    <h2>Historical Runs</h2>
    <p style="color:#6b7280; font-size:0.85rem;">Individual reports stored per run.</p>
    <table>
      <thead>
        <tr>
          <th>Run</th>
          <th>Date-Time (MYT)</th>
          <th>Trigger</th>
          <th>Status</th>
          <th>Linear</th>
          <th>Report</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
  </html>`;

  fs.writeFileSync(path.join(ALLURE_REPORT_DIR, 'runs.html'), html);
  console.log(`Run #${runNumber} added. Total runs: ${runs.length}`);