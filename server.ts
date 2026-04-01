import express from "express";
import { createServer as createViteServer } from "vite";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- NEURAL CORE BRIDGE API ---

  // 1. Open Apps (Spotify, VS Code, etc.)
  app.post("/api/pc/open", (req, res) => {
    const { target } = req.body;
    console.log(`[NEURAL CORE] Opening: ${target}`);
    
    // Windows 'start' command handles protocols and apps
    exec(`start "" "${target}"`, (error) => {
      if (error) {
        console.error(`Error opening ${target}:`, error);
        return res.status(500).json({ error: "Failed to open application" });
      }
      res.json({ status: "ok", message: `Opened ${target}` });
    });
  });

  // 2. VS Code Command (Open folder and write code)
  app.post("/api/pc/vscode", (req, res) => {
    const { action, folder, filename, content } = req.body;
    console.log(`[NEURAL CORE] VS Code Action: ${action}`);

    if (action === "write_file") {
      const fullPath = path.join(process.cwd(), folder || "workspace", filename);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, content);
      
      // Open the file in VS Code
      exec(`code "${fullPath}"`, (error) => {
        if (error) {
          console.error("Error opening VS Code:", error);
          return res.status(500).json({ error: "Failed to open VS Code" });
        }
        res.json({ status: "ok", message: `File ${filename} written and opened in VS Code` });
      });
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  });

  // 3. System Info
  app.get("/api/pc/status", (req, res) => {
    res.json({
      status: "online",
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      neuralLink: "established"
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NEURAL CORE] Server running on http://localhost:${PORT}`);
    console.log(`[NEURAL CORE] PC Control Protocols: ACTIVE`);
  });
}

startServer();
