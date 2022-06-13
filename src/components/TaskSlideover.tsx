import { useEffect, useState } from "react";
import { Task } from "src/interfaces/task";
import { decrypt, encrypt } from "src/utils/aes";
import CreateTag from "./CreateTag";
import Tag from "./Tag";

import type { Tag as TagInterface } from "src/interfaces/tag";

import styles from "src/styles/Slideover.module.scss";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Check from "./Check";

import useSaveDebounce from "./SaveDebounce";

import { FiDelete } from "react-icons/fi";
import { recurringValues } from "src/utils/recurringValues";

const Slideover = ({
    task,
    cryptoKey,
    closeSlideover,
}: {
    task: Task;
    cryptoKey: CryptoKey;
    closeSlideover: () => void;
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

    const [dueDateEnabled, setDueDateEnabled] = useState<boolean>(
        !!task.dueDateCiphertext
    );
    const [dueDate, setDueDate] = useState<Date | null>();
    const [dueTime, setDueTime] = useState<string>("");
    const [dueDateChanged, setDueDateChanged] = useState<boolean>(false);

    const [recurringEnabled, setRecurringEnabled] = useState<boolean>(
        !!task.recurringCiphertext
    );
    const [recurringSeconds, setRecurringSeconds] = useState<number>(0);
    const [recurringChanged, setRecurringChanged] = useState<boolean>(false);

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

        if (task.dueDateCiphertext && task.dueDateIV) {
            // decrypt this
            const decryptedEpoch = await decrypt(
                { data: task.dueDateCiphertext, iv: task.dueDateIV },
                itemKey
            );

            const dec = new TextDecoder();

            const decodedDecryptedEpoch = Number(dec.decode(decryptedEpoch));

            // get date
            const date = new Date(decodedDecryptedEpoch * 1000);

            setDueDate(date);

            const timeString = date.toTimeString();

            // only get the first part HH:MM
            setDueTime(timeString.split(" ")[0]);
        }

        if (task.recurringCiphertext && task.recurringIV) {
            // decrypt this
            const decryptedRecurring = await decrypt(
                { data: task.recurringCiphertext, iv: task.recurringIV },
                itemKey
            );

            const dec = new TextDecoder();

            const decodedDecryptedRecurring = Number(
                dec.decode(decryptedRecurring)
            );

            setRecurringEnabled(true);
            setRecurringSeconds(decodedDecryptedRecurring);
        }
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
    }, [
        taskName,
        taskDesc,
        dueDateEnabled,
        dueDate,
        dueTime,
        recurringEnabled,
        recurringSeconds,
    ]);

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

        if (dueDateChanged && dueDate !== null) {
            const dueDateEpoch: string = (
                new Date(
                    `${(dueDate as Date).toLocaleDateString()} ${dueTime}`
                ).getTime() / 1000
            ).toString();

            const dueDateEncryptedObject = await encrypt(
                enc.encode(dueDateEpoch),
                _itemKey
            );

            task.dueDateCiphertext = dueDateEncryptedObject.data;
            task.dueDateIV = dueDateEncryptedObject.iv;
        }

        if (recurringChanged) {
            const recurringSecondsEncryptedObject = await encrypt(
                enc.encode(recurringSeconds.toString()),
                _itemKey
            );

            task.recurringCiphertext = recurringSecondsEncryptedObject.data;
            task.recurringIV = recurringSecondsEncryptedObject.iv;
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
                    due: {
                        ciphertext: dueDateEnabled ? task.dueDateCiphertext : "",
                        iv: dueDateEnabled ? task.dueDateIV : "",
                    },
                    recurring: {
                        ciphertext: recurringEnabled ? task.recurringCiphertext : "",
                        iv: recurringEnabled ? task.recurringIV : "",
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

    const deleteTask = async () => {
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/task/delete?task=${task.id}`,
            {
                method: "DELETE",
                headers: {
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
            }
        );

        if (request.status === 200) {
            closeSlideover();
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
            <div style={{ display: "flex", alignItems: "center" }}>
                <Check
                    selected={dueDateEnabled}
                    onClick={() => {
                        setDueDateEnabled(!dueDateEnabled);
                        if (dueDateEnabled) {
                            // disable due date
                            setDueDate(null);
                            setDueTime("");
                            setRecurringEnabled(false);
                        }
                        setDueDateChanged(true);
                    }}
                />
                <p style={{ marginLeft: ".5rem", fontWeight: "bold" }}>
                    Due Date
                </p>
            </div>
            {dueDateEnabled && (
                <>
                    <h3 style={{ marginTop: "1rem" }}>Date</h3>
                    <DatePicker
                        selected={dueDate}
                        onChange={(date: Date) => {
                            setDueDate(date);
                            setDueDateChanged(true);
                        }}
                    />
                    <h4>Time</h4>
                    <input
                        type="time"
                        onChange={(e) => {
                            setDueTime(e.target.value);
                            setDueDateChanged(true);
                        }}
                        value={dueTime}
                    />
                </>
            )}
            {dueDateEnabled && (
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Check
                        selected={recurringEnabled}
                        onClick={() => {
                            setRecurringChanged(true);
                            setRecurringEnabled(!recurringEnabled);
                            if (recurringEnabled) {
                                // disable recurring
                                setRecurringSeconds(0);
                            } else {
                                setRecurringSeconds(3600);
                            }
                        }}
                    />
                    <p style={{ marginLeft: ".5rem", fontWeight: "bold" }}>
                        Recurring
                    </p>
                </div>
            )}

            {recurringEnabled && dueDateEnabled && (
                <select
                    value={recurringSeconds}
                    onChange={(e) => {
                        setRecurringChanged(true);
                        setRecurringSeconds(Number(e.target.value));
                    }}
                >
                    {Object.keys(recurringValues).map((key: string) => (
                        <option key={key} value={Number(key)}>
                            {recurringValues[key]}
                        </option>
                    ))}
                </select>
            )}

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
            <p
                role="button"
                className={styles.deleteButton}
                onClick={deleteTask}
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
                Delete Task
            </p>
        </>
    );
};

export default Slideover;
