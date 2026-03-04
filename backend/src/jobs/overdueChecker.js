const cron = require('node-cron');
const invoiceService = require('../modules/invoice/invoice.service');

const startCronJobs = () => {
    // Check for overdue invoices every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('[CRON] Checking for overdue invoices...');
            const count = await invoiceService.processOverdueInvoices();
            console.log(`[CRON] Processed ${count} overdue invoices.`);
        } catch (error) {
            console.error('[CRON] Error processing overdue invoices:', error.message);
        }
    });

    console.log('[CRON] Scheduled: Overdue invoice check at midnight daily');
};

module.exports = startCronJobs;
