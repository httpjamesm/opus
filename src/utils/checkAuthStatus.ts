import { db } from "./db";

const checkAuthStatus = async () => {
    const session = window.localStorage.getItem("session") as string;

    if (!session) return false;

    const request = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/status`,
        {
            headers: {
                authorization: session,
            },
        }
    );

    if (request.status !== 200) return false;

    // check if there is a key in the database
    const dbKey = await db.table("keys").limit(1).first();

    if (!dbKey) return false;

    return true;
};

export default checkAuthStatus;
