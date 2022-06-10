import Tag from "../components/Tag";
import styles from "../styles/Home.module.scss";

import Check from "../components/Check";
import { useEffect, useState } from "react";
import { Task } from "src/interfaces/task";
import TaskComponent from "../components/Task";

import { db } from "src/utils/db";
import CreateTag from "src/components/CreateTag";
import { Tag as TagInterface } from "src/interfaces/tag";

const Home = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const [tags, setTags] = useState<TagInterface[]>([]);

    const [key, setKey] = useState<CryptoKey>();

    const [selectedTag, setSelectedTag] = useState<number>(0);

    const getKey = async () => {
        // retrieve key from db

        if (key) return;

        const dbKey = await db.table("keys").limit(1).first();
        setKey(dbKey.key);
    };

    const getTasks = async (selectTag: number = 0) => {
        setSelectedTag(selectTag);

        const uri = selectTag
            ? `${process.env.REACT_APP_API_URL}/task/list?tag=${selectTag}`
            : `${process.env.REACT_APP_API_URL}/task/list`;

        const request = await fetch(uri, {
            headers: {
                authorization: window.localStorage.getItem("session") as string,
            },
        });

        const response: {
            success: boolean;
            data: Task[];
        } = await request.json();

        if (response.success) {
            setTasks(response.data);
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

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        await getKey();
        await getTags();
        await getTasks();
    };

    return (
        <>
            <div className={styles.parent}>
                <h1>Home</h1>
                <hr />
                <div className={styles.tagsParent}>
                    <h2>Tags</h2>
                    <button
                        className={styles.newTaskButton}
                        onClick={() => (window.location.href = "/newtask")}
                    >
                        New Task
                    </button>
                </div>
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
                            selected={selectedTag === tagObject.id}
                            tag={tagObject}
                            onClick={() => {
                                if (selectedTag === tagObject.id) {
                                    // if tag is selected, then set to 0
                                    setSelectedTag(0);
                                    getTasks(0);
                                    return;
                                }
                                getTasks(tagObject.id);
                            }}
                        />
                    ))}
                </div>
                <h2>Recurring</h2>
                <Check selected={false} />
                <h2>Upcoming</h2>
                <h2>General</h2>
                {tasks.map((task) => (
                    <TaskComponent
                        key={task.id}
                        cryptoKey={key as CryptoKey}
                        task={task}
                    />
                ))}
            </div>
        </>
    );
};

export default Home;
