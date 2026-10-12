import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";
import { Pager } from "./util";
import DeleteModal from "../components/DeleteModal";

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

/* ── Rooms ─────────────────────────────────────────────── */
export function Rooms() {
  const navigate = useNavigate();
  const { data, load, setPage } = useList("/rooms");
  const [form, setForm] = useState(null);
  const [ics, setIcs] = useState([]);
  const [m, setM] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/rooms/${deleteTarget.id}`);
      setM({ ok: `Room "${deleteTarget.room_name}" deleted successfully.` });
      setDeleteTarget(null);
      load();
    } catch (er) {
      setM({ err: errMsg(er) });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Rooms</h2>
          <p style={{ color: "var(--fg2)", fontSize: "0.85rem", marginTop: 4 }}>
            Click any room to view all its equipment.
          </p>
        </div>
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
                  <th>Equipment</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((r) => (
                  <tr
                    key={r.id}
                    className="clickable-row"
                    onClick={() => navigate(`/equipment?room_id=${r.id}`)}
                    title="Click row to view all equipment in this room"
                  >
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, color: "var(--accent)" }}>
                        <span>{r.room_name}</span>
                        <svg
                          width="12" height="12"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          style={{ opacity: 0.6 }}
                        >
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </td>
                    <td style={{ color: "var(--fg2)" }}>{r.building}</td>
                    <td style={{ color: "var(--fg2)" }}>{r.floor || "—"}</td>
                    <td style={{ color: r.in_charge ? "var(--fg)" : "var(--fg3)" }}>
                      {r.in_charge?.name || "—"}
                    </td>
                    <td>
                      <span className="equipment-count-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        {r.equipment_count} item{r.equipment_count !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-ghost btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm(r);
                            setM(null);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(r);
                          }}
                        >
                          Delete
                        </button>
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

      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete Room"
        itemTitle={deleteTarget?.room_name}
        message={
          deleteTarget ? (
            <>
              Are you sure you want to delete room{" "}
              <span className="delete-highlight">{deleteTarget.room_name}</span>?
              {deleteTarget.equipment_count > 0 && (
                <span style={{ display: "block", marginTop: 10, color: "var(--yellow)", fontSize: "0.825rem" }}>
                  ⚠ Notice: This room currently contains {deleteTarget.equipment_count} equipment item{deleteTarget.equipment_count !== 1 ? "s" : ""}.
                </span>
              )}
            </>
          ) : null
        }
        confirmText="Delete Room"
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}

/* ── Users ─────────────────────────────────────────────── */
export function Users() {
  const { data, load, setPage } = useList("/users");
  const [form, setForm] = useState(null);
  const [m, setM] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setM({ ok: `User "${deleteTarget.name}" deleted successfully.` });
      setDeleteTarget(null);
      load();
    } catch (er) {
      setM({ err: errMsg(er) });
    } finally {
      setDeleting(false);
    }
  };

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
              placeholder={form.id ? "Password (leave blank to keep unchanged)" : "Password"}
              value={form.password || ""}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!form.id}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="technician">Technician</option>
              <option value="incharge">Room in-charge</option>
              <option value="admin">Admin</option>
            </select>
            {form.id && (
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            )}
            <div className="full" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit">Save user</button>
            </div>
          </form>
        </div>
      )}

      {!data ? (
        <div className="msg"><div className="spinner" style={{ margin: "0 auto 12px" }} />Loading…</div>
      ) : data.data.length === 0 ? (
        <div className="msg">No users found.</div>
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
                    <td style={{ fontWeight: 500, color: "var(--fg)" }}>{u.name}</td>
                    <td style={{ color: "var(--fg2)" }}>{u.email}</td>
                    <td>
                      <span className="badge" style={roleStyle(u.role)}>
                        {u.role === "incharge" ? "In-charge" : u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.8125rem",
                        color: u.status === "active" ? "var(--green)" : "var(--fg3)",
                      }}>
                        <span style={{
                          width: 6, height: 6,
                          borderRadius: "50%",
                          background: u.status === "active" ? "var(--green)" : "var(--fg3)",
                        }} />
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-ghost btn-sm" onClick={() => { setForm(u); setM(null); }}>Edit</button>
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => setDeleteTarget(u)}
                        >
                          Delete
                        </button>
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

      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete User"
        itemTitle={deleteTarget?.name}
        message={
          deleteTarget ? (
            <>
              Are you sure you want to delete user{" "}
              <span className="delete-highlight">{deleteTarget.name}</span> ({deleteTarget.email})?
              They will no longer have access to the system.
            </>
          ) : null
        }
        confirmText="Delete User"
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
