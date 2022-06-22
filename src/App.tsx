import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NewTask from "./pages/NewTask";
import Prefs from "./pages/Prefs";

const App = () => {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/newtask" element={<NewTask />} />
                    <Route path="/prefs" element={<Prefs />} />
                </Routes>
            </BrowserRouter>
        </>
    );
};

export default App;
