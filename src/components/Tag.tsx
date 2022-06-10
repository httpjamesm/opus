import styles from "../styles/Tag.module.scss";

const Tag = ({
    name,
    color,
    count,
    selected,
}: {
    name: string;
    color: string;
    count: number;
    selected: boolean;
}) => {
    return (
        <>
            <div
                className={styles.container}
                style={{
                    border: `2px solid ${color}`,
                    backgroundColor: selected ? color : "",
                }}
            >
                {name} <span className={styles.count}>({count})</span>
            </div>
        </>
    );
};

export default Tag;
