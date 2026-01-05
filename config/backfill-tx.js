const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, '..', 'api') });
const connect = require('./connect');
const backfillTransactions = require('~/scripts/backfillTransactions');

(async () => {
    try {
        await connect();
        await backfillTransactions();
        console.log('Backfill script finished successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Backfill script failed:', error);
        process.exit(1);
    }
})();
