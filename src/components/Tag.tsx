import { useEffect, useState } from "react";
import { Tag } from "src/interfaces/tag";
import styles from "../styles/Tag.module.scss";

import { FaCog } from "react-icons/fa";

import { decryptName } from "src/utils/tags";

const TagComponent = ({
    tag,
    selected,
    cryptoKey,
    onClick,
    onCogClick,
}: {
    tag: Tag;
    selected: boolean;
    cryptoKey: CryptoKey;
    onClick: () => void | Promise<void>;
    onCogClick?: () => void | Promise<void>;
}) => {
    const [decryptedName, setDecryptedName] = useState<string>("");

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        setDecryptedName(await decryptName(tag, cryptoKey));
    };

    return (
        <>
            <div
                className={styles.container}
                style={{
                    border: `2px solid ${tag.color}`,
                    backgroundColor: selected ? tag.color : "",
                }}
                onClick={() => {
                    onClick();
                }}
            >
                {decryptedName}{" "}
                <span className={styles.count}>({tag.count})</span>
                {selected && onCogClick && (
                    <a
                        role="button"
                        className={styles.cog}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCogClick();
                        }}
                    >
                        <FaCog />
                    </a>
                )}
            </div>
        </>
    );
};

export default TagComponent;
