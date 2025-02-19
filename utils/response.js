const response = (res, queryData, obj, filterProductsDefaultValues) => {
    if (queryData) {
        return res.status(200).json({
            message: "Success",
            result: queryData,
            obj,
            filterProductsDefaultValues,
        });
    } else {
        return res.status(404).json({
            message: "Database query error",
        });
    }
};

const error_response = (res, error) => {
    return res.status(400).json({
        message: error,
    });
};

exports.response = response;
exports.error_response = error_response;
