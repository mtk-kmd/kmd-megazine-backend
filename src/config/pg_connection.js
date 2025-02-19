const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: "mtk246",
    host: "100.109.254.2",
    database: "university_megazine",
    password: "mtkMTK123",
    port: "5432",
});

const query = (sql, values) => {
    const pool = new Pool({
        user: "mtk246",
        host: "100.109.254.2",
        database: "university_megazine",
        password: "mtkMTK123",
        port: "5432",
    });

    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.rows);
            }
        });
    });
};

exports.pool = pool;
exports.query = query;
