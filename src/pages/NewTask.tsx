import { useState } from "react";
import { encrypt } from "src/utils/aes";
import Check from "../components/Check";
import styles from "../styles/NewTask.module.scss";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { db } from "src/utils/db";

const NewTask = () => {
    const [name, setName] = useState<string>("");

    const [desc, setDesc] = useState<string>("");

    const createTask = async () => {
        // encrypt name and description

        const enc = new TextEncoder();

        // retrieve key from db
        const key = await db.table("keys").limit(1).first();

        // create new random key
        const itemKey: CryptoKey = await crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );

        // export
        const exportedKey = await crypto.subtle.exportKey("raw", itemKey);

        // encrypt exportedKey
        const encryptedKey = await encrypt(exportedKey, key.key);

        const encryptedName = await encrypt(enc.encode(name), key.key);

        const encryptedDesc = await encrypt(enc.encode(desc), key.key);

        // send req
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/task/new`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
                body: JSON.stringify({
                    name: {
                        ciphertext: encryptedName.data,
                        iv: encryptedName.iv,
                    },
                    description: {
                        ciphertext: encryptedDesc.data,
                        iv: encryptedDesc.iv,
                    },
                    key: {
                        ciphertext: encryptedKey.data,
                        iv: encryptedKey.iv,
                    },
                }),
            }
        );

        const response: {
            success: boolean;
            message: string;
        } = await request.json();

        if (response.success) {
            toast.success("Successfully created task");
            // wait 1 s
            setTimeout(() => {
                window.location.href = "/home";
            }, 1000);
            return;
        }

        toast.error(response.message);
    };

    return (
        <>
            <div className={styles.parent}>
                <h1>New Task</h1>
                <hr />
                <h2>Name</h2>
                <input
                    placeholder="e.g. Buy a shrub"
                    onChange={(e) => setName(e.target.value)}
                />
                <h2>Description</h2>
                <textarea
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={`Requirements:
- 5 meters tall
- Young age

Maybe evergreen?`}
                />
                <div className={styles.settingGroup}>
                    <Check selected={false} />
                    <p className={styles.desc}>Recurring</p>
                </div>
                <div className={styles.settingGroup}>
                    <Check selected={false} />
                    <p className={styles.desc}>Due Date</p>
                </div>
                <h2>Tags</h2>
                <button className={styles.objectiveButton} onClick={createTask}>
                    Done
                </button>
            </div>
            <ToastContainer />
        </>
    );
};

export default NewTask;
