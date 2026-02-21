require('dotenv').config();
  const fs = require('fs');
  const path = require('path');
  const { createLabel, createIssue, updateIssueStatus } = require('../src/helpers/linearHelper');

  const ALLURE_RESULTS_DIR = path.join(__dirname, '../reports/allure/allure-results');
  const CUCUMBER_REPORT = path.join(__dirname, '../reports/cucumber-report.json');

  const run = async () => {
    if (!fs.existsSync(CUCUMBER_REPORT)) {
      console.error('cucumber-report.json not found');
      process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(CUCUMBER_REPORT, 'utf8'));

    // Create run label
    const runId = process.env.GITHUB_RUN_NUMBER
      ? `ci-#${process.env.GITHUB_RUN_NUMBER}`
      : `local-${new Date().toISOString().slice(0, 16).replace('T', '-')}`;

    console.log(`Creating Linear label: ${runId}`);
    const label = await createLabel(runId);

    // Process each scenario
    for (const feature of report) {
      for (const scenario of feature.elements) {
        const passed = scenario.steps.every(s => s.result.status === 'passed');
        const steps = scenario.steps.filter(s => s.name).map(s => `- ${s.name}`).join('\n');
        const description = `**Run:** ${runId}\n\n**Feature:**
  ${feature.name}\n\n**Steps:**\n${steps}\n\n**Report:** https://adggalman.github.io/flightChatbot/`;

        console.log(`Creating ticket: ${scenario.name}`);
        const issue = await createIssue(scenario.name, description, label.id);
        console.log(`Created: ${issue.identifier}`);

        await updateIssueStatus(issue.id, passed);
        console.log(`Status updated: ${passed ? 'Done' : 'Cancelled'}`);

        // Patch allure result file with Linear issue link
        const allureFiles = fs.readdirSync(ALLURE_RESULTS_DIR)
          .filter(f => f.endsWith('-result.json'));

        for (const file of allureFiles) {
          const filePath = path.join(ALLURE_RESULTS_DIR, file);
          const result = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (result.name === scenario.name) {
            result.links = result.links || [];
            result.links.push({
              name: issue.identifier,
              url: `https://linear.app/team/issue/${issue.identifier}`,
              type: 'issue'
            });
            fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
            console.log(`Allure result patched: ${file}`);
          }
        }
      }
    }

    console.log('Done.');
  };

  run().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });