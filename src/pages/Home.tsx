import Tag from "../components/Tag";
import styles from "../styles/Home.module.scss";

import Check from "../components/Check";
import { useEffect, useState } from "react";
import { Task } from "src/interfaces/task";
import TaskComponent from "../components/Task";

import { db } from "src/utils/db";

const Home = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const [key, setKey] = useState<CryptoKey>();

    const getKey = async () => {
        // retrieve key from db

        console.log("getting key")

        if (key) return;

        const dbKey = await db.table("keys").limit(1).first();
        setKey(dbKey.key);
    };

    const getTasks = async () => {
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/task/list`,
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
            data: Task[];
        } = await request.json();

        if (response.success) {
            setTasks(response.data);
        }
    };

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        await getKey();
        await getTasks();
    };

    return (
        <>
            <div className={styles.parent}>
                <h1>Home</h1>
                <hr />
                <h2>Tags</h2>
                <div className={styles.tags}>
                    <Tag
                        selected={true}
                        name="Garden"
                        color="#84FFB5"
                        count={4}
                    />
                    <Tag
                        selected={false}
                        name="Garden"
                        color="#84FFB5"
                        count={4}
                    />
                    <Tag
                        selected={false}
                        name="Garden"
                        color="#84FFB5"
                        count={4}
                    />
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
