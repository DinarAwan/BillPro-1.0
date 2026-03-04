const app = require('./app');
const { PORT } = require('./config/env');
const startCronJobs = require('./jobs/overdueChecker');

const start = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`\n🚀 BillPro API running at http://localhost:${PORT}`);
            console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);

            // Start cron jobs
            startCronJobs();
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();
