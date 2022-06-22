import styles from "src/styles/Prefs.module.scss";

import { Link, useNavigate } from "react-router-dom";

import Theme from "src/components/prefs/Theme";
import Encryption from "src/components/prefs/Encryption";
import ChangePassword from "src/components/prefs/ChangePassword";
import Sessions from "src/components/prefs/Sessions";

import { AiOutlineArrowLeft } from "react-icons/ai";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect } from "react";

import checkAuthStatus from "src/utils/checkAuthStatus";

const Prefs = () => {
    const navigate = useNavigate();

    const init = async () => {
        if (!(await checkAuthStatus())) return navigate("/", { replace: true });
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <div className={styles.wrapper}>
                <Link to="/home">
                    <p role="button" className={styles.backButton}>
                        <AiOutlineArrowLeft />
                        Go Back
                    </p>
                </Link>
                <Theme />
                <Encryption />
                <ChangePassword />
                <ToastContainer />
                <Sessions />
            </div>
        </>
    );
};

export default Prefs;
