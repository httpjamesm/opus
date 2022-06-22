import styles from "src/styles/Prefs.module.scss";

import { Link } from "react-router-dom";

import Theme from "src/components/prefs/Theme";
import { AiOutlineArrowLeft } from "react-icons/ai";
import Encryption from "src/components/prefs/Encryption";

const Prefs = () => {
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
            </div>
        </>
    );
};

export default Prefs;
