import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { ACTIONS, STATUSES, Pager, fmt, label } from "./util";
import DeleteModal from "../components/DeleteModal";

export function EquipmentList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const roomIdParam = searchParams.get("room_id") || "";

  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [roomId, setRoomId] = useState(roomIdParam);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setRoomId(searchParams.get("room_id") || "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    api
      .get("/rooms", { params: { all: 1 } })
      .then((r) => setRooms(r.data))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    const params = { q, page };
    if (roomId) params.room_id = roomId;
    api
      .get("/equipment", { params })
      .then((r) => setData(r.data));
  }, [q, page, roomId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post("/equipment", form);
      setForm(null);
      setMsg({ ok: "Equipment added successfully." });
      load();
    } catch (er) {
      setMsg({ err: errMsg(er) });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/equipment/${deleteTarget.id}`);
      setMsg({ ok: res.data.message });
      setDeleteTarget(null);
      load();
    } catch (er) {
      setMsg({ err: errMsg(er) });
    } finally {
      setDeleting(false);
    }
  };


  const handleRoomFilterChange = (val) => {
    setRoomId(val);
    setPage(1);
    if (val) {
      setSearchParams({ room_id: val });
    } else {
      setSearchParams({});
    }
  };

  const currentRoomName = rooms.find((r) => String(r.id) === String(roomId))?.room_name;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Equipment</h2>
          {roomId && (
            <div className="active-filter-chip" style={{ marginTop: 6 }}>
              <span>Filtered by Room: <b>{currentRoomName || `Room #${roomId}`}</b></span>
              <button
                type="button"
                onClick={() => handleRoomFilterChange("")}
                title="Clear room filter"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        {user.role === "admin" && (
          <button
            onClick={() =>
              setForm({
                room_id: roomId || rooms[0]?.id || "",
                name: "",
                property_number: "",
                category: "",
                status: "working",
              })
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add equipment
          </button>
        )}
      </div>

      <div className="toolbar" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="🔍  Search by name or property number…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          value={roomId}
          onChange={(e) => handleRoomFilterChange(e.target.value)}
          style={{ minWidth: 160 }}
          aria-label="Filter by room"
        >
          <option value="">All Rooms</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.room_name}
            </option>
          ))}
        </select>
        {roomId && (
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => handleRoomFilterChange("")}
          >
            ✕ Clear filter
          </button>
        )}
      </div>

      {msg?.ok && <div className="ok" style={{ marginBottom: 12 }}>✓ {msg.ok}</div>}
      {msg?.err && <div className="err" style={{ marginBottom: 12 }}>⚠ {msg.err}</div>}

      {form && (
        <div className="form-card">
          <div className="form-title">
            {form.id ? "Edit equipment" : "Add new equipment"}
          </div>
          <form className="grid" onSubmit={save}>
            <select
              value={form.room_id}
              onChange={(e) => setForm({ ...form, room_id: e.target.value })}
              required
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.room_name}</option>
              ))}
            </select>
            <input
              placeholder="Equipment name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Property number"
              value={form.property_number}
              onChange={(e) => setForm({ ...form, property_number: e.target.value })}
              required
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <div className="full" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit">Save equipment</button>
            </div>
          </form>
        </div>
      )}

      {!data ? (
        <div className="msg"><div className="spinner" style={{ margin: "0 auto 12px" }} />Loading…</div>
      ) : data.data.length === 0 ? (
        <div className="msg">
          {roomId ? `No equipment found in ${currentRoomName || "this room"}.` : "No equipment found."}
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Property No.</th>
                  <th>Category</th>
                  <th>Room</th>
                  <th>Status</th>
                  {user.role === "admin" && <th />}
                </tr>
              </thead>
              <tbody>
                {data.data.map((x) => (
                  <tr
                    key={x.id}
                    className="clickable-row"
                    onClick={() => navigate(`/equipment/${x.id}`)}
                    title="Click row to view details"
                  >
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--accent)" }}>{x.name}</span>
                    </td>
                    <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem", color: "var(--fg2)" }}>
                      {x.property_number}
                    </td>
                    <td style={{ color: "var(--fg2)" }}>{x.category}</td>
                    <td style={{ color: "var(--fg2)" }}>{x.room?.room_name}</td>
                    <td>
                      <span className={`badge ${x.status}`}>{label(x.status)}</span>
                    </td>
                    {user.role === "admin" && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(x);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    )}
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
        title="Delete Equipment"
        itemTitle={deleteTarget?.name}
        message={
          deleteTarget ? (
            <>
              Are you sure you want to delete{" "}
              <span className="delete-highlight">{deleteTarget.name}</span> (#{deleteTarget.property_number})?
              If this equipment has maintenance history, it will be safely marked as disposed instead.
            </>
          ) : null
        }
        confirmText="Delete Equipment"
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}

export function EquipmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [e, setE] = useState(null);
  const [msg, setMsg] = useState(null);
  const [log, setLog] = useState({
    action_type: "cleaned",
    description: "",
    logged_at: "",
    equipment_status: "",
  });

  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);

  const load = useCallback(
    () =>
      api
        .get(`/equipment/${id}`)
        .then((r) => setE(r.data))
        .catch((er) => setMsg({ err: errMsg(er) })),
    [id],
  );
  useEffect(() => { load(); }, [load]);

  const run = async (fn, ok) => {
    try {
      await fn();
      setMsg({ ok });
      load();
    } catch (er) {
      setMsg({ err: errMsg(er) });
    }
  };

  const addLog = async (ev) => {
    ev.preventDefault();
    const b = { ...log, equipment_id: id };
    if (!b.logged_at) delete b.logged_at;
    if (!b.equipment_status) delete b.equipment_status;
    await run(() => api.post("/logs", b), "Log entry recorded.");
    setLog((prev) => ({ ...prev, description: "" }));
  };

  const handleConfirmVoid = async (ev) => {
    ev.preventDefault();
    if (!voidTarget || !voidReason.trim()) return;
    setVoiding(true);
    try {
      await api.patch(`/logs/${voidTarget.id}/void`, { void_reason: voidReason.trim() });
      setMsg({ ok: "Log entry voided." });
      setVoidTarget(null);
      setVoidReason("");
      load();
    } catch (er) {
      setMsg({ err: errMsg(er) });
    } finally {
      setVoiding(false);
    }
  };

  if (!e)
    return (
      <p className={msg?.err ? "err" : "msg"} style={{ marginTop: 40 }}>
        {msg?.err || "Loading equipment…"}
      </p>
    );

  return (
    <>
      <Link to="/equipment" className="back-link">
        ← Back to equipment
      </Link>

      <div className="page-header">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            {e.name}
            <span className={`badge ${e.status}`}>{label(e.status)}</span>
          </h2>
          <div className="detail-meta">
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem" }}>
              #{e.property_number}
            </span>
            <span className="sep">·</span>
            <span>{e.category}</span>
            <span className="sep">·</span>
            <Link
              to={`/equipment?room_id=${e.room_id}`}
              style={{ color: "inherit", textDecoration: "underline" }}
              title="View all equipment in this room"
            >
              {e.room?.room_name}{e.room?.building ? `, ${e.room.building}` : ""}
            </Link>
          </div>
        </div>
      </div>

      {msg?.ok && <div className="ok" style={{ marginBottom: 16 }}>✓ {msg.ok}</div>}
      {msg?.err && <div className="err" style={{ marginBottom: 16 }}>⚠ {msg.err}</div>}

      {["admin", "technician"].includes(user.role) && (
        <div className="form-card">
          <div className="form-title">📋 Record maintenance</div>
          <form className="grid" onSubmit={addLog}>
            <select
              value={log.action_type}
              onChange={(x) => setLog({ ...log, action_type: x.target.value })}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{label(a)}</option>
              ))}
            </select>
            <input
              placeholder="What was done? (description)"
              value={log.description}
              onChange={(x) => setLog({ ...log, description: x.target.value })}
              required
            />
            <input
              type="datetime-local"
              title="Leave blank to use current time"
              value={log.logged_at}
              onChange={(x) => setLog({ ...log, logged_at: x.target.value })}
            />
            <select
              value={log.equipment_status}
              onChange={(x) => setLog({ ...log, equipment_status: x.target.value })}
            >
              <option value="">Keep current status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{label(s)}</option>
              ))}
            </select>
            <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit">Save log entry</button>
            </div>
          </form>
        </div>
      )}

      <div className="section-header" style={{ marginTop: 28 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span className="section-title">History timeline</span>
      </div>

      {e.logs.length === 0 ? (
        <div className="msg">No maintenance history for this equipment yet.</div>
      ) : (
        <ul className="timeline">
          {e.logs.map((l) => (
            <li key={l.id} className={l.is_voided ? "void" : ""}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <b>{label(l.action_type)}</b>
                  <span style={{ color: "var(--fg2)", margin: "0 8px" }}>—</span>
                  <span style={{ color: "var(--fg)", fontSize: "0.875rem" }}>{l.description}</span>
                  <div style={{ marginTop: 4 }}>
                    <small>{l.user?.name} · {fmt(l.logged_at)}</small>
                  </div>
                  {l.is_voided && (
                    <div className="void-note">
                      VOIDED by {l.voider?.name}: {l.void_reason}
                    </div>
                  )}
                </div>
                {user.role === "admin" && !l.is_voided && (
                  <button
                    className="btn-danger btn-sm action-btn"
                    style={{ flexShrink: 0 }}
                    onClick={() => {
                      setVoidTarget(l);
                      setVoidReason("");
                    }}
                  >
                    Void
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {voidTarget && (
        <div
          className="modal-backdrop"
          onClick={() => !voiding && setVoidTarget(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleConfirmVoid}>
              <div className="delete-dialog-top">
                <div className="delete-dialog-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </div>
                <div className="delete-dialog-heading">
                  <h3>Void Log Entry</h3>
                  <p className="delete-dialog-desc">
                    Voiding invalidates this entry while permanently retaining it in the audit history.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <input
                  placeholder="Reason for voiding (required)…"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  required
                  minLength={3}
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>

              <div className="delete-dialog-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setVoidTarget(null)}
                  disabled={voiding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={voiding || !voidReason.trim()}
                >
                  {voiding ? (
                    <>
                      <span className="spinner-inline" /> Voiding…
                    </>
                  ) : (
                    "Void Entry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
