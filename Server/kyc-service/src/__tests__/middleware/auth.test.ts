import jwt from "jsonwebtoken";
import { authenticate, AuthenticatedRequest, JwtPayload } from "../../middleware/auth";
import { Response, NextFunction } from "express";

// ─── Test helpers ────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function mockResponse(): Response {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis() as any,
    json: jest.fn().mockReturnThis() as any,
  };
  return res as Response;
}

function mockNext(): NextFunction {
  return jest.fn();
}

// ─── Tests ───────────────────────────────────────────────────

describe("KYC Service — authenticate middleware", () => {
  test("rejects request with no Authorization header", () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("No token") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects request with an invalid JWT", () => {
    const req = { headers: { authorization: "Bearer bad.jwt.token" } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("Invalid") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("attaches decoded user to req and calls next() for valid token", () => {
    const payload: JwtPayload = { id: 5, email: "kyc@credify.com" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.id).toBe(5);
    expect(req.user!.email).toBe("kyc@credify.com");
  });

  test("rejects an expired token", () => {
    const payload: JwtPayload = { id: 1, email: "expired@credify.com" };
    // Token that expired 1 hour ago
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "-1h" });

    const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
