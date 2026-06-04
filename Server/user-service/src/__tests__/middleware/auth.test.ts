import jwt from "jsonwebtoken";
import { authenticate, generateToken, requireActiveUser, AuthenticatedRequest, JwtPayload } from "../../middleware/auth";
import { Request, Response, NextFunction } from "express";

// ─── Mock the User model (it accesses the DB) ───────────────
jest.mock("../../models/User", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

import User from "../../models/User";
const mockedUser = User as jest.Mocked<typeof User>;

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

// ─── authenticate ────────────────────────────────────────────

describe("authenticate middleware", () => {
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

  test("rejects request with malformed Authorization header (no Bearer prefix)", () => {
    const req = { headers: { authorization: "Token abc123" } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects request with an invalid JWT token", () => {
    const req = { headers: { authorization: "Bearer invalid.token.here" } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("Invalid") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("attaches decoded payload to req.user and calls next() for valid token", () => {
    const payload: JwtPayload = { id: 42, email: "test@credify.com" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.id).toBe(42);
    expect(req.user!.email).toBe("test@credify.com");
  });
});

// ─── generateToken ───────────────────────────────────────────

describe("generateToken", () => {
  test("produces a valid JWT that contains the correct id and email", () => {
    const token = generateToken({ id: 7, email: "gen@test.com" });
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    expect(decoded.id).toBe(7);
    expect(decoded.email).toBe("gen@test.com");
  });

  test("token has an expiry claim", () => {
    const token = generateToken({ id: 1, email: "exp@test.com" });
    const decoded = jwt.decode(token) as any;

    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});

// ─── requireActiveUser ──────────────────────────────────────

describe("requireActiveUser middleware", () => {
  test("rejects with 401 when req.user is missing", async () => {
    const req = { user: undefined } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    await requireActiveUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects with 404 when user is not found in DB", async () => {
    mockedUser.findById.mockResolvedValueOnce(null);

    const req = { user: { id: 999, email: "gone@test.com" } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    await requireActiveUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects with 403 when user account is frozen", async () => {
    mockedUser.findById.mockResolvedValueOnce({
      id: 10,
      email: "frozen@test.com",
      is_frozen: true,
    } as any);

    const req = { user: { id: 10, email: "frozen@test.com" } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    await requireActiveUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("frozen") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next() for an active, non-frozen user", async () => {
    mockedUser.findById.mockResolvedValueOnce({
      id: 10,
      email: "active@test.com",
      is_frozen: false,
    } as any);

    const req = { user: { id: 10, email: "active@test.com" } } as AuthenticatedRequest;
    const res = mockResponse();
    const next = mockNext();

    await requireActiveUser(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
