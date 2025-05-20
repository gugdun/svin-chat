// Copyright (c) 2025 gugdun
// All rights reserved. Unauthorized use, copying, or distribution is strictly prohibited.

const crypto = require("crypto");
const key = Buffer.from(process.env.MESSAGE_SECRET);

function encrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        key,
        iv
    );
    return Buffer.concat([iv, cipher.update(plaintext, "utf8"), cipher.final()]);
}

function decrypt(ivCiphertext) {
    const iv = ivCiphertext.subarray(0, 16);
    const ciphertext = ivCiphertext.subarray(16);
    const cipher = crypto.createDecipheriv(
        "aes-256-cbc",
        key,
        iv
    );
    const decrypted = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
    return decrypted.toString("utf-8");
}

module.exports = { encrypt, decrypt };
