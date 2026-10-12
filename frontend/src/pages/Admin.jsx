import { useCallback, useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { Pager } from "./util";

function useList(url, params) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const paramsKey = JSON.stringify(params);
  const load = useCallback(
    () =>
      api
        .get(url, { params: { ...params, page } })
        .then((r) => setData(r.data)),
    [url, page, paramsKey], // eslint-disable-line
  );
  useEffect(() => { load(); }, [load]);
  return { data, load, page, setPage };
}

function Msg({ m }) {
  if (!m) return null;
  return (
    <div className={m.err ? "err" : "ok"} style={{ marginBottom: 12 }}>
      {m.err ? "⚠ " : "✓ "}{m.err || m.ok}
    </div>
  );
}

export function Rooms() {
  const { data, load, setPage } = useList("/rooms");
  const [form, setForm] = useState(null);
  const [ics, setIcs] = useState([]);
  const [m, setM] = useState(null);

  useEffect(() => {
    api.get("/users", { params: { role: "incharge", all: 1 } }).then((r) => setIcs(r.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      form.id
        ? await api.put(`/rooms/${form.id}`, form)
        : await api.post("/rooms", form);
      setForm(null);
      setM({ ok: "Room saved successfully." });
      load();
    } catch (er) {
      setM({ err: errMsg(er) });
    }
  };

  const del = async (r) => {
    if (!confirm(`Delete room "${r.room_name}"?`)) return;
    try {
      await api.delete(`/rooms/${r.id}`);
      setM({ ok: "Room deleted." });
      load();
    } catch (er) {
      setM({ err: errMsg(er) });
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Rooms</h2>
        <button onClick={() => setForm({ room_name: "", building: "", floor: "", in_charge_id: "" })}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add room
        </button>
      </div>

      <Msg m={m} />

      {form && (
        <div className="form-card">
          <div className="form-title">{form.id ? "Edit room" : "Add new room"}</div>
          <form className="grid" onSubmit={save}>
            <input
              placeholder="Room name"
              value={form.room_name}
              onChange={(e) => setForm({ ...form, room_name: e.target.value })}
              required
            />
            <input
              placeholder="Building"
              value={form.building}
              onChange={(e) => setForm({ ...form, building: e.target.value })}
              required
            />
            <input
              placeholder="Floor (optional)"
              value={form.floor || ""}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
            />
            <select
              value={form.in_charge_id || ""}
              onChange={(e) => setForm({ ...form, in_charge_id: e.target.value || null })}
            >
              <option value="">No in-charge assigned</option>
              {ics.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <div className="full" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit">Save room</button>
            </div>
          </form>
        </div>
      )}

      {!data ? (
        <div className="msg"><div className="spinner" style={{ margin: "0 auto 12px" }} />Loading…</div>
      ) : data.data.length === 0 ? (
        <div className="msg">No rooms added yet.</div>
      ) : (
        <div className="table-wrapper">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Room name</th>
                  <th>Building</th>
                  <th>Floor</th>
                  <th>In-charge</th>
                  <th>Equipment count</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.room_name}</td>
                    <td style={{ color: "var(--fg2)" }}>{r.building}</td>
                    <td style={{ color: "var(--fg2)" }}>{r.floor || "—"}</td>
                    <td style={{ color: r.in_charge ? "var(--fg)" : "var(--fg3)" }}>
                      {r.in_charge?.name || "—"}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--accent)" }}>{r.equipment_count}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-ghost btn-sm" onClick={() => { setForm(r); setM(null); }}>Edit</button>
                        <button className="btn-danger btn-sm" onClick={() => del(r)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pager meta={data} onPage={setPage} />
    </>
  );
}

export function Users() {
  const { data, load, setPage } = useList("/users");
  const [form, setForm] = useState(null);
  const [m, setM] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    try {
      form.id
        ? await api.put(`/users/${form.id}`, form)
        : await api.post("/users", form);
      setForm(null);
      setM({ ok: "User saved successfully." });
      load();
    } catch (er) {
      setM({ err: errMsg(er) });
    }
  };

  const del = async (u) => {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      setM({ ok: "User deleted." });
      load();
    } catch (er) {
      setM({ err: errMsg(er) });
    }
  };

  const ROLE_COLORS = { admin: "purple", technician: "yellow", incharge: "green" };
  const roleStyle = (role) => ({
    admin: { background: "rgba(188,140,255,0.12)", color: "#bc8cff", border: "1px solid rgba(188,140,255,0.25)" },
    technician: { background: "rgba(210,153,34,0.12)", color: "#d29922", border: "1px solid rgba(210,153,34,0.25)" },
    incharge: { background: "rgba(63,185,80,0.12)", color: "#3fb950", border: "1px solid rgba(63,185,80,0.25)" },
  }[role] || {});

  return (
    <>
      <div className="page-header">
        <h2>Users</h2>
        <button
          onClick={() => setForm({ name: "", email: "", password: "", role: "technician", status: "active" })}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add user
        </button>
      </div>

      <Msg m={m} />

      {form && (
        <div className="form-card">
          <div className="form-title">{form.id ? "Edit user" : "Add new user"}</div>
          <form className="grid" onSubmit={save}>
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder={form.id ? "New password (leave blank to keep)" : "Password (min 8 chars)"}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="technician">Technician</option>
              <option value="incharge">In-charge</option>
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="full" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit">Save user</button>
            </div>
          </form>
        </div>
      )}

      {!data ? (
        <div className="msg"><div className="spinner" style={{ margin: "0 auto 12px" }} />Loading…</div>
      ) : (
        <div className="table-wrapper">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ color: "var(--fg2)", fontSize: "0.875rem" }}>{u.email}</td>
                    <td>
                      <span
                        style={{
                          ...roleStyle(u.role),
                          display: "inline-block",
                          padding: "2px 10px",
                          borderRadius: 99,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: u.status === "active" ? "var(--green)" : "var(--fg3)",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: u.status === "active" ? "var(--green)" : "var(--fg3)",
                          }}
                        />
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-ghost btn-sm" onClick={() => { setForm({ ...u, password: "" }); setM(null); }}>
                          Edit
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => del(u)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pager meta={data} onPage={setPage} />
    </>
  );
}
