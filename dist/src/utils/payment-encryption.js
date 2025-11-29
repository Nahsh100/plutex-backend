"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptPaymentPayload = decryptPaymentPayload;
const crypto = require("crypto");
const KEY_ENV = process.env.PAYMENT_ENCRYPTION_KEY;
if (!KEY_ENV) {
    console.warn('PAYMENT_ENCRYPTION_KEY is not set. Payment encryption will fail.');
}
function getKeyBuffer() {
    if (!KEY_ENV) {
        throw new Error('PAYMENT_ENCRYPTION_KEY is not configured');
    }
    const key = Buffer.from(KEY_ENV, 'base64');
    if (key.length !== 32) {
        throw new Error('PAYMENT_ENCRYPTION_KEY must be a 32-byte base64-encoded value');
    }
    return key;
}
function decryptPaymentPayload(payloadBase64) {
    const buf = Buffer.from(payloadBase64, 'base64');
    if (buf.length < 12 + 16) {
        throw new Error('Encrypted payload is too short');
    }
    const iv = buf.subarray(0, 12);
    const ciphertextWithTag = buf.subarray(12);
    const tag = ciphertextWithTag.subarray(ciphertextWithTag.length - 16);
    const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - 16);
    const key = getKeyBuffer();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const json = decrypted.toString('utf8');
    return JSON.parse(json);
}
//# sourceMappingURL=payment-encryption.js.map