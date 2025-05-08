// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/poll/:id", async (req, res) => {
    if (req.user) {
        try {
            const chat = await db.one("SELECT user1_id, user2_id FROM chats WHERE id = $1", [ req.params.id ]);
            if (chat?.user1_id !== req.user.id && chat?.user2_id !== req.user.id) {
                throw "User does not belong to this chat!";
            }
            async function checkMessages() {
                const messages = await db.any("SELECT username, attachment_id, text, timestamp FROM messages JOIN users ON users.id = user_id WHERE chat_id = $1 AND timestamp > $2 ORDER BY messages.timestamp DESC", [ req.params.id, req.body.timestamp ]);
                if (messages.length > 0) {
                    res.json({
                        messages: messages.map((message) => {
                            return {
                                username: message.username,
                                text: message.text,
                                datetime: message.timestamp
                            }
                        })
                    });
                } else setTimeout(checkMessages, 500);
            }
            checkMessages();
        } catch (err) {
            console.log(err);
            res.json({ success: false });
        }
    } else {
        res.redirect("/login");
    }
});

module.exports = router;
