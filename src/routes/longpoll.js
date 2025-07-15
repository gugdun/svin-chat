// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const express = require("express");
const db = require("../db");
const { decrypt } = require("../util/crypto");

const router = express.Router();

router.post("/poll/:id", async (req, res) => {
    if (!req.user) {
        return res.redirect("/login");
    }

    const POLLING_TIMEOUT_MS = 30000;
    const POLLING_INTERVAL_MS = 250;

    let isFinished = false;
    const startTime = Date.now();

    // Прерывание при разрыве соединения клиентом
    req.on("close", () => {
        isFinished = true;
    });

    try {
        const chat = await db.one("SELECT user1_id, user2_id FROM chats WHERE id = $1", [ req.params.id ]);

        // Проверка доступа пользователя к чату
        if (chat.user1_id !== req.user.id && chat.user2_id !== req.user.id) {
            return res.status(403).json({ success: false, error: "Access denied" });
        }

        async function pollLoop() {
            if (isFinished || res.writableEnded) return;

            try {
                const messages = await db.any(`
                    SELECT username, attachment_id, text, timestamp
                    FROM messages
                    JOIN users ON users.id = user_id
                    WHERE chat_id = $1 AND timestamp > $2
                    ORDER BY messages.timestamp ASC
                `, [ req.params.id, req.body.timestamp ]);

                if (messages.length > 0) {
                    isFinished = true;
                    return res.json({
                        messages: messages.map(message => ({
                            username: message.username,
                            text: decrypt(message.text),
                            datetime: message.timestamp,
                            attachment: message.attachment_id
                        }))
                    });
                }

                if (Date.now() - startTime > POLLING_TIMEOUT_MS) {
                    isFinished = true;
                    return res.status(204).end(); // Нет новых сообщений
                }

                // Ждём и пробуем снова
                setTimeout(pollLoop, POLLING_INTERVAL_MS);
            } catch (err) {
                console.error("Polling DB error:", err);
                if (!res.writableEnded) {
                    isFinished = true;
                    res.status(500).json({ success: false });
                }
            }
        }

        pollLoop();

    } catch (err) {
        console.error("Polling init error:", err);
        if (!res.writableEnded) {
            res.status(500).json({ success: false });
        }
    }
});

module.exports = router;
