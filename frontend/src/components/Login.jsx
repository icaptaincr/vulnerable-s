import { useState } from "react";

const API = "http://localhost:5000/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      // VULN: JWT stored in localStorage -> readable by any injected/XSS script.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } else {
      setMessage(data.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      <p>{message}</p>
      <details>
        <summary>Try the NoSQL injection (learning exercise)</summary>
        <p>
          This form sends JSON, so a normal browser form can't trigger it — but if you
          use the browser console or a REST client to POST to <code>/api/auth/login</code> with:
        </p>
        <pre>{`{ "username": { "$ne": null }, "password": { "$ne": null } }`}</pre>
        <p>you can log in as the first user in the database without knowing any password.</p>
      </details>
    </form>
  );
}
