import { describe, test, expect, vi } from "vitest";

// Mock the logger module to prevent import.meta.env issues and side effects
vi.mock("../../utils/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Must import after mocking
import { normalizeApiError } from "../../utils/errorHandler";

// ─── Axios-like response error ──────────────────────────────

describe("normalizeApiError", () => {
  test("normalizes Axios response error (4xx) with server message", async () => {
    // Simulate an AxiosError with a response
    const axiosError = new Error("Request failed") as any;
    axiosError.isAxiosError = true;
    axiosError.response = {
      status: 400,
      statusText: "Bad Request",
      data: { error: "Invalid email format." },
    };
    axiosError.request = {};

    // Patch axios.isAxiosError to return true for our fake error
    const axios = await import("axios");
    const origIsAxiosError = axios.default.isAxiosError;
    axios.default.isAxiosError = ((e: any) => e?.isAxiosError === true) as any;

    const result = normalizeApiError(axiosError);

    expect(result.status).toBe(400);
    expect(result.message).toBe("Invalid email format.");
    expect(result.code).toBe("HTTP_400");

    axios.default.isAxiosError = origIsAxiosError;
  });

  test("normalizes Axios response error (5xx)", async () => {
    const axiosError = new Error("Server error") as any;
    axiosError.isAxiosError = true;
    axiosError.response = {
      status: 500,
      statusText: "Internal Server Error",
      data: { message: "Database connection failed" },
    };
    axiosError.request = {};

    const axios = await import("axios");
    const origIsAxiosError = axios.default.isAxiosError;
    axios.default.isAxiosError = ((e: any) => e?.isAxiosError === true) as any;

    const result = normalizeApiError(axiosError);

    expect(result.status).toBe(500);
    expect(result.message).toBe("Database connection failed");

    axios.default.isAxiosError = origIsAxiosError;
  });

  test("normalizes Axios network error (no response)", async () => {
    const axiosError = new Error("Network Error") as any;
    axiosError.isAxiosError = true;
    axiosError.response = undefined;
    axiosError.request = {}; // request was made but no response received

    const axios = await import("axios");
    const origIsAxiosError = axios.default.isAxiosError;
    axios.default.isAxiosError = ((e: any) => e?.isAxiosError === true) as any;

    const result = normalizeApiError(axiosError);

    expect(result.code).toBe("NETWORK_ERROR");
    expect(result.status).toBe(0);
    expect(result.message).toContain("Network");

    axios.default.isAxiosError = origIsAxiosError;
  });

  test("normalizes standard JS Error", () => {
    const error = new TypeError("Cannot read property 'x' of undefined");
    const result = normalizeApiError(error);

    expect(result.code).toBe("INTERNAL_CLIENT_ERROR");
    expect(result.status).toBe(-1);
    expect(result.message).toContain("Cannot read property");
  });

  test("normalizes completely unknown error type", () => {
    const result = normalizeApiError("some random string error");

    expect(result.code).toBe("UNKNOWN_ERROR");
    expect(result.status).toBe(-1);
    expect(result.message).toBe("An unexpected error occurred.");
  });

  test("normalizes null/undefined errors", () => {
    const result = normalizeApiError(null);
    expect(result.code).toBe("UNKNOWN_ERROR");

    const result2 = normalizeApiError(undefined);
    expect(result2.code).toBe("UNKNOWN_ERROR");
  });
});
