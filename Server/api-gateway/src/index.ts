import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const KYC_SERVICE_URL = process.env.KYC_SERVICE_URL || "http://localhost:3002";

// ─── Global Middleware ───────────────────────────────────────

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

// ─── Serve Frontend ──────────────────────────────────────────

app.use(express.static(path.join(__dirname, "../../frontend/public")));

// ─── Helper: Forward JSON requests ──────────────────────────

async function forwardJSON(serviceUrl: string, apiPath: string, req: Request, res: Response): Promise<void> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    const opts: RequestInit = { method: req.method, headers };
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      opts.body = JSON.stringify(req.body);
    }

    const upstream = await fetch(`${serviceUrl}${apiPath}`, opts);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err: any) {
    console.error(`[Gateway] Error forwarding to ${serviceUrl}${apiPath}:`, err.message);
    res.status(502).json({ error: "Upstream service unavailable." });
  }
}

// ─── Helper: Forward multipart (file upload) requests ───────

async function forwardMultipart(serviceUrl: string, apiPath: string, req: Request, res: Response): Promise<void> {
  try {
    const headers: Record<string, string> = {};
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }
    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }

    const upstream = await fetch(`${serviceUrl}${apiPath}`, {
      method: req.method,
      headers,
      body: req as any,
      duplex: "half",
    } as any);

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err: any) {
    console.error(`[Gateway] Error forwarding upload to ${serviceUrl}${apiPath}:`, err.message);
    res.status(502).json({ error: "Upstream service unavailable." });
  }
}

// ─── Auth Routes -> User Service ─────────────────────────────

app.use("/api/auth", express.json());

app.post("/api/auth/register", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/register", req, res));
app.post("/api/auth/login", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/login", req, res));
app.get("/api/auth/me", (req, res) => forwardJSON(USER_SERVICE_URL, "/api/auth/me", req, res));

// ─── KYC Routes -> KYC Service ───────────────────────────────

app.get("/api/kyc/status", express.json(), (req, res) => forwardJSON(KYC_SERVICE_URL, "/api/kyc/status", req, res));
app.post("/api/kyc/upload/national-id", (req, res) => forwardMultipart(KYC_SERVICE_URL, "/api/kyc/upload/national-id", req, res));
app.post("/api/kyc/upload/face-selfie", (req, res) => forwardMultipart(KYC_SERVICE_URL, "/api/kyc/upload/face-selfie", req, res));
app.post("/api/kyc/upload/proof-of-address", (req, res) => forwardMultipart(KYC_SERVICE_URL, "/api/kyc/upload/proof-of-address", req, res));

// ─── Health Check ────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway", upstreams: { userService: USER_SERVICE_URL, kycService: KYC_SERVICE_URL } });
});

// ─── SPA Fallback ────────────────────────────────────────────

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/public/index.html"));
});

// ─── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on port ${PORT}`);
  console.log(`  -> User Service:  ${USER_SERVICE_URL}`);
  console.log(`  -> KYC Service:   ${KYC_SERVICE_URL}`);
  console.log(`  -> Frontend:      http://localhost:${PORT}`);
});
