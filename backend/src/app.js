const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { FRONTEND_URL } = require('./config/env');
const errorHandler = require('./shared/middleware/errorHandler');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const organizationRoutes = require('./modules/organization/organization.routes');
const clientRoutes = require('./modules/client/client.routes');
const invoiceRoutes = require('./modules/invoice/invoice.routes');
const subscriptionRoutes = require('./modules/subscription/subscription.routes');
const paymentRoutes = require('./modules/payment/payment.routes');

const app = express();

// ─── Global Middleware ──────────────────────────────────
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'BillPro API is running',
        timestamp: new Date().toISOString(),
    });
});

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/organizations/:orgId/clients', clientRoutes);
app.use('/api/organizations/:orgId/invoices', invoiceRoutes);
app.use('/api/organizations/:orgId/invoices', paymentRoutes);
app.use('/api/organizations/:orgId/subscription', subscriptionRoutes);

// ─── 404 Handler ────────────────────────────────────────
app.all('/{*any}', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`,
    });
});

// ─── Global Error Handler ───────────────────────────────
app.use(errorHandler);

module.exports = app;
