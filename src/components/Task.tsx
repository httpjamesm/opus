import { useEffect, useState } from "react";
import { decrypt } from "src/utils/aes";
import type { Task } from "../interfaces/task";
import Check from "./Check";

const TaskComponent = ({
    task,
    cryptoKey,
}: {
    task: Task;
    cryptoKey: CryptoKey;
}) => {
    const [decryptedName, setDecryptedName] = useState<string>("");
    const [decryptedDesc, setDecryptedDesc] = useState<string>("");

    const init = async () => {
        // decrypt name and desc
        const decryptedName = await decrypt(
            { data: task.nameCiphertext, iv: task.nameIV },
            cryptoKey
        );

        const decryptedDesc = await decrypt(
            { data: task.descriptionCiphertext, iv: task.descriptionIV },
            cryptoKey
        );

        const dec = new TextDecoder();

        setDecryptedName(dec.decode(decryptedName));
        setDecryptedDesc(dec.decode(decryptedDesc));
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Check selected={task.completed || false} />
                <p
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
