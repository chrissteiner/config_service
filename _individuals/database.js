// Zugriffsdaten aus Umgebungsvariablen (.env) – siehe .env.example

module.exports.database_credits = {
    connectionLimit: parseInt(process.env.SQLDB_CONNECTION_LIMIT || '10', 10),
    host: process.env.SQLDB_HOST || 'localhost',
    user: process.env.SQLDB_USER || 'root',
    database: process.env.SQLDB_DATABASE || '',
    password: process.env.SQLDB_PASSWORD || '',
    port: parseInt(process.env.SQLDB_PORT || '3306', 10)
};

module.exports.mongodb = {
    connectionString: process.env.MONGODB_URI || '',
    database: process.env.MONGODB_DATABASE || 'db_chrizly_buero',
    collection_config: process.env.MONGODB_COLLECTION_CONFIG || 'iot_config'
};
