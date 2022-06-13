import { useEffect, useRef, useState } from "react";
import styles from "../styles/Register.module.scss";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createSalt, deriveKeypair, encrypt } from "src/utils/aes";

// @ts-ignore
import PBKDF2 from "crypto-js/pbkdf2";
import { uint8ArrayToBase64 } from "src/utils/b64";
import { useNavigate } from "react-router-dom";

import HCaptcha from "@hcaptcha/react-hcaptcha";

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>("");

    const [password, setPassword] = useState<string>("");

    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [hcToken, setHcToken] = useState<string>("");

    const captchaRef = useRef<HCaptcha>(null);

    const handleRegisterClick = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        captchaRef.current!.execute();
    };

    const doRegister = async (hcToken: string) => {
        const salt = await uint8ArrayToBase64(await createSalt(16));

        const hash = PBKDF2(password, salt, {
            keySize: 512 / 32,
            iterations: 1000,
        }).toString();

        // create random AES-256-GCM key
        const masterKey = await crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        // export as raw
        const masterKeyRaw = await crypto.subtle.exportKey("raw", masterKey);

        const keySalt = await uint8ArrayToBase64(await createSalt(16));

        const passwordKey = await deriveKeypair(password, keySalt);

        // encrypt masterKeyRaw with passwordKey
        const encryptedMasterKey = await encrypt(masterKeyRaw, passwordKey);

        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    passwordHash: hash,
                    passwordSalt: salt,
                    keySalt,
                    encryptedKey: encryptedMasterKey.data,
                    encryptedKeyIV: encryptedMasterKey.iv,
                    hCaptchaResponse: hcToken,
                }),
            }
        );

        const response: { success: boolean; message: string } =
            await request.json();

        if (response.success) {
            toast.success("Successfully registered");
            navigate("/login", { replace: true });
        } else {
            toast.error(response.message);
        }
    };

    useEffect(() => {
        if (!hcToken) return;
        doRegister(hcToken);
    }, [hcToken]);

    return (
        <>
            <div className={styles.parent}>
                <h1>Register</h1>

                <input
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    placeholder="Password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    placeholder="Confirm Password"
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <HCaptcha
                    size="invisible"
                    sitekey={process.env.REACT_APP_HCAPTCHA_SITEKEY as string}
                    onVerify={(token) => setHcToken(token)}
                    onExpire={() => {
                        toast.error("Captcha expired, please try again.");
                    }}
                    onError={(err) => {
                        toast.error(`Captcha error: ${err}`);
                    }}
                    ref={captchaRef}
                />

                <button
                    className={styles.objectiveButton}
                    onClick={handleRegisterClick}
                >
                    Register
                </button>
                <p style={{ fontSize: ".7rem", marginTop: ".5rem" }}>
                    This site is protected by hCaptcha and its{" "}
                    <a href="https://www.hcaptcha.com/privacy" target="_blank" rel="noreferrer">
                        Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="https://www.hcaptcha.com/terms" target="_blank" rel="noreferrer">
                        Terms of Service
                    </a>{" "}
                    apply.
                </p>
            </div>
            <ToastContainer />
        </>
    );
};

export default Register;
