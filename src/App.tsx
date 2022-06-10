import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";

import Register from "./pages/Register";

import Dexie from "dexie";

import { useEffect, useState } from "react";
import Login from "./pages/Login";

const App = () => {
    const [db, setDb] = useState<Dexie>();

    const init = async () => {
        const db = new Dexie("opus");
        db.version(1).stores({
            keys: "++id, key",
        });
        db.open().catch(function (e) {
            alert("Open failed: " + e);
        });

        setDb(db);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<Register />} />
                    {/* @ts-ignore */}
                    <Route path="/login" element={<Login db={db} />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;
