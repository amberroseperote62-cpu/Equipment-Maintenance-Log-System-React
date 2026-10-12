import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { EquipmentList, EquipmentDetail } from "./pages/Equipment";
import { Rooms, Users } from "./pages/Admin";

function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Link to={to} className={`nav-link${active ? " active" : ""}`}>
      {children}
    </Link>
  );
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <>
      <nav className="nav">
        <div className="nav-brand">
          <div className="brand-icon">🔧</div>
          <span>EMLS</span>
        </div>
        <NavLink to="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </NavLink>
        <NavLink to="/equipment">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Equipment
        </NavLink>
        {user.role === "admin" && (
          <>
            <NavLink to="/rooms">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Rooms
            </NavLink>
            <NavLink to="/users">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Users
            </NavLink>
          </>
        )}
        <span className="grow" />
        <div className="nav-user">
          <div className="nav-user-info">
            <div className="nav-user-name">{user.name}</div>
            <div className="nav-user-role">{user.role}</div>
          </div>
          <button className="btn-ghost btn-sm" onClick={logout}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </nav>
      <main className="page">{children}</main>
    </>
  );
}

const P = (el, roles) => (
  <Protected roles={roles}>
    <Layout>{el}</Layout>
  </Protected>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={P(<Dashboard />)} />
      <Route path="/equipment" element={P(<EquipmentList />)} />
      <Route path="/equipment/:id" element={P(<EquipmentDetail />)} />
      <Route path="/rooms" element={P(<Rooms />, ["admin"])} />
      <Route path="/users" element={P(<Users />, ["admin"])} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
