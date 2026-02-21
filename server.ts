import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("platform.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT NOT NULL,
    grade TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, allowed, locked, blocked
    subscription_days INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value INTEGER DEFAULT 0
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', '10012002');
  INSERT OR IGNORE INTO stats (key, value) VALUES ('visitors', 0);
  INSERT OR IGNORE INTO stats (key, value) VALUES ('lessons_watched', 0);
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to track visitors
  app.use((req, res, next) => {
    if (req.path === '/' && !req.path.startsWith('/api')) {
      db.prepare("UPDATE stats SET value = value + 1 WHERE key = 'visitors'").run();
    }
    next();
  });

  // --- API Routes ---

  // Student Registration
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, phone, grade } = req.body;
    try {
      const info = db.prepare(
        "INSERT INTO users (name, email, password, phone, grade) VALUES (?, ?, ?, ?, ?)"
      ).run(name, email, password, phone, grade);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Student Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    
    if (!user) {
      return res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: "حسابك قيد المراجعة، يرجى التواصل مع الإدارة للتفعيل" });
    }
    if (user.status === 'locked') {
      return res.status(403).json({ success: false, message: "تم إقفال حسابك مؤقتاً" });
    }
    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: "تم حظر حسابك نهائياً" });
    }

    if (user.subscription_days <= 0) {
      return res.status(403).json({ success: false, message: "انتهى اشتراكك، يرجى التواصل مع الإدارة للتجديد" });
    }

    res.json({ success: true, user });
  });

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPass = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get() as any;
    
    if (password === adminPass.value) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "الرمز السري للإدارة غير صحيح" });
    }
  });

  // Admin: Get Members
  app.get("/api/admin/members", (req, res) => {
    const members = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
    res.json(members);
  });

  // Admin: Update Member Status
  app.post("/api/admin/members/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  // Admin: Update Subscription Days
  app.post("/api/admin/members/:id/subscription", (req, res) => {
    const { id } = req.params;
    const { days } = req.body;
    db.prepare("UPDATE users SET subscription_days = ? WHERE id = ?").run(days, id);
    res.json({ success: true });
  });

  // Admin: Change Password
  app.post("/api/admin/settings/password", (req, res) => {
    const { newPassword } = req.body;
    db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(newPassword);
    res.json({ success: true });
  });

  // Admin: Get Stats
  app.get("/api/admin/stats", (req, res) => {
    const stats = db.prepare("SELECT * FROM stats").all();
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    res.json({ stats, totalUsers: totalUsers.count });
  });

  // Track Lesson Watch
  app.post("/api/stats/lesson-watch", (req, res) => {
    db.prepare("UPDATE stats SET value = value + 1 WHERE key = 'lessons_watched'").run();
    res.json({ success: true });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
