import { useState } from "react";
import Check from "src/components/Check";
import styles from "src/styles/Prefs.module.scss";

import { AiOutlineReload } from "react-icons/ai";

const Theme = () => {
    const [theme, setTheme] = useState<boolean>(
        window.localStorage.getItem("theme") === "dark"
    );

    const [themeChanged, setThemeChanged] = useState<boolean>(false);

    return (
        <>
            <h3 className={styles.heading}>theme</h3>
            <hr />
            <div className={styles.group}>
                <Check
                    selected={theme}
                    onClick={() => {
                        setTheme(!theme);
                        window.localStorage.setItem(
                            "theme",
                            theme ? "light" : "dark"
                        );
                        setThemeChanged(!themeChanged);
                    }}
                />
                <span>Dark Theme</span>
            </div>
            {themeChanged && (
                <p
                    className={styles.action}
                    onClick={() => {
                        window.location.reload();
                    }}
                >
                    <AiOutlineReload />
                    Reload to see changes
                </p>
            )}
        </>
    );
};

export default Theme;
