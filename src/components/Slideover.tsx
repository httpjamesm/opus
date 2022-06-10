import { useEffect, useState } from "react";
import { Task } from "src/interfaces/task";
import { decrypt } from "src/utils/aes";

const Slideover = ({
    task,
    cryptoKey,
}: {
    task: Task;
    cryptoKey: CryptoKey;
}) => {
    const [taskName, setTaskName] = useState<string>("");

    const [taskDesc, setTaskDesc] = useState<string>("");

    const decryptData = async () => {
        const decryptedName = await decrypt(
            { data: task.nameCiphertext, iv: task.nameIV },
            cryptoKey
        );

        const decryptedDesc = await decrypt(
            { data: task.descriptionCiphertext, iv: task.descriptionIV },
            cryptoKey
        );

        const dec = new TextDecoder();

        setTaskName(dec.decode(decryptedName));
        setTaskDesc(dec.decode(decryptedDesc));
    };

    useEffect(() => {
        decryptData();
    }, []);

    return (
        <>
            <h3>Name</h3>
            <input
                placeholder="Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                style={{ width: "100%" }}
            />
            <h3 style={{ marginTop: "1rem" }}>Description</h3>
            <textarea
                placeholder="Task Description"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
            />
        </>
    );
};

export default Slideover;
