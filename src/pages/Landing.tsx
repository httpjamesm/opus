import styles from "../styles/Landing.module.scss";
import Check from "../components/Check";
import { Link } from "react-router-dom";

const Landing = () => {
    const features = [
        "End-to-end encryption",
        "Ad and tracker free",
        "Open-source",
    ];

    return (
        <>
            <div className={styles.parent}>
                <div className={styles.container}>
                    <h1 className={styles.headliner}>Opus</h1>
                    <h2 className={styles.subtitle}>
                        Get stuff done securely.
                    </h2>
                    <div className={styles.features}>
                        {features.map((feature) => (
                            <div className={styles.item}>
                                <Check selected={true} />
                                <p className={styles.text}>{feature}</p>
                            </div>
                        ))}
                    </div>
                    <Link to="/register">
                        <button className={styles.bigButton}>
                            Get Started
                        </button>
                    </Link>
                    <p className={styles.metaText}>
                        Or{" "}
                        <Link to="/login">
                            <span className={styles.loginText}>login</span>
                        </Link>
                    </p>
                    <p>Made with ❤️ by <a href="https://httpjames.space" target="_blank">http.james</a> on <a href="https://github.com/httpjamesm/opus" target="_blank">GitHub</a>.</p>
                </div>
            </div>
        </>
    );
};

export default Landing;
