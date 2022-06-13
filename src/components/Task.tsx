import { useEffect, useState } from "react";
import { decrypt } from "src/utils/aes";
import { recurringValues } from "src/utils/recurringValues";
import type { Task } from "../interfaces/task";
import Check from "./Check";

const DueComponent = ({ time }: { time: number }) => {
    const date = new Date(time * 1000);

    const overdue = Date.now() > date.getTime();

    let diff: Date = overdue
        ? new Date(new Date().getTime() - date.getTime())
        : new Date(date.getTime() - new Date().getTime());

    const years = diff.getUTCFullYear() - 1970; // Gives difference as year
    const months = diff.getUTCMonth(); // Gives month count of difference
    const days = diff.getUTCDate() - 1; // Gives day count of difference
    const hours = diff.getUTCHours(); // Gives hour count of difference
    const minutes = diff.getUTCMinutes(); // Gives minute count of difference

    return (
        <>
            <b
                style={{
                    color: overdue ? "#FF9191" : "#929292",
                    margin: 0,
                    marginLeft: ".5rem",
                }}
            >
                {overdue ? "Overdue by " : "Due in "}
                {/* show due date but don't show 0 values */}
                {years > 0 && (
                    <>
                        {years} {years === 1 ? "year" : "years"}
                    </>
                )}{" "}
                {months > 0 && (
                    <>
                        {months} {months === 1 ? "month" : "months"}
                    </>
                )}{" "}
                {days > 0 && (
                    <>
                        {days} {days === 1 ? "day" : "days"}
                    </>
                )}{" "}
                {hours > 0 && (
                    <>
                        {hours} {hours === 1 ? "hour" : "hours"}
                    </>
                )}{" "}
                {minutes > 0 && (
                    <>
                        {minutes} {minutes === 1 ? "minute" : "minutes"}
                    </>
                )}{" "}
            </b>
        </>
    );
};

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

    const [decryptedDueEpoch, setDecryptedDueEpoch] = useState<number>(0);

    const [decryptedRecurringSeconds, setDecryptedRecurringSeconds] =
        useState<number>(0);

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

        const dec = new TextDecoder();

        setDecryptedName(dec.decode(decryptedName));

        if (task.dueDateCiphertext && task.dueDateIV) {
            const decryptedEpoch = await decrypt(
                { data: task.dueDateCiphertext, iv: task.dueDateIV },
                key
            );

            setDecryptedDueEpoch(Number(dec.decode(decryptedEpoch)));
        }

        if (task.recurringCiphertext && task.recurringIV) {
            const decryptedRecurringSeconds = await decrypt(
                { data: task.recurringCiphertext, iv: task.recurringIV },
                key
            );

            setDecryptedRecurringSeconds(
                Number(dec.decode(decryptedRecurringSeconds))
            );
        }
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
                    marginBottom: "1rem",
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Check selected={isCompleted} onClick={markCompletion} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <p
                            onClick={onClick}
                            style={{
                                marginLeft: ".5rem",
                                marginBottom: 0,
                                marginTop: 0,
                                fontWeight: "bold",
                                fontSize: "1.25rem",
                            }}
                        >
                            {decryptedName}
                        </p>
                        {decryptedDueEpoch > 0 && !task.completed && (
                            <>
                                <div style={{ display: "flex" }}>
                                    <DueComponent time={decryptedDueEpoch} />
                                    {decryptedRecurringSeconds > 0 && (
                                        <p
                                            style={{
                                                marginLeft: ".5rem",
                                                marginBottom: 0,
                                                marginTop: 0,
                                                fontWeight: "bold",
                                                color: "#929292",
                                            }}
                                        >
                                            (
                                            {
                                                recurringValues[
                                                    decryptedRecurringSeconds
                                                ]
                                            }
                                            )
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskComponent;
