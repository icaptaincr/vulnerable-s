import { useState } from "react";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Notes from "./components/Notes.jsx";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (u, t) => {
    setUser(u);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>⚠️ Vulnerable Notes App — for security learning only</h1>
      <p style={{ color: "crimson" }}>
        Do not deploy this app publicly or reuse this code in production. See README.md
        for the full list of intentional vulnerabilities.
      </p>

      {!token ? (
        <>
          {showRegister ? <Register onRegistered={() => setShowRegister(false)} /> : <Login onLogin={handleLogin} />}
          <button onClick={() => setShowRegister((s) => !s)}>
            {showRegister ? "Have an account? Log in" : "Need an account? Register"}
          </button>
        </>
      ) : (
        <>
          <p>
            Logged in as <strong>{user?.username}</strong>{" "}
            {user?.isAdmin && <span>(admin)</span>}
            <button onClick={handleLogout} style={{ marginLeft: "1em" }}>
              Logout
            </button>
          </p>
          <Notes token={token} />
        </>
      )}
    </div>
  );
}
