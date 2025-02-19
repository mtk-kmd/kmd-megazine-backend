var winston = require("winston"),
expressWinston = require("express-winston");

const middleware = expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.cli()
    ),
    //headerBlacklist: ["accept","cache-control","sec-ch-ua","ua","if-none-match"],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    //msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
});

exports.log_middleware = middleware;
