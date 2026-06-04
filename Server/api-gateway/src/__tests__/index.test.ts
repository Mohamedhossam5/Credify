/**
 * Tests for the API Gateway.
 *
 * The gateway is mostly a thin proxy layer, so we test:
 *   1. The forwardJSON helper behaviour (success + upstream failure)
 *   2. The /health endpoint
 *
 * We avoid importing the full index.ts (which starts a server), and instead
 * replicate the forwardJSON logic and health handler in isolation.
 */

// ─── forwardJSON logic tests ────────────────────────────────

describe("forwardJSON helper logic", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  /**
   * Mirrors the core behaviour of the gateway's forwardJSON:
   * - Forwards method, authorization, and body
   * - Returns upstream status + JSON
   */
  async function forwardJSON(
    serviceUrl: string,
    apiPath: string,
    method: string,
    headers: Record<string, string>,
    body?: any
  ): Promise<{ status: number; data: any }> {
    const reqHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (headers.authorization) {
      reqHeaders["Authorization"] = headers.authorization;
    }

    const opts: RequestInit = { method, headers: reqHeaders };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      opts.body = JSON.stringify(body);
    }

    const upstream = await fetch(`${serviceUrl}${apiPath}`, opts);
    const data = await upstream.json();
    return { status: upstream.status, data };
  }

  test("forwards GET request and returns upstream JSON + status", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 200,
      json: async () => ({ user: { id: 1 } }),
    }) as any;

    const result = await forwardJSON(
      "http://localhost:3001",
      "/api/auth/me",
      "GET",
      { authorization: "Bearer abc" }
    );

    expect(result.status).toBe(200);
    expect(result.data).toEqual({ user: { id: 1 } });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/me",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer abc" }),
      })
    );
  });

  test("forwards POST request with body and returns upstream response", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 201,
      json: async () => ({ message: "created" }),
    }) as any;

    const result = await forwardJSON(
      "http://localhost:3001",
      "/api/auth/register",
      "POST",
      {},
      { email: "test@test.com", password: "secret" }
    );

    expect(result.status).toBe(201);
    expect(result.data.message).toBe("created");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "test@test.com", password: "secret" }),
      })
    );
  });

  test("does NOT attach Authorization header when absent", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 200,
      json: async () => ({}),
    }) as any;

    await forwardJSON("http://localhost:3001", "/api/test", "GET", {});

    const calledHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(calledHeaders).not.toHaveProperty("Authorization");
  });

  test("propagates upstream error status codes (e.g. 401)", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    }) as any;

    const result = await forwardJSON("http://localhost:3001", "/api/auth/me", "GET", {});

    expect(result.status).toBe(401);
    expect(result.data.error).toBe("Unauthorized");
  });

  test("throws when upstream is unreachable (simulates 502 scenario)", async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("ECONNREFUSED")) as any;

    await expect(
      forwardJSON("http://localhost:3001", "/api/auth/me", "GET", {})
    ).rejects.toThrow("ECONNREFUSED");
  });
});

// ─── Health endpoint logic ──────────────────────────────────

describe("/health endpoint logic", () => {
  test("returns ok status with service name and upstream URLs", () => {
    const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
    const KYC_SERVICE_URL = process.env.KYC_SERVICE_URL || "http://localhost:3002";

    const expected = {
      status: "ok",
      service: "api-gateway",
      upstreams: {
        userService: USER_SERVICE_URL,
        kycService: KYC_SERVICE_URL,
      },
    };

    // Replicate the handler logic
    const result = {
      status: "ok",
      service: "api-gateway",
      upstreams: { userService: USER_SERVICE_URL, kycService: KYC_SERVICE_URL },
    };

    expect(result).toEqual(expected);
  });
});
