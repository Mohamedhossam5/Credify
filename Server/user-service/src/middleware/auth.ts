import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface JwtPayload {
  id: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function generateToken(user: { id: number; email: string }): string {
  const payload = { id: user.id, email: user.email };
  const options: jwt.SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any };
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
}

export async function requireActiveUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: "Access denied." });
    return;
  }
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    
    if (user.is_frozen) {
      res.status(403).json({ error: "Your account is frozen. You cannot perform this action." });
      return;
    }
    
    next();
  } catch (err) {
    console.error("[requireActiveUser] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
