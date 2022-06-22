import styles from "src/styles/Prefs.module.scss";

import { RiLogoutCircleRLine } from "react-icons/ri";
import { AiFillFire } from "react-icons/ai";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

const Sessions = () => {
    const navigate = useNavigate();

    const logout = async () => {
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/logout`,
            {
                method: "DELETE",
                headers: {
                    authorization: localStorage.getItem("session") as string,
                },
            }
        );

        if (request.status === 200) {
            navigate("/login", { replace: true });
        }

        const response: { message: string } = await request.json();

        toast.error(response.message);
    };

    const revokeAll = async () => {
        const request = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/sessions`,
            {
                method: "DELETE",
                headers: {
                    authorization: localStorage.getItem("session") as string,
                },
            }
        );

        if (request.status === 200) {
            navigate("/login", { replace: true });
        }

        const response: { message: string } = await request.json();

        toast.error(response.message);
    };

    return (
        <>
            <h3 className={styles.heading}>sessions</h3>
            <hr />
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <button className={styles.destructiveButton} onClick={logout}>
                    <RiLogoutCircleRLine />
                    Logout
                </button>
                <button
                    className={styles.destructiveButton}
                    onClick={revokeAll}
                >
                    <AiFillFire />
                    Revoke All Sessions
                </button>
            </div>
        </>
    );
};

export default Sessions;
