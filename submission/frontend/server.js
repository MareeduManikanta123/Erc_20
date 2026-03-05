import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");

function escapeForJs(value) {
  return JSON.stringify(String(value || ""));
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(
    `window.__APP_CONFIG__ = {
  VITE_RPC_URL: ${escapeForJs(process.env.VITE_RPC_URL)},
  VITE_TOKEN_ADDRESS: ${escapeForJs(process.env.VITE_TOKEN_ADDRESS)},
  VITE_FAUCET_ADDRESS: ${escapeForJs(process.env.VITE_FAUCET_ADDRESS)}
};`
  );
});

app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Frontend ready on port ${port}`);
});
