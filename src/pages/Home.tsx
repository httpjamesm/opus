import Tag from "../components/Tag";
import styles from "../styles/Home.module.scss";

import Check from "../components/Check";
import { useEffect, useState } from "react";
import { Task } from "src/interfaces/task";
import TaskComponent from "../components/Task";

import { db } from "src/utils/db";
import CreateTag from "src/components/CreateTag";
import { Tag as TagInterface } from "src/interfaces/tag";

import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import TaskSlideover from "src/components/TaskSlideover";
import { Link } from "react-router-dom";
import TagSlideover from "src/components/TagSlideover";

const Home = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

    const [tags, setTags] = useState<TagInterface[]>([]);

    const [key, setKey] = useState<CryptoKey>();

    const [selectedTag, setSelectedTag] = useState<number>(0);

    const [openTaskSlideover, setOpenTaskSlideover] = useState<boolean>(false);
    const [openTagSlideover, setOpenTagSlideover] = useState<boolean>(false);

    const [selectedTask, setSelectedTask] = useState<Task>();

    const [editingTag, setEditingTag] = useState<TagInterface>();

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
            : `${process.env.REACT_APP_API_URL}/task/list?tag=`;

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
            setTasks([]);
            setCompletedTasks([]);
            setUpcomingTasks([]);

            await Promise.all(
                response.data.map(async (task) => {
                    if (task.dueDateCiphertext) {
                        setUpcomingTasks([...upcomingTasks, task]);
                        return;
                    }
                    setTasks([...tasks, task]);
                })
            );

            const completedRequest = await fetch(uri + "&show_completed=1", {
                headers: {
                    authorization: window.localStorage.getItem(
                        "session"
                    ) as string,
                },
            });

            const completedResponse: {
                success: boolean;
                data: Task[];
            } = await completedRequest.json();

            if (completedResponse.success) {
                setCompletedTasks(completedResponse.data);
            }
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
                    <h2 className={styles.sectionTitle}>Tags</h2>
                    <Link to="/newtask">
                        <button className={styles.newTaskButton}>
                            New Task
                        </button>
                    </Link>
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
                            key={tagObject.id}
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
                            onCogClick={() => {
                                setEditingTag(tagObject);
                                setOpenTagSlideover(true);
                            }}
                        />
                    ))}
                </div>
                <h2 className={styles.sectionTitle}>Recurring</h2>
                <Check selected={false} />
                <h2 className={styles.sectionTitle}>Upcoming</h2>
                {upcomingTasks.map((task) => (
                    <TaskComponent
                        onClick={() => {
                            setSelectedTask(task);
                            setOpenTaskSlideover(true);
                        }}
                        key={task.id}
                        cryptoKey={key as CryptoKey}
                        task={task}
                    />
                ))}
                <h2 className={styles.sectionTitle}>General</h2>
                {tasks.map((task) => (
                    <TaskComponent
                        onClick={() => {
                            setSelectedTask(task);
                            setOpenTaskSlideover(true);
                        }}
                        key={task.id}
                        cryptoKey={key as CryptoKey}
                        task={task}
                    />
                ))}
                <h2 className={styles.sectionTitle}>Completed</h2>
                {completedTasks.map((task) => (
                    <TaskComponent
                        onClick={() => {
                            setSelectedTask(task);
                            setOpenTaskSlideover(true);
                        }}
                        key={task.id}
                        cryptoKey={key as CryptoKey}
                        task={task}
                    />
                ))}
            </div>
            <SlidingPane
                isOpen={openTaskSlideover}
                title="Task Details"
                onRequestClose={() => {
                    // triggered on "<" on left top click or on outside click
                    getTasks(selectedTag);
                    setOpenTaskSlideover(false);
                }}
            >
                <TaskSlideover
                    cryptoKey={key as CryptoKey}
                    task={selectedTask as Task}
                />
            </SlidingPane>
            <SlidingPane
                isOpen={openTagSlideover}
                title="Tag Details"
                onRequestClose={() => {
                    // triggered on "<" on left top click or on outside click
                    getTags();
                    setOpenTagSlideover(false);
                }}
            >
                <TagSlideover
                    cryptoKey={key as CryptoKey}
                    tag={editingTag as TagInterface}
                    closeSlideover={() => {
                        getTags();
                        setOpenTagSlideover(false);
                    }}
                />
            </SlidingPane>
        </>
    );
};

export default Home;
