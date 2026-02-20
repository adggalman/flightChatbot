const { BeforeAll, AfterAll, Before, After } = require('@cucumber/cucumber');

// Session state — shared across steps in a flow
global.sessionState = {};

BeforeAll(async () => {
    console.log('Test suite starting...');
});

AfterAll(async () => {
    console.log('Test suite complete.');
    global.sessionState = {};
});

Before(async (scenario) => {
    console.log(`Starting: ${scenario.pickle.name}`);
});

After(async (scenario) => {
    if (scenario.result.status === 'FAILED') {
        console.log(`FAILED: ${scenario.pickle.name}`);
    }
});