import { useState } from "react";

const API = "http://localhost:5000/api";

export default function Register({ onRegistered }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // VULN: client lets you request admin at signup
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // VULN: sending isAdmin straight through — backend mass-assigns it (see backend/routes/auth.js)
      body: JSON.stringify({ username, password, isAdmin }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Registered! You can now log in.");
      onRegistered && onRegistered();
    } else {
      setMessage(data.error || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <label>
        <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
        Register as admin (VULN: try this!)
      </label>
      <button type="submit">Register</button>
      <p>{message}</p>
    </form>
  );
}
