import {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    base64ToUint8Array,
    uint8ArrayToBase64,
} from "./b64";

import { random } from "@lukeed/csprng/browser";

export const encrypt = async (data: ArrayBuffer, key: CryptoKey) => {
    const iv: Uint8Array = random(96);

    const encryptedData: ArrayBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
            length: 256,
        },
        key,
        data
    );

    return {
        iv: await uint8ArrayToBase64(iv),
        data: await arrayBufferToBase64(encryptedData),
    };
};

export const encryptData = async (data: ArrayBuffer, key: CryptoKey) => {
    const iv: Uint8Array = random(96);

    const encryptedData: ArrayBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
            length: 256,
        },
        key,
        data
    );

    return {
        iv: await uint8ArrayToBase64(iv),
        data: encryptedData,
    };
};

export const decrypt = async (
    data: { iv: string; data: string },
    key: CryptoKey
) => {
    const iv: Uint8Array = await base64ToUint8Array(data.iv);
    const encryptedData: ArrayBuffer = await base64ToArrayBuffer(data.data);

    const decryptedData: ArrayBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv,
            length: 256,
        },
        key,
        encryptedData
    );

    return decryptedData;
};

export const decryptData = async (
    data: { iv: string; data: ArrayBuffer },
    key: CryptoKey
) => {
    const iv: Uint8Array = await base64ToUint8Array(data.iv);

    const decryptedData: ArrayBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv,
            length: 256,
        },
        key,
        data.data
    );

    return decryptedData;
};

export const deriveKeypair = async (passKey: string, keySalt: string) => {
    const enc = new TextEncoder();

    // derive key from passkey using pbkdf2
    const keypair = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(passKey),
        {
            name: "PBKDF2",
        },
        false,
        ["deriveBits", "deriveKey"]
    );

    // create masterkey from key
    const masterKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            iterations: 200000,
            salt: enc.encode(keySalt),
            hash: "SHA-512",
        },
        keypair,
        {
            name: "AES-GCM", // authenticated encryption
            length: 256,
        },
        true,
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );

    return masterKey;
};

export const createSalt = async (length: number = 96) => {
    const enc = new TextEncoder();
    const salt = enc.encode(random(length));

    return salt;
};
