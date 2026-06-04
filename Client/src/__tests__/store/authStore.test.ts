import { describe, test, expect, vi, beforeEach } from "vitest";

// The authStore accesses `localStorage` at module top-level (line 53).
// We need to define it before the module is imported.
// Using a setup approach:

// 1. Create a localStorage mock on globalThis FIRST
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
};

// 2. Define it on globalThis before anything imports authStore
(globalThis as any).localStorage = localStorageMock;

// 3. Mock queryClient (used by logout)
vi.mock("../../lib/queryClient", () => ({
  queryClient: {
    clear: vi.fn(),
  },
}));

// 4. Now import after globals are set
const { useAuthStore } = await import("../../store/authStore");

// ─── Tests ───────────────────────────────────────────────────

describe("authStore", () => {
  beforeEach(() => {
    // Reset the store to a clean state before each test
    useAuthStore.setState({
      step1Data: null,
      step2Data: null,
      currentStep: 1,
      kycState: "idle",
      resubmitting: false,
      token: null,
      user: null,
      isAuthenticated: false,
      loginEmail: null,
      otpRequired: false,
    });
    // Reset localStorage mock tracking (but keep the global object)
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    Object.keys(store).forEach(k => delete store[k]);
  });

  // ── Session management ────────────────────────────────────

  describe("setSession", () => {
    test("sets token, user, and isAuthenticated", () => {
      const user = {
        id: 1,
        firstName: "John",
        middleName: null,
        lastName: "Doe",
        email: "john@test.com",
        phoneNumber: "+201012345678",
        gender: "MALE",
        phoneVerified: true,
        emailVerified: true,
        kycStatus: "APPROVED",
        role: "USER",
      };

      useAuthStore.getState().setSession("test-token-123", user as any);
      const state = useAuthStore.getState();

      expect(state.token).toBe("test-token-123");
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    test("persists token and user to localStorage", () => {
      const user = { id: 2, firstName: "Jane" } as any;
      useAuthStore.getState().setSession("tok", user);

      expect(localStorageMock.setItem).toHaveBeenCalledWith("credify_token", "tok");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "credify_user",
        JSON.stringify(user)
      );
    });
  });

  describe("clearSession", () => {
    test("clears token, user, and authentication flag", () => {
      useAuthStore.setState({
        token: "abc",
        user: { id: 1 } as any,
        isAuthenticated: true,
      });

      useAuthStore.getState().clearSession();
      const state = useAuthStore.getState();

      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    test("removes token and user from localStorage", () => {
      useAuthStore.getState().clearSession();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("credify_token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("credify_user");
    });
  });

  describe("logout", () => {
    test("clears all session and OTP state", () => {
      useAuthStore.setState({
        token: "token",
        user: { id: 1 } as any,
        isAuthenticated: true,
        loginEmail: "test@test.com",
        otpRequired: true,
        kycState: "approved",
      });

      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loginEmail).toBeNull();
      expect(state.otpRequired).toBe(false);
      expect(state.kycState).toBe("idle");
    });

    test("clears queryClient cache", async () => {
      const { queryClient } = await import("../../lib/queryClient");
      useAuthStore.getState().logout();
      expect(queryClient.clear).toHaveBeenCalled();
    });
  });

  // ── OTP state ─────────────────────────────────────────────

  describe("OTP actions", () => {
    test("setOtpRequired sets email and flag", () => {
      useAuthStore.getState().setOtpRequired("otp@test.com");
      const state = useAuthStore.getState();

      expect(state.loginEmail).toBe("otp@test.com");
      expect(state.otpRequired).toBe(true);
    });

    test("clearOtp resets email and flag", () => {
      useAuthStore.setState({ loginEmail: "otp@test.com", otpRequired: true });
      useAuthStore.getState().clearOtp();
      const state = useAuthStore.getState();

      expect(state.loginEmail).toBeNull();
      expect(state.otpRequired).toBe(false);
    });
  });

  // ── Registration wizard ───────────────────────────────────

  describe("Registration wizard actions", () => {
    test("setStep1Data stores the data", () => {
      const data = { firstName: "Ali", lastName: "Hassan" } as any;
      useAuthStore.getState().setStep1Data(data);
      expect(useAuthStore.getState().step1Data).toEqual(data);
    });

    test("setStep2Data stores the data", () => {
      const data = { address: "Cairo", dob: "2000-01-01" } as any;
      useAuthStore.getState().setStep2Data(data);
      expect(useAuthStore.getState().step2Data).toEqual(data);
    });

    test("setCurrentStep updates the step", () => {
      useAuthStore.getState().setCurrentStep(3);
      expect(useAuthStore.getState().currentStep).toBe(3);
    });

    test("setKycState updates KYC state", () => {
      useAuthStore.getState().setKycState("processing");
      expect(useAuthStore.getState().kycState).toBe("processing");
    });

    test("reset returns wizard to initial state", () => {
      useAuthStore.setState({
        step1Data: { firstName: "X" } as any,
        step2Data: { address: "Y" } as any,
        currentStep: 4 as any,
        kycState: "approved",
        resubmitting: true,
      });

      useAuthStore.getState().reset();
      const state = useAuthStore.getState();

      expect(state.step1Data).toBeNull();
      expect(state.step2Data).toBeNull();
      expect(state.currentStep).toBe(1);
      expect(state.kycState).toBe("idle");
      expect(state.resubmitting).toBe(false);
    });
  });

  // ── setUser ───────────────────────────────────────────────

  describe("setUser", () => {
    test("updates user and persists to localStorage", () => {
      const user = { id: 5, firstName: "Updated" } as any;
      useAuthStore.getState().setUser(user);

      expect(useAuthStore.getState().user).toEqual(user);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "credify_user",
        JSON.stringify(user)
      );
    });
  });
});
