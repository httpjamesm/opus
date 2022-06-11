import { useEffect, useState } from "react";
import { encrypt } from "src/utils/aes";
import Check from "../components/Check";
import styles from "../styles/NewTask.module.scss";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { db } from "src/utils/db";

import { Tag as TagInterface } from "src/interfaces/tag";

import Tag from "../components/Tag";

import { Link, useNavigate } from "react-router-dom";
import CreateTag from "src/components/CreateTag";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { AiOutlineArrowLeft } from "react-icons/ai";

const NewTask = () => {
    const navigate = useNavigate();

    const [name, setName] = useState<string>("");

    const [desc, setDesc] = useState<string>("");

    const [tags, setTags] = useState<TagInterface[]>([]);

    const [key, setKey] = useState<CryptoKey>();

    const [tagsToAssign, setTagsToAssign] = useState<number[]>([]);

    const [dueDateEnabled, setDueDateEnabled] = useState<boolean>(false);
    const [dueDate, setDueDate] = useState<Date>(new Date());
    const [dueTime, setDueTime] = useState<string>("");

    const getKey = async () => {
        // retrieve key from db

        if (key) return;

        const dbKey = await db.table("keys").limit(1).first();
        setKey(dbKey.key);
    };

    const createTask = async () => {
        // encrypt name and description

        if (!name) {
            toast.error("Name is required");
            return;
        }

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

        const encryptedName = await encrypt(enc.encode(name), itemKey);

        const encryptedDesc = await encrypt(enc.encode(desc), itemKey);

        let dueDateEncrypted: string = "";
        let dueDateIV: string = "";

        if (dueDateEnabled) {
            const dueDateEpoch: string = (
                new Date(
                    `${dueDate.toLocaleDateString()} ${dueTime}`
                ).getTime() / 1000
            ).toString();

            const dueDateEncryptedObject = await encrypt(
                enc.encode(dueDateEpoch),
                itemKey
            );

            dueDateEncrypted = dueDateEncryptedObject.data;
            dueDateIV = dueDateEncryptedObject.iv;
        }

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
                    due: {
                        ciphertext: dueDateEncrypted,
                        iv: dueDateIV,
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
            // assign tags if there are any to assign
            if (tagsToAssign.length) {
                await Promise.all(
                    tagsToAssign.map(async (tagId) => {
                        await fetch(
                            `${process.env.REACT_APP_API_URL}/tag/assign?tag=${tagId}&task=${response.data}`,
                            {
                                method: "PUT",
                                headers: {
                                    authorization: window.localStorage.getItem(
                                        "session"
                                    ) as string,
                                },
                            }
                        );
                    })
                );
            }

            toast.success("Successfully created task");
            // wait 1 s
            setTimeout(() => {
                navigate("/home", { replace: true });
            }, 1000);
            return;
        }

        toast.error(response.message);
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

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        await getKey();
        await getTags();
    };

    return (
        <>
            <div className={styles.parent}>
                <Link to="/home">
                    <p role="button" className={styles.backButton}>
                        <AiOutlineArrowLeft />
                        Go Back
                    </p>
                </Link>
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
                    <Check
                        selected={dueDateEnabled}
                        onClick={() => {
                            setDueDateEnabled(!dueDateEnabled);
                        }}
                    />
                    <p className={styles.desc}>Due Date</p>
                </div>
                {dueDateEnabled && (
                    <>
                        <h4>Date</h4>
                        <DatePicker
                            selected={dueDate}
                            onChange={(date: Date) => setDueDate(date)}
                        />
                        <h4>Time</h4>
                        <input
                            type="time"
                            onChange={(e) => setDueTime(e.target.value)}
                        />
                    </>
                )}
                <h2>Tags</h2>
                <div className={styles.tags}>
                    <CreateTag
                        cryptoKey={key as CryptoKey}
                        uponCreation={() => {
                            getTags();
                        }}
                    />
                    {tags.map((tagObject) => (
                        <Tag
                            cryptoKey={key as CryptoKey}
                            key={tagObject.id}
                            tag={tagObject}
                            selected={tagsToAssign.includes(tagObject.id)}
                            onClick={() => {
                                if (!tagsToAssign.includes(tagObject.id)) {
                                    setTagsToAssign([
                                        ...tagsToAssign,
                                        tagObject.id,
                                    ]);
                                } else {
                                    // remove tag
                                    setTagsToAssign(
                                        tagsToAssign.filter(
                                            (tag) => tag !== tagObject.id
                                        )
                                    );
                                }
                            }}
                        />
                    ))}
                </div>
                <button className={styles.objectiveButton} onClick={createTask}>
                    Done
                </button>
            </div>
            <ToastContainer />
        </>
    );
};

export default NewTask;
