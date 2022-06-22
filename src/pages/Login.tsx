import { useEffect, useState } from "react";
import styles from "../styles/Register.module.scss";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decrypt, deriveKeypair } from "src/utils/aes";

// @ts-ignore
import PBKDF2 from "crypto-js/pbkdf2";

import { db } from "src/utils/db";

import { useNavigate } from "react-router-dom";
import checkAuthStatus from "src/utils/checkAuthStatus";

const Login = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>("");

    const [password, setPassword] = useState<string>("");

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const doLogin = async () => {
        // get data
        const dataRequest = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/logindata?username=${username}`
        );

        const dataResponse: {
            success: boolean;
            data: { passwordSalt: string; keySalt: string };
        } = await dataRequest.json();

        if (!dataResponse.success) {
            toast.error("User does not exist");
            return;
        }

        // hash password
        const hash = PBKDF2(password, dataResponse.data.passwordSalt, {
            keySize: 512 / 32,
            iterations: 1000,
        }).toString();

        // attempt login
        const loginRequest = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password: hash,
                }),
            }
        );

        const loginResponse: {
            success: boolean;
            data: {
                token: string;
                encryptedKey: string;
                encryptedKeyIV: string;
            };
        } = await loginRequest.json();

        if (!loginResponse.success) {
            toast.error("Incorrect password");
            return;
        }

        // set session in localstorage
        localStorage.setItem("session", loginResponse.data.token);

        // create key and store in db
        const derivedKey: CryptoKey = await deriveKeypair(
            password,
            dataResponse.data.keySalt
        );

        // decrypt encrypted key
        const decryptedMasterKey = await decrypt(
            {
                data: loginResponse.data.encryptedKey,
                iv: loginResponse.data.encryptedKeyIV,
            },
            derivedKey
        );

        // import key
        const masterCryptoKey = await crypto.subtle.importKey(
            "raw",
            decryptedMasterKey,
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        // clear indexeddb
        await db.table("keys").clear();

        // save
        await db.table("keys").add({
            key: masterCryptoKey,
        });

        navigate("/home", { replace: true });
    };

    const checkLoginStatus = async () => {
        if (await checkAuthStatus()) {
            navigate("/home", { replace: true });
        }
    };

    return (
        <>
            <div className={styles.parent}>
                <h1>Login</h1>

                <input
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    placeholder="Password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className={styles.objectiveButton} onClick={doLogin}>
                    Login
                </button>
            </div>
            <ToastContainer />
        </>
    );
};

export default Login;
