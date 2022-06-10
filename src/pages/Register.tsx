import { useState } from "react";
import styles from "../styles/Register.module.scss";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createSalt } from "src/utils/aes";

// @ts-ignore
import PBKDF2 from "crypto-js/pbkdf2";
import { uint8ArrayToBase64 } from "src/utils/b64";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>("");

    const [password, setPassword] = useState<string>("");

    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const doRegister = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const salt = await uint8ArrayToBase64(await createSalt(16));

        const hash = PBKDF2(password, salt, {
            keySize: 512 / 32,
            iterations: 1000,
        }).toString();

        const keySalt = await uint8ArrayToBase64(await createSalt(16));

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

                <button className={styles.objectiveButton} onClick={doRegister}>
                    Register
                </button>
            </div>
            <ToastContainer />
        </>
    );
};

export default Register;
