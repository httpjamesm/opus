import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Task } from "src/interfaces/task";
import { decrypt, encrypt } from "src/utils/aes";
import CreateTag from "./CreateTag";
import Tag from "./Tag";

import type { Tag as TagInterface } from "src/interfaces/tag";

import styles from "src/styles/Slideover.module.scss";

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

    const [_itemKey, setItemKey] = useState<CryptoKey>({} as CryptoKey);

    const [tags, setTags] = useState<TagInterface[]>([]);
    const [itemTags, setItemTags] = useState<number[]>([]);

    const decryptData = async (itemKey: CryptoKey) => {
        const decryptedName = await decrypt(
            { data: task.nameCiphertext, iv: task.nameIV },
            itemKey
        );

        const decryptedDesc = await decrypt(
            { data: task.descriptionCiphertext, iv: task.descriptionIV },
            itemKey
        );

        const dec = new TextDecoder();

        const decodedDecryptedName = dec.decode(decryptedName);
        const decodedDecryptedDesc = dec.decode(decryptedDesc);

        setTaskName(decodedDecryptedName);
        setTaskDesc(decodedDecryptedDesc);
        setCachedTaskName(decodedDecryptedName);
        setCachedTaskDesc(decodedDecryptedDesc);
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
            ["encrypt", "decrypt"]
        );

        return key;
    };

    const init = async () => {
        const itemKey: CryptoKey = await decryptKey();
        setItemKey(itemKey);
        await decryptData(itemKey);
        await getTags();
        await getItemTags();
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
            const encryptedName = await encrypt(enc.encode(taskName), _itemKey);
            task.nameCiphertext = encryptedName.data;
            task.nameIV = encryptedName.iv;
        }

        if (descChanged) {
            const encryptedDesc = await encrypt(enc.encode(taskDesc), _itemKey);
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

    const getTags = async () => {
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/tag/list`,
            {
                headers: {
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
            }
        );

        const response: {
            success: boolean;
            data: TagInterface[];
        } = await request.json();

        if (response.success) {
            setTags(response.data);
        }
    };

    const getItemTags = async () => {
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/task/tags?task=${task.id}`,
            {
                headers: {
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
            }
        );

        const response: {
            success: boolean;
            data: number[];
        } = await request.json();

        if (response.success) {
            setItemTags(response.data);
        }
    };

    const assignTag = async (tagId: number) => {
        await fetch(
            `${process.env.REACT_APP_API_URL}/tag/assign?tag=${tagId}&task=${task.id}`,
            {
                method: "PUT",
                headers: {
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
            }
        );
    };

    const removeTag = async (tagId: number) => {
        await fetch(
            `${process.env.REACT_APP_API_URL}/tag/remove?tag=${tagId}&task=${task.id}`,
            {
                method: "DELETE",
                headers: {
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
            }
        );
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
            <h3 style={{ marginTop: "1rem" }}>Tags</h3>
            <div className={styles.tags}>
                <CreateTag
                    cryptoKey={_itemKey as CryptoKey}
                    uponCreation={() => {
                        getTags();
                    }}
                />
                {tags.map((tagObject) => (
                    <Tag
                        cryptoKey={cryptoKey as CryptoKey}
                        key={tagObject.id}
                        tag={tagObject}
                        selected={itemTags.includes(tagObject.id)}
                        onClick={() => {
                            // if it's selected, remove it
                            if (itemTags.includes(tagObject.id)) {
                                removeTag(tagObject.id);
                                setItemTags(
                                    itemTags.filter((id) => id !== tagObject.id)
                                );
                            } else {
                                // add tag
                                assignTag(tagObject.id);
                                setItemTags([...itemTags, tagObject.id]);
                            }
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default Slideover;
