import { useState } from "react";
import styles from "../styles/Register.module.scss";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deriveKeypair } from "src/utils/aes";

// @ts-ignore
import PBKDF2 from "crypto-js/pbkdf2";

import { db } from "src/utils/db";

const Login = () => {
    const [username, setUsername] = useState<string>("");

    const [password, setPassword] = useState<string>("");

    const doRegister = async () => {
        // get data
        const dataRequest = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/data?username=${username}`
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

        const loginResponse: { success: boolean; data: string } =
            await loginRequest.json();

        if (!loginResponse.success) {
            toast.error("Incorrect password");
            return;
        }

        // set session in localstorage
        localStorage.setItem("session", loginResponse.data);

        // create key and store in db
        const derivedKey: CryptoKey = await deriveKeypair(
            password,
            dataResponse.data.keySalt
        );

        // clear indexeddb
        await db.table("keys").clear();

        // save
        await db.table("keys").add({
            key: derivedKey,
        });
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

                <button className={styles.objectiveButton} onClick={doRegister}>
                    Login
                </button>
            </div>
            <ToastContainer />
        </>
    );
};

export default Login;
