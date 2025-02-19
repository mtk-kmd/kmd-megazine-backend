exports.EnvConfig = {
    DB_HOST: "DB_HOST",
    DB_PORT: "DB_PORT",
    DB_NAME: "DB_NAME",
    DB_USER: "DB_USER",
    DB_PASS: "DB_PASS",
    SERVER_ENV: "SERVER_ENV",
    SERVER_PORT: "SERVER_PORT",
    JWT_KEY: "JWT_KEY",
    BASE_URL: "BASE_URL",
  
    get: (v, d) => {
        const tmp = process.env[v];
        if (tmp == null || tmp == "" || !tmp) return d;
        return tmp;
    },
};
  