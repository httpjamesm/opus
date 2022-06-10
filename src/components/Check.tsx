import styles from "../styles/Check.module.scss";

import { FaCheck } from "react-icons/fa";

const Check = ({ selected }: { selected: boolean }) => {
    return (
        <>
            <div
                className={`${styles.container} ${
                    selected ? styles.sel : styles.unsel
                }`}
            >
                {selected && <FaCheck color={"white"} />}
            </div>
        </>
    );
};

export default Check;
