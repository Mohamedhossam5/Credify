import { Router, Response } from "express";
import { authenticate, requireActiveUser, AuthenticatedRequest } from "../middleware/auth";
import ChangeRequest from "../models/ChangeRequest";
import User from "../models/User";
import { generateKeyedOtp, verifyKeyedOtp } from "../services/otp";
import { sendSms } from "../services/sms";

const router = Router();

// ═══════════════════════════════════════════════════════════════
// USER-FACING ROUTES (require JWT authentication)
// ═══════════════════════════════════════════════════════════════

// ── POST /api/change-requests ─────────────────────────────────
// Create a new change request
router.post("/", authenticate, requireActiveUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { changeType, currentValue, newValue, documents } = req.body;

    if (!changeType || !newValue) {
      res.status(400).json({ error: "changeType and newValue are required." });
      return;
    }

    // Check for existing active request of the same type
    const existing = await ChangeRequest.findActiveByUserAndType(userId, changeType);
    if (existing) {
      res.status(409).json({
        error: "You already have an active change request for this field.",
        existingRequest: existing,
      });
      return;
    }

    const request = await ChangeRequest.create({
      userId,
      changeType,
      currentValue: currentValue || "",
      newValue,
      documents: documents || [],
    });

    res.status(201).json({ message: "Change request submitted.", request });
  } catch (err: any) {
    console.error("[ChangeRequests] Create error:", err.message);
    res.status(500).json({ error: "Failed to create change request." });
  }
});

// ── GET /api/change-requests ──────────────────────────────────
// List all requests for the authenticated user
router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const requests = await ChangeRequest.findByUserId(userId);
    res.json({ requests });
  } catch (err: any) {
    console.error("[ChangeRequests] List error:", err.message);
    res.status(500).json({ error: "Failed to fetch change requests." });
  }
});

// ── POST /api/change-requests/send-otp ────────────────────────
// Send an OTP to the newly requested phone or email
router.post("/send-otp", authenticate, requireActiveUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { changeType, newValue } = req.body;
    if (!changeType || !newValue) {
      res.status(400).json({ error: "changeType and newValue are required." });
      return;
    }

    if (changeType === "PHONE_NUMBER" || changeType === "EMAIL_ADDRESS") {
      const purpose = `change-${changeType.toLowerCase()}`;
      const otp = generateKeyedOtp(purpose, newValue);
      // MOCK: send via SMS service for both email and phone
      sendSms(newValue, otp);
      res.json({ message: `Verification code sent to ${newValue}.` });
    } else {
      res.status(400).json({ error: "OTP not required for this change type." });
    }
  } catch (err: any) {
    console.error("[ChangeRequests] Send OTP error:", err.message);
    res.status(500).json({ error: "Failed to send verification code." });
  }
});

// ── POST /api/change-requests/verify-otp ──────────────────────
// Verify the OTP for the newly requested phone or email
router.post("/verify-otp", authenticate, requireActiveUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { changeType, newValue, otp } = req.body;
    if (!changeType || !newValue || !otp) {
      res.status(400).json({ error: "changeType, newValue, and otp are required." });
      return;
    }

    const purpose = `change-${changeType.toLowerCase()}`;
    const isValid = verifyKeyedOtp(purpose, newValue, otp);

    if (!isValid) {
      res.status(401).json({ error: "Invalid or expired verification code." });
      return;
    }

    res.json({ message: "Verification successful." });
  } catch (err: any) {
    console.error("[ChangeRequests] Verify OTP error:", err.message);
    res.status(500).json({ error: "Failed to verify code." });
  }
});


// ── GET /api/change-requests/:id ──────────────────────────────
// Get a single request with messages
router.get("/:id", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const requestId = parseInt(req.params.id, 10);

    const request = await ChangeRequest.findById(requestId);
    if (!request || request.user_id !== userId) {
      res.status(404).json({ error: "Change request not found." });
      return;
    }

    const messages = await ChangeRequest.getMessages(requestId);
    res.json({ request, messages });
  } catch (err: any) {
    console.error("[ChangeRequests] Get error:", err.message);
    res.status(500).json({ error: "Failed to fetch change request." });
  }
});

