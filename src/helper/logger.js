const { EnvConfig } = require("../config/env_config");

exports.logDev = (v) => {
    if (EnvConfig.get(EnvConfig.SERVER_ENV, "dev") == "dev") {
        console.log(`[DEBUG]: ${v}`);
    }
};
exports.logError = (v) => {
    console.log(`[ERROR]: ${v}`);
};
exports.logInfo = (v) => {
    console.log(`[INFO]: ${v}`);
};
