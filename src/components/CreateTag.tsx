import { useEffect, useRef, useState } from "react";
import { encrypt } from "src/utils/aes";
import styles from "../styles/Tag.module.scss";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateTag = ({
    cryptoKey,
    uponCreation,
}: {
    cryptoKey: CryptoKey;
    uponCreation: () => void;
}) => {
    const [editing, setEditing] = useState<boolean>(false);

    const [name, setName] = useState<string>("");

    let editorRef = useRef<HTMLInputElement>(null);

    const createTag = async () => {
        // encrypt tag name
        const enc = new TextEncoder();

        const encryptedName = await encrypt(enc.encode(name), cryptoKey);

        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/tag/new`,
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
                }),
            }
        );

        const response: {
            success: boolean;
            message: string;
            data: number;
        } = await request.json();

        if (response.success) {
            toast.success(response.message);
            setEditing(false);
            uponCreation();
            return;
        }

        toast.error(response.message);
    };

    useEffect(() => {
        if (editing) {
            editorRef.current?.focus();
        }
    }, [editing]);

    return (
        <>
            {!editing ? (
                <div
                    className={styles.container}
                    style={{
                        border: `2px solid #959595`,
                    }}
                    onClick={() => {
                        setEditing(true);
                    }}
                >
                    +
                </div>
            ) : (
                <input
                    ref={editorRef}
                    className={styles.editingContainer}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            createTag();
                        }
                    }}
                    style={{
                        border: `2px solid #959595`,
                        width: `${name.length}ch`,
                    }}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
            )}
            <ToastContainer />
        </>
    );
};

export default CreateTag;
