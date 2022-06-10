import styles from "../styles/Check.module.scss";

import { FaCheck } from "react-icons/fa";

const Check = ({
    selected,
    onClick,
}: {
    selected: boolean;
    onClick?: () => void | Promise<void>;
}) => {
    return (
        <>
            <div
                className={`${styles.container} ${
                    selected ? styles.sel : styles.unsel
                }`}
                onClick={onClick}
            >
                {selected && <FaCheck color={"white"} />}
            </div>
        </>
    );
};

export default Check;
