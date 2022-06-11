import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Task } from "src/interfaces/task";
import { decrypt, encrypt } from "src/utils/aes";

type returnvalue = [string, Dispatch<SetStateAction<string>>];

function useSaveDebounce(delay = 350): returnvalue {
    const [search, setSearch] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const delayFn = setTimeout(() => {
            setSearch(searchQuery);
        }, delay);
        return () => clearTimeout(delayFn);
    }, [searchQuery, delay]);

    return [search, setSearchQuery];
}

const Slideover = ({
    task,
    cryptoKey,
}: {
    task: Task;
    cryptoKey: CryptoKey;
}) => {
    const [nameChanged, setNameChanged] = useState<boolean>(false);
    const [descChanged, setDescChanged] = useState<boolean>(false);

    const [taskName, setTaskName] = useSaveDebounce(500);
    const [taskDesc, setTaskDesc] = useSaveDebounce(500);

    const [cachedTaskName, setCachedTaskName] = useState<string>("");
    const [cachedTaskDesc, setCachedTaskDesc] = useState<string>("");

    const [itemKey, setItemKey] = useState<CryptoKey>({} as CryptoKey);

    const decryptData = async () => {
        const decryptedName = await decrypt(
            { data: task.nameCiphertext, iv: task.nameIV },
            itemKey
        );

        const decryptedDesc = await decrypt(
            { data: task.descriptionCiphertext, iv: task.descriptionIV },
            itemKey
        );

        const dec = new TextDecoder();

        setTaskName(dec.decode(decryptedName));
        setTaskDesc(dec.decode(decryptedDesc));
        setCachedTaskName(dec.decode(decryptedName));
        setCachedTaskDesc(dec.decode(decryptedDesc));
    };

    const decryptKey = async () => {
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

        setItemKey(key);
    };

    const init = async () => {
        await decryptKey();
        await decryptData();
    };

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        saveTask();
    }, [taskName, taskDesc]);

    const saveTask = async () => {
        const enc = new TextEncoder();

        if (nameChanged) {
            const encryptedName = await encrypt(enc.encode(taskName), itemKey);
            task.nameCiphertext = encryptedName.data;
            task.nameIV = encryptedName.iv;
        }

        if (descChanged) {
            const encryptedDesc = await encrypt(enc.encode(taskDesc), itemKey);
            task.descriptionCiphertext = encryptedDesc.data;
            task.descriptionIV = encryptedDesc.iv;
        }

        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/task/edit?task=${task.id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
                body: JSON.stringify({
                    name: {
                        ciphertext: task.nameCiphertext,
                        iv: task.nameIV,
                    },
                    description: {
                        ciphertext: task.descriptionCiphertext,
                        iv: task.descriptionIV,
                    },
                }),
            }
        );

        const response = await request.json();

        if (response.success) {
            setNameChanged(false);
            setDescChanged(false);
        }
    };

    return (
        <>
            <h3>Name</h3>
            <input
                placeholder="Task Name"
                value={cachedTaskName}
                onChange={(e) => {
                    setNameChanged(true);
                    setTaskName(e.target.value);
                    setCachedTaskName(e.target.value);
                }}
                style={{ width: "100%" }}
            />
            <h3 style={{ marginTop: "1rem" }}>Description</h3>
            <textarea
                placeholder="Task Description"
                value={cachedTaskDesc}
                onChange={(e) => {
                    setDescChanged(true);
                    setTaskDesc(e.target.value);
                    setCachedTaskDesc(e.target.value);
                }}
            />
        </>
    );
};

export default Slideover;
