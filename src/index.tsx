import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";

import "./index.css";

import Register from "./pages/Register";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    </BrowserRouter>
);
