import type { Tag as TagInterface } from "src/interfaces/tag";

import styles from "src/styles/Slideover.module.scss";

import { FiDelete } from "react-icons/fi";
import { useEffect, useState } from "react";
import { decrypt, encrypt } from "src/utils/aes";

import useSaveDebounce from "./SaveDebounce";

import { CirclePicker } from "react-color";

const TagSlideover = ({
    cryptoKey,
    tag,
    closeSlideover,
}: {
    cryptoKey: CryptoKey;
    tag: TagInterface;
    closeSlideover: () => void;
}) => {
    const [decryptedName, setDecryptedName] = useSaveDebounce();

    const [cachedDecryptedName, setCachedDecryptedName] = useState<string>("");

    const [nameChanged, setNameChanged] = useState<boolean>(false);

    const [color, setColor] = useState<string>(tag.color);

    const deleteTag = async () => {
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/tag/delete?tag=${tag.id}`,
            {
                method: "DELETE",
                headers: {
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
            }
        );

        const response: { success: boolean; message: string } =
            await request.json();

        if (response.success) {
            closeSlideover();
        }
    };

    const decryptName = async () => {
        // decrypt name
        const decryptedName = await decrypt(
            {
                data: tag.nameCiphertext,
                iv: tag.nameIV,
            },
            cryptoKey
        );

        const dec = new TextDecoder();

        const decodedName = dec.decode(decryptedName);

        setDecryptedName(decodedName);
        setCachedDecryptedName(decodedName);
    };

    const saveTag = async () => {
        const enc = new TextEncoder();

        if (nameChanged) {
            const encryptedName = await encrypt(
                enc.encode(decryptedName),
                cryptoKey
            );

            tag.nameCiphertext = encryptedName.data;
            tag.nameIV = encryptedName.iv;
        }

        await fetch(`${process.env.REACT_APP_API_URL}/tag/edit?tag=${tag.id}`, {
            method: "PATCH",
            headers: {
                authorization: window.localStorage.getItem("session") as string,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: {
                    ciphertext: tag.nameCiphertext,
                    iv: tag.nameIV,
                },
                color,
            }),
        });
    };

    useEffect(() => {
        decryptName();
    }, []);

    useEffect(() => {
        saveTag();
    }, [decryptedName, color]);

    return (
        <>
            <h3>Name</h3>
            <input
                type="text"
                placeholder="Tag Name"
                value={cachedDecryptedName}
                onChange={(e) => {
                    setNameChanged(true);
                    setDecryptedName(e.target.value);
                    setCachedDecryptedName(e.target.value);
                }}
            />
            <h3 style={{ marginTop: "1rem" }}>Color</h3>
            <br />
            <CirclePicker
                color={color}
                onChange={(color) => setColor(color.hex)}
            />
            <p
                role="button"
                className={styles.deleteButton}
                onClick={deleteTag}
            >
                <span
                    style={{
                        marginRight: ".5rem",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <FiDelete />
                </span>
                Delete
            </p>
        </>
    );
};

export default TagSlideover;
