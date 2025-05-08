// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const path = require("path");
const express = require("express");
const ejs = require("ejs");
const db = require("../db");

const views = path.join(__dirname, "..", "views");
const router = express.Router();

router.get("/", async (req, res) => {
    if (req.user) {
        try {
            const chats = await db.any("SELECT * FROM chats WHERE user1_id = $1 OR user2_id = $1", [ req.user.id ]);
            const userIds = chats.map((chat) => chat.user1_id == req.user.id ? chat.user2_id : chat.user1_id);
            const users = await db.any("SELECT username FROM users WHERE id IN ($1:csv)", [ userIds ]);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chats.ejs"), {
                    empty: chats.length < 1,
                    chats: users.map((user) => user.username)
                })
            });
        } catch (err) {
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chats.ejs"), {
                    empty: true,
                    chats: []
                })
            });
        }
    } else {
        res.render("layout", {
            child: await ejs.renderFile(path.join(views, "home.ejs"))
        });
    }
});

router.get("/chat/:chat_id", async (req, res) => {
    if (req.user) {
        try {
            const user = await db.one("SELECT id FROM users WHERE username = $1", [ req.params.chat_id ]);
            const chat = await db.one("SELECT id FROM chats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)", [ req.user.id, user?.id ]);
            const messages = await db.any("SELECT username, attachment_id, text, timestamp FROM messages JOIN users ON users.id = user_id WHERE chat_id = $1 ORDER BY messages.timestamp DESC", [ chat?.id ]);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chat.ejs"), {
                    title: req.params.chat_id,
                    empty: messages.length < 1,
                    messages: messages.map((message) => {
                        const date = new Date(message.timestamp);
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = date.getMonth().toString().padStart(2, '0');
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const seconds = date.getSeconds().toString().padStart(2, '0');
                        const format = `${day}.${month}.${date.getFullYear()} ${hours}:${minutes}:${seconds}`;
                        return {
                            username: message.username,
                            text: message.text,
                            datetime: message.timestamp
                        }
                    })
                })
            });
        } catch (err) {
            console.log(err);
            res.render("layout", {
                child: await ejs.renderFile(path.join(views, "chat.ejs"), {
                    title: req.params.chat_id,
                    empty: true,
                    messages: []
                })
            });
        }
    } else {
        res.redirect("/login");
    }
});

router.get("/login", async (req, res) => {
    if (req.user) {
        res.redirect("/");
    } else {
        res.render("layout", {
            child: await ejs.renderFile(path.join(views, "login.ejs"))
        });
    }
});

router.get("/register", async (req, res) => {
    if (req.user) {
        res.redirect("/");
    } else {
        res.render("layout", {
            child: await ejs.renderFile(path.join(views, "register.ejs"))
        });
    }
});

module.exports = router;
