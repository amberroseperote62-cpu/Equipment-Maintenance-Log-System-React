import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../AuthContext";
import { Pager, fmt, label } from "./util";

export default function Requests() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [techs, setTechs] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = useCallback(
    () =>
      api
        .get("/repair-requests", { params: { page, status } })
        .then((r) => setData(r.data)),
    [page, status],
  );
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (user.role === "admin")
      api.get("/users", { params: { role: "technician", all: 1 } }).then((r) => setTechs(r.data));
  }, [user.role]);

  const act = async (fn, ok) => {
    try {
      await fn();
      setMsg({ ok });
      load();
    } catch (er) {
      setMsg({ err: errMsg(er) });
    }
  };

  const STATUS_COLORS = {
    pending: "red",
    assigned: "yellow",
    in_progress: "yellow",
    resolved: "green",
  };

  return (
    <>
      <div className="page-header">
        <h2>Repair Requests</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ color: "var(--fg2)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
            Filter by status:
          </label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ width: "auto" }}
          >
            <option value="">All statuses</option>
            {["pending", "assigned", "in_progress", "resolved"].map((s) => (
              <option key={s} value={s}>{label(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {msg?.ok && <div className="ok" style={{ marginBottom: 12 }}>✓ {msg.ok}</div>}
      {msg?.err && <div className="err" style={{ marginBottom: 12 }}>⚠ {msg.err}</div>}

      {!data ? (
        <div className="msg"><div className="spinner" style={{ margin: "0 auto 12px" }} />Loading…</div>
      ) : data.data.length === 0 ? (
        <div className="msg">No repair requests found.</div>
      ) : (
        <div className="table-wrapper">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Problem description</th>
                  <th>Reported by</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/equipment/${r.equipment_id}`} style={{ fontWeight: 500 }}>
                        {r.equipment?.name}
                      </Link>
                    </td>
                    <td>
                      <div style={{ color: "var(--fg)", maxWidth: 260, fontSize: "0.875rem" }}>
                        {r.description}
                      </div>
                      <small style={{ color: "var(--fg3)" }}>{fmt(r.created_at)}</small>
                    </td>
                    <td style={{ color: "var(--fg2)" }}>{r.reporter?.name}</td>
                    <td>
                      {user.role === "admin" && r.status !== "resolved" ? (
                        <select
                          value={r.assigned_to || ""}
                          onChange={(e) =>
                            act(
                              () => api.patch(`/repair-requests/${r.id}/assign`, { assigned_to: e.target.value }),
                              "Technician assigned.",
                            )
                          }
                          style={{ fontSize: "0.8125rem", padding: "6px 10px" }}
                        >
                          <option value="" disabled>Assign technician…</option>
                          {techs.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ color: r.technician ? "var(--fg)" : "var(--fg3)" }}>
                          {r.technician?.name || "—"}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${r.status}`}>{label(r.status)}</span>
                    </td>
                    <td>
                      {user.role === "admin" && r.status !== "resolved" && (
                        <button
                          className="btn-success btn-sm"
                          onClick={() =>
                            confirm("Mark this request as resolved?") &&
                            act(() => api.patch(`/repair-requests/${r.id}/resolve`), "Marked as resolved.")
                          }
                        >
                          ✓ Resolve
                        </button>
                      )}
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
