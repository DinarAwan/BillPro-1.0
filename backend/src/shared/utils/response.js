const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        status: 'success',
        message,
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

const sendPaginated = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        status: 'success',
        message,
        data,
        pagination,
    });
};

module.exports = { sendSuccess, sendPaginated };
