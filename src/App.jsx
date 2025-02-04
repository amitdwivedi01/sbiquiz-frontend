import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./AdminPanel";
import UserPanel from "./UserPanel";
import AuthForm from "./components/AuthForm";
import HomePage from "./components/HomePage";
import Leaderboard from "./components/Leaderboard";
import logo from "./assets/sbi logo.png";
import { Toaster } from "react-hot-toast";

const App = () => {
  const host = "https://sbiquiz.onrender.com";
  // const host = "http://localhost:4000";
  return (
    <Router>
      <Toaster />
      <div>
        <div className="bg-white h-[7vh]">
          <img src={logo} className=" h-full p-3 float-right" alt="" />
        </div>

        <Routes>
          <Route path="/admin" element={<AdminPanel host={host} />} />
          <Route path="/quiz" element={<UserPanel host={host} />} />
          <Route path="/" element={<AuthForm host={host} />} />
          <Route path="/home" element={<HomePage host={host} />} />
          <Route
            path="/leaderboard/:type/:id"
            element={<Leaderboard host={host} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
