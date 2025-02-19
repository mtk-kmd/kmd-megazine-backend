const { logError } = require("../src/helper/logger");

exports.CustomError = class CustomError {
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
};

exports.errorHandler = async (error, req, res, next) => {
    logError(error);
    res.status(error.status ? error.status : 500).json({
        message: !error.message ? error : error.message,
    });
};
