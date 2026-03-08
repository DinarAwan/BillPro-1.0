export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

export const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getStatusColor = (status) => {
    const map = {
        DRAFT: 'badge-draft',
        SENT: 'badge-sent',
        PAID: 'badge-paid',
        OVERDUE: 'badge-overdue',
        CANCELED: 'badge-canceled',
    };
    return map[status] || 'badge-draft';
};
