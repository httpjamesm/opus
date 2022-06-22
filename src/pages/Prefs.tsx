import styles from "src/styles/Prefs.module.scss";

import { Link } from "react-router-dom";

import Theme from "src/components/prefs/Theme";
import { AiOutlineArrowLeft } from "react-icons/ai";

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
            </div>
        </>
    );
};

export default Prefs;
