// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const pgp = require('pg-promise')();
const db = pgp(process.env.POSTGRES_CONNECTION);
(async () => {
    await db.none("CREATE TABLE IF NOT EXISTS users ( id SERIAL PRIMARY KEY, username TEXT UNIQUE, hashed_password BYTEA, salt BYTEA )");
    await db.none("CREATE TABLE IF NOT EXISTS chats ( id SERIAL PRIMARY KEY, user1_id INTEGER, user2_id INTEGER, CONSTRAINT user1_fk FOREIGN KEY (user1_id) REFERENCES users (id), CONSTRAINT user2_fk FOREIGN KEY (user2_id) REFERENCES users (id) )")
    await db.none("CREATE TABLE IF NOT EXISTS attachments ( id SERIAL PRIMARY KEY, type TEXT NOT NULL, data BYTEA ) ")
    await db.none("CREATE TABLE IF NOT EXISTS messages ( id SERIAL PRIMARY KEY, chat_id INTEGER, user_id INTEGER, attachment_id INTEGER, text TEXT, timestamp TIMESTAMP, CONSTRAINT chat_fk FOREIGN KEY (chat_id) REFERENCES chats (id), CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users (id), CONSTRAINT attachment_fk FOREIGN KEY (attachment_id) REFERENCES attachments (id) )")
})();
module.exports = db;
