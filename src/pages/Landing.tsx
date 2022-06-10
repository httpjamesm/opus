import styles from "../styles/Landing.module.scss";
import Check from "../components/Check";

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
                    <button className={styles.bigButton}>Get Started</button>
                </div>
            </div>
        </>
    );
};

export default Landing;
