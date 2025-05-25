// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/thumbnail/:id", async (req, res) => {
    if (req.user) {
        try {
            const message = await db.one("SELECT chat_id FROM messages WHERE attachment_id = $1", [ req.params.id ]);
            const chat = await db.one("SELECT user1_id, user2_id FROM chats WHERE id = $1", [ message?.chat_id ]);
            if (chat?.user1_id !== req.user.id && chat?.user2_id !== req.user.id) {
                throw "User has no access to this thumbnail!";
            }
            const attachment = await db.one("SELECT type, data FROM thumbnails WHERE attachment_id = $1", [ req.params.id ]);
            res.contentType(attachment.type);
            res.write(attachment.data);
            res.end();
        } catch (err) {
            console.log(err);
            res.json({ success: false });
        }
    } else {
        res.redirect("/login");
    }
});

router.get("/attachment/:id", async (req, res) => {
    if (req.user) {
        try {
            const message = await db.one("SELECT chat_id FROM messages WHERE attachment_id = $1", [ req.params.id ]);
            const chat = await db.one("SELECT user1_id, user2_id FROM chats WHERE id = $1", [ message?.chat_id ]);
            if (chat?.user1_id !== req.user.id && chat?.user2_id !== req.user.id) {
                throw "User has no access to this attachment!";
            }
            const attachment = await db.one("SELECT type, data FROM attachments WHERE id = $1", [ req.params.id ]);
            res.contentType(attachment.type);
            res.write(attachment.data);
            res.end();
        } catch (err) {
            console.log(err);
            res.json({ success: false });
        }
    } else {
        res.redirect("/login");
    }
});

module.exports = router;
