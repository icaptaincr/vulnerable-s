import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function Notes({ token }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchNotes = async () => {
    const res = await fetch(`${API}/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${API}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });
    setTitle("");
    setContent("");
    fetchNotes();
  };

  const handleDelete = async (id) => {
    // VULN (IDOR): this will happily delete a note that belongs to someone else,
    // because the backend never checks ownership. Try deleting a note whose
    // owner isn't you (e.g. by guessing another note's _id).
    await fetch(`${API}/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotes();
  };

  return (
    <div>
      <h2>All Notes (from every user — VULN: broken access control)</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input
          placeholder="content (try pasting <img src=x onerror=alert(1)>)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Add note</button>
      </form>

      <ul>
        {notes.map((n) => (
          <li key={n._id} style={{ marginBottom: "1em" }}>
            <strong>{n.title}</strong>
            {" — owner: "}
            {n.owner?.username}
            <div
              /* VULN (Stored XSS): note content is rendered as raw HTML instead
                 of plain text. Any user can inject a <script>/<img onerror=...>
                 payload that runs in every other user's browser when they view notes. */
              dangerouslySetInnerHTML={{ __html: n.content }}
            />
            <button onClick={() => handleDelete(n._id)}>Delete (try deleting others' notes)</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