// ── POST /api/change-requests/:id/documents ───────────────────
// Upload additional documents to a request
router.post("/:id/documents", authenticate, requireActiveUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const requestId = parseInt(req.params.id, 10);
    const { documents } = req.body;

    const request = await ChangeRequest.findById(requestId);
    if (!request || request.user_id !== userId) {
      res.status(404).json({ error: "Change request not found." });
      return;
    }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      res.status(400).json({ error: "Documents array is required." });
      return;
    }

    const updated = await ChangeRequest.addDocuments(requestId, documents);

    // Add system message
    const docNames = documents.map((d: any) => d.originalName || d.name).join(", ");
    await ChangeRequest.addMessage(requestId, "USER", `Uploaded additional documents: ${docNames}`, documents);

    // If status was WAITING_FOR_CUSTOMER, move to UNDER_REVIEW
    if (request.status === "WAITING_FOR_CUSTOMER") {
      await ChangeRequest.updateStatus(requestId, "UNDER_REVIEW");
    }

    res.json({ message: "Documents uploaded.", request: updated });
  } catch (err: any) {
    console.error("[ChangeRequests] Upload docs error:", err.message);
    res.status(500).json({ error: "Failed to upload documents." });
  }
});

// ── POST /api/change-requests/:id/messages ────────────────────
// User sends a message
router.post("/:id/messages", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const requestId = parseInt(req.params.id, 10);
    const { message } = req.body;

    const request = await ChangeRequest.findById(requestId);
    if (!request || request.user_id !== userId) {
      res.status(404).json({ error: "Change request not found." });
      return;
    }

    const msg = await ChangeRequest.addMessage(requestId, "USER", message || "");
    res.json({ message: "Message sent.", data: msg });
  } catch (err: any) {
    console.error("[ChangeRequests] Message error:", err.message);
    res.status(500).json({ error: "Failed to send message." });
  }
});


// ═══════════════════════════════════════════════════════════════
// INTERNAL/ADMIN ROUTES (called by API gateway, no JWT needed)
// ═══════════════════════════════════════════════════════════════

// ── GET /api/internal/change-requests ─────────────────────────
router.get("/internal/all", async (_req, res: Response): Promise<void> => {
  try {
    const requests = await ChangeRequest.findAll();
    res.json({ requests });
  } catch (err: any) {
    console.error("[ChangeRequests] Admin list error:", err.message);
    res.status(500).json({ error: "Failed to fetch change requests." });
  }
});

// ── GET /api/internal/change-requests/:id ─────────────────────
router.get("/internal/:id", async (req, res: Response): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const request = await ChangeRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ error: "Change request not found." });
      return;
    }
    const messages = await ChangeRequest.getMessages(requestId);

    // Also get user info
    const user = await User.findById(request.user_id);

    res.json({ request, messages, user });
  } catch (err: any) {
    console.error("[ChangeRequests] Admin get error:", err.message);
    res.status(500).json({ error: "Failed to fetch change request." });
  }
});

// ── POST /api/internal/change-requests/:id/approve ────────────
router.post("/internal/:id/approve", async (req, res: Response): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const request = await ChangeRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ error: "Change request not found." });
      return;
    }

    // Apply the change to the user record
    await ChangeRequest.applyChange(request);

    // Update status
    const updated = await ChangeRequest.updateStatus(requestId, "APPROVED");

    // Add system message
    await ChangeRequest.addMessage(requestId, "SYSTEM", "Your request has been approved. Your information has been updated successfully.");

    res.json({ message: "Request approved and changes applied.", request: updated });
  } catch (err: any) {
    console.error("[ChangeRequests] Approve error:", err.message);
    res.status(500).json({ error: "Failed to approve request." });
  }
});

// ── POST /api/internal/change-requests/:id/reject ─────────────
router.post("/internal/:id/reject", async (req, res: Response): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    const request = await ChangeRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ error: "Change request not found." });
      return;
    }

    const updated = await ChangeRequest.updateStatus(requestId, "REJECTED");

    // Add admin message with rejection reason
    await ChangeRequest.addMessage(
      requestId,
      "ADMIN",
      reason || "Your request has been rejected."
    );

    res.json({ message: "Request rejected.", request: updated });
  } catch (err: any) {
    console.error("[ChangeRequests] Reject error:", err.message);
    res.status(500).json({ error: "Failed to reject request." });
  }
});

// ── POST /api/internal/change-requests/:id/request-info ───────
router.post("/internal/:id/request-info", async (req, res: Response): Promise<void> => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { message } = req.body;

    const request = await ChangeRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ error: "Change request not found." });
      return;
    }

    // Set status to waiting
    const updated = await ChangeRequest.updateStatus(requestId, "WAITING_FOR_CUSTOMER");

    // Add admin message
    await ChangeRequest.addMessage(
      requestId,
      "ADMIN",
      message || "We need additional information to proceed with your request."
    );

    res.json({ message: "Information requested.", request: updated });
  } catch (err: any) {
    console.error("[ChangeRequests] Request-info error:", err.message);
    res.status(500).json({ error: "Failed to request info." });
  }
});

export default router;
