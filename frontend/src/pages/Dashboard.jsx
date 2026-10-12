import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { fmt } from "./util";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [d, setD] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((r) => setD(r.data));
  }, []);

  if (!d)
    return (
      <div className="msg" style={{ paddingTop: 80 }}>
        <div className="spinner" style={{ margin: "0 auto 12px" }} />
        Loading dashboard…
      </div>
    );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleStatClick = (key) => {
    if (key.toLowerCase().includes("room")) {
      navigate("/rooms");
    } else {
      navigate("/equipment");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>
            {greeting()}, {user.name.split(" ")[0]} 👋
          </h2>
          <p style={{ color: "var(--fg2)", fontSize: "0.875rem", marginTop: 2 }}>
            Here's your maintenance overview for today.
          </p>
        </div>
      </div>

      <div className="stats">
        {Object.entries(d.stats)
          .filter(
            ([k]) =>
              !k.toLowerCase().includes("under repair") &&
              !k.toLowerCase().includes("replacement") &&
              !k.toLowerCase().includes("attention")
          )
          .map(([k, v]) => (
            <div
              className="stat"
              key={k}
              onClick={() => handleStatClick(k)}
              style={{ cursor: "pointer" }}
              title={`View ${k}`}
            >
              <b>{v}</b>
              <span>{k}</span>
            </div>
          ))}
      </div>

      <div className="section-header" style={{ marginTop: 32 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span className="section-title">Recent log entries</span>
      </div>

      {d.recent_logs.length === 0 ? (
        <div className="msg">No log entries yet.</div>
      ) : (
        <div className="logs-card">
          <ul className="plain" style={{ margin: 0 }}>
            {d.recent_logs.map((l) => (
              <li
                key={l.id}
                className={l.is_voided ? "void" : ""}
                onClick={() => l.equipment_id && navigate(`/equipment/${l.equipment_id}`)}
                style={{ cursor: "pointer", transition: "background 0.15s ease" }}
                title="Click to view equipment"
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <b style={{ color: "var(--accent)", fontSize: "0.875rem" }}>{l.equipment?.name}</b>
                    <span style={{ color: "var(--fg3)", margin: "0 6px" }}>·</span>
                    <span style={{ color: "var(--fg2)", textTransform: "capitalize" }}>
                      {l.action_type.replaceAll("_", " ")}
                    </span>
                    <div style={{ color: "var(--fg2)", fontSize: "0.8125rem", marginTop: 3 }}>
                      {l.description}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "var(--fg3)", fontSize: "0.75rem" }}>{l.user?.name}</div>
                    <div style={{ color: "var(--fg3)", fontSize: "0.75rem" }}>{fmt(l.logged_at)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
