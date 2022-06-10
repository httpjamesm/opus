import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NewTask from "./pages/NewTask";

import Dexie from "dexie";

import { useEffect, useState } from "react";

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
                    <Route path="/home" element={<Home />} /> 
                    {/* @ts-ignore */}
                    <Route path="/newtask" element={<NewTask db={db} />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;
