const mongoose = require('mongoose');
const { Transaction, Conversation } = require('../db/models');
const logger = require('../config/winston');

async function backfillTransactions() {
    logger.info('Starting transaction backfill...');

    // Find transactions without endpoint
    const txs = await Transaction.find({ endpoint: { $exists: false } }).limit(1000);
    logger.info(`Found ${txs.length} transactions to backfill.`);

    if (txs.length === 0) return;

    for (const tx of txs) {
        if (tx.conversationId) {
            // Try to find endpoint from conversation
            const convo = await Conversation.findOne({ conversationId: tx.conversationId }).select('endpoint').lean();
            if (convo && convo.endpoint) {
                await Transaction.updateOne({ _id: tx._id }, { $set: { endpoint: convo.endpoint } });
                continue;
            }
        }

        // If still no endpoint, maybe guess from model?
        // This is low confidence so we might just leave it null or set to 'unknown'
        await Transaction.updateOne({ _id: tx._id }, { $set: { endpoint: 'unknown' } });
    }

    logger.info('Backfill batch completed.');
}

module.exports = backfillTransactions;
