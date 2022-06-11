import { useEffect, useState } from "react";
import { decrypt } from "src/utils/aes";
import type { Task } from "../interfaces/task";
import Check from "./Check";

const TaskComponent = ({
    task,
    cryptoKey,
    onClick,
}: {
    task: Task;
    cryptoKey: CryptoKey;
    onClick: () => void;
}) => {
    const [decryptedName, setDecryptedName] = useState<string>("");
    const [decryptedDesc, setDecryptedDesc] = useState<string>("");

    const [isCompleted, setIsCompleted] = useState<boolean>(
        task.completed || false
    );

    const init = async () => {
        // decrypt name and desc

        // decrypt the item's key
        const decryptedKey = await decrypt(
            { data: task.keyCiphertext, iv: task.keyIV },
            cryptoKey
        );

        // import the key
        const key = await crypto.subtle.importKey(
            "raw",
            decryptedKey,
            "AES-GCM",
            false,
            ["decrypt"]
        );

        const decryptedName = await decrypt(
            { data: task.nameCiphertext, iv: task.nameIV },
            key
        );

        const decryptedDesc = await decrypt(
            { data: task.descriptionCiphertext, iv: task.descriptionIV },
            key
        );

        const dec = new TextDecoder();

        setDecryptedName(dec.decode(decryptedName));
        setDecryptedDesc(dec.decode(decryptedDesc));
    };

    useEffect(() => {
        init();
    }, []);

    const markCompletion = async () => {
        setIsCompleted(!isCompleted);

        // send req
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/task/mark?id=${task.id}&mark=${
                isCompleted ? "0" : "1"
            }`,
            {
                method: "PATCH",
                headers: {
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
            }
        );

        const response: { success: boolean } = await request.json();

        if (!response.success) {
            setIsCompleted(!isCompleted);
        }
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Check selected={isCompleted} onClick={markCompletion} />
                <p
                    onClick={onClick}
                    style={{
                        marginLeft: ".5rem",
                        fontWeight: "bold",
                        fontSize: "1.25rem",
                    }}
                >
                    {decryptedName}
                </p>
            </div>
        </>
    );
};

export default TaskComponent;
