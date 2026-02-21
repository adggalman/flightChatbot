const { BeforeAll, AfterAll, Before, After } = require('@cucumber/cucumber');

global.sessionState = {};

BeforeAll(async () => {
    console.log('Test suite starting...');
});

AfterAll(async () => {
    console.log('Test suite complete.');
    global.sessionState = {};
});

Before(async function (scenario) {
    console.log(`Starting: ${scenario.pickle.name}`);
});

After(async function (scenario) {
    if (scenario.result.status === 'FAILED') {
        console.log(`FAILED: ${scenario.pickle.name}`);
    }
});
