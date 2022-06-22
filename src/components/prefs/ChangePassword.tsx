import styles from "src/styles/Prefs.module.scss";

import { FaLock } from "react-icons/fa";
import { useState } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// @ts-ignore
import PBKDF2 from "crypto-js/pbkdf2";

import { db } from "src/utils/db";
import { createSalt, deriveKeypair, encrypt } from "src/utils/aes";
import { uint8ArrayToBase64 } from "src/utils/b64";

import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const changePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const authStatusRequest = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/status`,
            {
                headers: {
                    authorization: localStorage.getItem("session") as string,
                },
            }
        );

        const authStatusResponse: {
            success: boolean;
            data: string;
        } = await authStatusRequest.json();

        if (!authStatusResponse.success) {
            toast.error("Could not get auth status");
            return;
        }

        const username = authStatusResponse.data;

        const dataRequest = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/logindata?username=${username}`
        );

        const dataResponse: {
            success: boolean;
            data: { passwordSalt: string; keySalt: string };
        } = await dataRequest.json();

        if (!dataResponse.success) {
            toast.error("Unable to retrieve required credential data");
            return;
        }

        // hash password
        const hash = PBKDF2(oldPassword, dataResponse.data.passwordSalt, {
            keySize: 512 / 32,
            iterations: 1000,
        }).toString();

        const validationRequest = await fetch(
            `${process.env.REACT_APP_API_URL}/account/password?hash=${hash}`,
            {
                headers: {
                    authorization: localStorage.getItem("session") as string,
                },
            }
        );

        const validationResponse: {
            data: boolean;
        } = await validationRequest.json();

        if (!validationResponse.data) {
            toast.error("Old password is incorrect");
            return;
        }

        // 1. in order to change password, we need to get the master key (in CryptoKey form) from indexeddb
        // 2. derive a password key using the new password and a new random salt
        // 3. encrypt the master key using the password key
        // 4. hash the new password with a new salt
        // 5. send this all to the server
        // 6. on success, log user out and redirect to "/login"

        // get master key from indexeddb
        const dbKey = await db.table("keys").limit(1).first();

        const exportedDbKey = await window.crypto.subtle.exportKey(
            "raw",
            dbKey.key
        );

        // new key salt
        const newKeySalt = await uint8ArrayToBase64(await createSalt());

        // derive password key
        const newPasswordKey = await deriveKeypair(newPassword, newKeySalt);

        // encrypt master key
        const encryptedMasterKey = await encrypt(exportedDbKey, newPasswordKey);

        // new password salt
        const newPasswordSalt = await uint8ArrayToBase64(await createSalt());

        // hash new password
        const newPasswordHash = PBKDF2(newPassword, newPasswordSalt, {
            keySize: 512 / 32,
            iterations: 1000,
        }).toString();

        // send request to server
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/account/password`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    authorization: localStorage.getItem("session") as string,
                },
                body: JSON.stringify({
                    oldPasswordHash: hash,
                    passwordHash: newPasswordHash,
                    passwordSalt: newPasswordSalt,
                    encryptedKey: encryptedMasterKey.data,
                    encryptedKeyIV: encryptedMasterKey.iv,
                    keySalt: newKeySalt,
                }),
            }
        );

        const response: {
            success: boolean;
            message: string;
        } = await request.json();

        if (!response.success) {
            toast.error(response.message);
            return;
        }

        toast.success("Password changed and master key re-encrypted");
        localStorage.removeItem("session");

        navigate("/login", { replace: true });
    };

    return (
        <>
            <h3 className={styles.heading}>change password</h3>
            <hr />

            <input
                type="password"
                placeholder="Old Password"
                onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="New Password"
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className={styles.objectiveParent}>
                <button
                    className={styles.objectiveButton}
                    onClick={changePassword}
                >
                    <FaLock />
                    Change
                </button>
            </div>
        </>
    );
};

export default ChangePassword;
