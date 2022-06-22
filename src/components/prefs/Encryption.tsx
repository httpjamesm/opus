import { useEffect, useState } from "react";
import Check from "src/components/Check";
import styles from "src/styles/Prefs.module.scss";

import { AiOutlineReload } from "react-icons/ai";

const Encryption = () => {
    const [encryptedItems, setEncryptedItems] = useState<string>("Counting...");

    const getItemCount = async () => {
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/account/counts`,
            {
                headers: {
                    authorization: localStorage.getItem("session") as string,
                },
            }
        );

        const response: {
            data: {
                tasks: number;
                tags: number;
            };
        } = await request.json();

        setEncryptedItems(
            `${response.data.tasks} tasks, ${response.data.tags} tags`
        );
    };

    useEffect(() => {
        getItemCount();
    }, []);

    return (
        <>
            <h3 className={styles.heading}>encryption details</h3>
            <hr />
            <div className={styles.group + " " + styles.vertical}>
                <b>Encryption</b>
                <p>Enabled | AES-256-GCM</p>
            </div>
            <div className={styles.group + " " + styles.vertical}>
                <b>Encryption Source</b>
                <p>
                    Encrypted AES-256-GCM Master Keys and AES-256-GCM File Keys
                </p>
            </div>
            <div className={styles.group + " " + styles.vertical}>
                <b>Encrypted Items</b>
                <p>{encryptedItems}</p>
            </div>
        </>
    );
};

export default Encryption;
