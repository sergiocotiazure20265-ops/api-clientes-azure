const sql = require("mssql");

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || "localhost",
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_DATABASE || "ClientesDB",

    options: {
        encrypt: true,
        trustServerCertificate: true
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },

    connectionTimeout: 15000,
    requestTimeout: 15000
};

let poolPromise = null;

async function getConnection() {

    if (!poolPromise) {

        const pool = new sql.ConnectionPool(config);

        poolPromise = pool.connect()
            .then(conexao => {

                console.log("Conectado ao SQL Server com sucesso.");

                return conexao;
            })
            .catch(error => {

                poolPromise = null;

                throw error;
            });
    }

    return poolPromise;
}

module.exports = {
    sql,
    getConnection
};