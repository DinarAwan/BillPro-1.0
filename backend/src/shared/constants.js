const SUBSCRIPTION_LIMITS = {
    FREE: {
        invoiceLimit: 20,
        userLimit: 3,
    },
    PRO: {
        invoiceLimit: -1, // unlimited
        userLimit: 5,
    },
    BUSINESS: {
        invoiceLimit: -1, // unlimited
        userLimit: -1,    // unlimited
    },
};

const INVOICE_STATUSES = {
    DRAFT: 'DRAFT',
    SENT: 'SENT',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELED: 'CANCELED',
};

const ROLES = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    STAFF: 'STAFF',
};

module.exports = { SUBSCRIPTION_LIMITS, INVOICE_STATUSES, ROLES };
