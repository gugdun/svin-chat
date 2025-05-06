// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const pgp = require('pg-promise')();
const db = pgp(process.env.POSTGRES_CONNECTION);
db.none("CREATE TABLE IF NOT EXISTS users ( id SERIAL PRIMARY KEY, username TEXT UNIQUE, hashed_password BYTEA, salt BYTEA )");
module.exports = db;
