# Equipment Maintenance Log System (EMLS)

A full-stack Equipment Maintenance and Logging System built with **React** and **Laravel**. Designed for institutions, laboratories, and offices to monitor equipment status, track room assignments, maintain append-only maintenance histories, and manage role-based user permissions.

---

## 🚀 Features

- **Role-Based Access Control (RBAC)**:
  - **Admin (Custodian)**: Full system access — manage equipment, rooms, users, record maintenance logs, and void invalid entries.
  - **Technician**: View equipment and record maintenance activity logs.
  - **Room In-Charge (Faculty)**: View equipment located in their assigned rooms.

- **Equipment Management**:
  - Track property numbers, categories, rooms, and real-time statuses (`Working`, `Under Repair`, `Needs Replacement`, `Disposed`).
  - Search by equipment name or property number.
  - Filter equipment directly by room with quick filter badges and dropdown selectors.
  - Safe deletion: Equipment with prior maintenance history is preserved and marked as `Disposed` rather than deleted.

- **Room Tracking**:
  - Manage rooms, buildings, floors, and assigned in-charge faculty.
  - **Clickable Row Navigation**: Click anywhere on a room row to view all equipment assigned to that room.

- **Append-Only Maintenance Logs & Audit Trail**:
  - Log maintenance actions: `Cleaned`, `Repaired`, `Modified`, `Inspected`, `Part Replaced`.
  - Non-destructive voiding: Inaccurate logs cannot be erased — admins can void them with a stated reason while keeping the audit trail intact.

- **Modern & Modular Frontend**:
  - Full-row click interactions across rooms, equipment, and dashboard logs.
  - Clean, custom **Delete Confirmation Dialog** with safety warnings and loading states.
  - Well-structured, modular CSS architecture located in `frontend/src/styles/`.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React (Vite)
  - React Router DOM
  - Axios
  - Modular CSS (Design tokens, glassmorphism, dark theme)
- **Backend**:
  - Laravel (PHP 8.2+)
  - Laravel Sanctum (Token-based Authentication)
  - SQLite / MySQL

---

## 👥 Default Demo Accounts

After running the database seeders, the following accounts are available for testing:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin (Custodian)** | `admin@example.com` | `password` | Full system control |
| **Technician** | `tech@example.com` | `password` | View equipment, log maintenance |
| **Room In-Charge** | `faculty@example.com` | `password` | View assigned room equipment |

---

## 📦 Project Structure

```text
equipment-maintenance-system/
├── backend/                   # Laravel REST API Backend
│   ├── app/
│   │   ├── Http/Controllers/ # Auth, Equipment, Log, Room, User Controllers
│   │   └── Models/            # Equipment, EquipmentLog, Room, User
│   ├── database/
│   │   ├── migrations/        # Database schema migrations
│   │   └── seeders/           # Initial demo data (DatabaseSeeder.php)
│   └── routes/
│       └── api.php            # REST API endpoints
│
└── frontend/                  # React Frontend Application
    ├── src/
    │   ├── components/        # Reusable UI components (DeleteModal.jsx)
    │   ├── pages/             # Login, Dashboard, Equipment, Admin pages
    │   ├── styles/            # Modular stylesheets
    │   │   ├── index.css      # Master CSS entry point
    │   │   ├── variables.css  # Colors, typography, design tokens
    │   │   ├── base.css       # Core layout and utility styles
    │   │   ├── navbar.css     # Navigation bar styles
    │   │   ├── buttons.css    # Inputs, buttons, pagers
    │   │   ├── tables.css     # Tables, badges, clickable rows
    │   │   ├── delete-dialog.css # Confirmation modal styles
    │   │   ├── dashboard.css  # Stats and recent logs
    │   │   ├── equipment.css  # Equipment details and timeline
    │   │   ├── admin.css      # Admin management styles
    │   │   └── login.css      # Authentication styles
    │   ├── App.jsx            # Main route configuration
    │   ├── AuthContext.jsx    # Authentication provider & state
    │   └── main.jsx           # App entry point
    └── package.json
```

---

## ⚡ Getting Started

### Prerequisites
- **PHP** >= 8.2 with Composer
- **Node.js** >= 18 with npm

---

### 1. Backend Setup (Laravel API)

```bash
# Navigate to the backend directory
cd backend

# Install PHP dependencies
composer install

# Set up the environment file
cp .env.example .env
php artisan key:generate

# Run database migrations and seed default data
php artisan migrate:fresh --seed

# Start the Laravel backend server
php artisan serve --port=8000
```

The API will now be accessible at `http://localhost:8000`.

---

### 2. Frontend Setup (React / Vite)

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install JavaScript dependencies
npm install

# Start the development server
npm run dev
```

The application will be running at `http://localhost:5174` (or the port specified in terminal output).

---

## 📡 Key API Endpoints

### Authentication
- `POST /api/login` — Authenticate and receive Sanctum token
- `POST /api/logout` — Revoke token
- `GET  /api/me` — Get authenticated user details

### Equipment & Logs
- `GET  /api/equipment` — List paginated equipment (filters: `q`, `room_id`, `status`)
- `GET  /api/equipment/{id}` — Equipment details with timeline logs
- `POST /api/equipment` — Create equipment (Admin)
- `POST /api/logs` — Record a maintenance log entry (Admin, Technician)
- `PATCH /api/logs/{log}/void` — Void a log entry with stated reason (Admin)

### Rooms & Users
- `GET  /api/rooms` — List rooms with equipment counts
- `POST /api/rooms` — Create room (Admin)
- `GET  /api/users` — List system users (Admin)
- `POST /api/users` — Register a new user with role (Admin)

---

## 📚 References

The following external sources, documentation, community discussions, and AI tools were consulted and referenced during the development of this project:

### 1. Artificial Intelligence (AI) Assistance
- **Google DeepMind Antigravity / Gemini**:
  - Code generation, scaffolding, and refactoring for Laravel REST API controllers (`DashboardController.php`, `EquipmentController.php`, `LogController.php`).
  - Frontend component structure and state management for React (role-based dashboard analytics, custom `DeleteModal.jsx` confirmation dialog, and dynamic query filtering).
  - Modular CSS design token architecture (`variables.css`, `base.css`, dark theme, and glassmorphism styling).

### 2. Documentation & Official Guides
- **Laravel**:
  - [Laravel Official Documentation](https://laravel.com/docs) — Eloquent ORM relationships, database migrations, and RESTful routing.
  - [Laravel Sanctum](https://laravel.com/docs/sanctum) — Token-based SPA/API authentication and middleware guards.
- **React & React Router**:
  - [React Documentation](https://react.dev/) — Component lifecycle, hooks (`useState`, `useEffect`, `useContext`), and form handling.
  - [React Router DOM](https://reactrouter.com/) — Declarative routing, protected route guards, and URL search parameters (`useSearchParams`).
- **Axios**:
  - [Axios HTTP Client Documentation](https://axios-http.com/) — Global API client instance configuration and HTTP authorization header interceptors.
- **Typography & Styling**:
  - [Google Fonts](https://fonts.google.com/) — Inter and JetBrains Mono typefaces.
  - [MDN Web Docs - CSS Layout](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout) — Flexbox and Grid responsive table layouts.

### 3. Stack Overflow & Community Discussions
- **Authentication & Persistence**:
  - Best practices for persistent client-side authentication token handling with React Context and `localStorage`.
- **UI & Modal Patterns**:
  - Accessible modal dialog implementations with click-outside detection and backdrop blur overlays.
  - Full-row clickable table patterns preserving inner action button event propagation.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

