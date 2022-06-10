import Tag from "../components/Tag";
import styles from "../styles/Home.module.scss";

import Check from "../components/Check"

const Home = () => {
    return (
        <>
            <div className={styles.parent}>
                <h1>Home</h1>
                <hr />
                <h2>Tags</h2>
                <div className={styles.tags}>
                    <Tag
                        selected={true}
                        name="Garden"
                        color="#84FFB5"
                        count={4}
                    />
                    <Tag
                        selected={false}
                        name="Garden"
                        color="#84FFB5"
                        count={4}
                    />
                    <Tag
                        selected={false}
                        name="Garden"
                        color="#84FFB5"
                        count={4}
                    />
                </div>
                <h2>Recurring</h2>
                <Check selected={false} />
                <h2>Upcoming</h2>
                <h2>General</h2>
            </div>
        </>
    );
};

export default Home;
