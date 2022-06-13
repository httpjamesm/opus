import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Tag } from "src/interfaces/tag";
import styles from "src/styles/DesktopSidebar.module.scss";
import { decryptName } from "src/utils/tags";
import { FaCog } from "react-icons/fa";

const DesktopTag = ({
    tag,
    cryptoKey,
    onClick,
    selected,
    openTagSlideover,
}: {
    tag: Tag;
    cryptoKey: CryptoKey;
    onClick: () => void;
    selected: boolean;
    openTagSlideover: () => void;
}) => {
    const [decryptedName, setDecryptedName] = useState<string>("");

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        setDecryptedName(await decryptName(tag, cryptoKey));
    };

    return (
        <div
            className={styles.item}
            style={{
                backgroundColor: selected ? tag.color : "",
            }}
            onClick={() => {
                onClick();
            }}
        >
            <div
                className={styles.color}
                style={{
                    backgroundColor: tag.color,
                    border: selected ? `1px solid white` : "",
                }}
            />
            <div className={styles.text}>
                <p>
                    {decryptedName} ({tag.count})
                </p>
            </div>
            {selected && (
                <div className={styles.cog}>
                    <FaCog
                        onClick={(e) => {
                            e.stopPropagation();
                            openTagSlideover();
                        }}
                    />
                </div>
            )}
        </div>
    );
};

const DesktopSidebar = ({
    tags,
    cryptoKey,
    onTagClick,
    openTagSlideover,
    setSelectedTagOutside,
}: {
    tags: Tag[];
    cryptoKey: CryptoKey;
    onTagClick: (tag: Tag) => void;
    openTagSlideover: (tag: Tag) => void;
    setSelectedTagOutside: Dispatch<SetStateAction<Tag>>;
}) => {
    const [selectedTag, setSelectedTag] = useState<number>(0);

    return (
        <>
            <div className={styles.parent}>
                <h2>Tags</h2>
                <div className={styles.items}>
                    {tags.map((tag) => (
                        <DesktopTag
                            selected={selectedTag === tag.id}
                            onClick={() => {
                                if (selectedTag === tag.id) {
                                    setSelectedTag(0);
                                } else {
                                    setSelectedTag(tag.id);
                                }

                                onTagClick(tag);
                            }}
                            key={tag.id}
                            tag={tag}
                            cryptoKey={cryptoKey}
                            openTagSlideover={() => {
                                setSelectedTagOutside(tag);
                                openTagSlideover(tag);
                            }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default DesktopSidebar;
