import { Router, Response, NextFunction } from "express";
import upload from "../config/upload";
import KycApplication from "../models/KycApplication";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8000";

// All KYC routes require authentication
router.use(authenticate as any);

// ─── GET /api/kyc/status ─────────────────────────────────────

router.get("/status", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const application = await KycApplication.findOrCreate(req.user!.id);

    res.json({
      userId: application.user_id,
      status: application.status,
      documents: {
        nationalIdFront: !!application.national_id_front,
        nationalIdBack: !!application.national_id_back,
        faceSelfie: !!application.face_selfie,
        proofOfAddress: !!application.proof_of_address,
      },
      faceVerification: {
        score: application.face_match_score,
        passed: application.face_match_passed,
      },
      rejectionReason: application.rejection_reason,
      updatedAt: application.updated_at,
    });
  } catch (err) {
    console.error("[KYC Status] Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /api/kyc/upload/national-id ────────────────────────

router.post(
  "/upload/national-id",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files?.front || !files?.back) {
        res.status(400).json({ error: "Both 'front' and 'back' images of National ID are required." });
        return;
      }

      await KycApplication.findOrCreate(req.user!.id);
      const application = await KycApplication.uploadNationalId(
        req.user!.id, files.front[0].path, files.back[0].path
      );

      const complete = await KycApplication.areDocumentsComplete(req.user!.id);
      if (complete) {
        await KycApplication.updateStatus(req.user!.id, "DOCUMENTS_UPLOADED");
      }

      res.json({
        message: "National ID uploaded successfully.",
        documents: {
          nationalIdFront: !!application.national_id_front,
          nationalIdBack: !!application.national_id_back,
        },
      });
    } catch (err) {
      console.error("[KYC Upload National ID] Error:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// ─── POST /api/kyc/upload/face-selfie ────────────────────────

router.post(
  "/upload/face-selfie",
  upload.single("selfie"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Selfie image is required." });
        return;
      }

      await KycApplication.findOrCreate(req.user!.id);
      const application = await KycApplication.uploadFaceSelfie(req.user!.id, req.file.path);

      const complete = await KycApplication.areDocumentsComplete(req.user!.id);
      if (complete) {
        await KycApplication.updateStatus(req.user!.id, "DOCUMENTS_UPLOADED");
        // Trigger face verification
        triggerFaceVerification(req.user!.id);
      }

      res.json({
        message: "Face selfie uploaded successfully.",
        documents: { faceSelfie: !!application.face_selfie },
      });
    } catch (err) {
      console.error("[KYC Upload Face Selfie] Error:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// ─── POST /api/kyc/upload/proof-of-address ───────────────────

router.post(
  "/upload/proof-of-address",
  upload.single("document"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Proof of address document is required." });
        return;
      }

      await KycApplication.findOrCreate(req.user!.id);
      const application = await KycApplication.uploadProofOfAddress(req.user!.id, req.file.path);

      const complete = await KycApplication.areDocumentsComplete(req.user!.id);
      if (complete) {
        await KycApplication.updateStatus(req.user!.id, "DOCUMENTS_UPLOADED");
        triggerFaceVerification(req.user!.id);
      }

      res.json({
        message: "Proof of address uploaded successfully.",
        documents: { proofOfAddress: !!application.proof_of_address },
      });
    } catch (err) {
      console.error("[KYC Upload Proof of Address] Error:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

// ─── Face Verification Trigger ───────────────────────────────

async function triggerFaceVerification(userId: number): Promise<void> {
  try {
    const app = await KycApplication.findByUserId(userId);
    if (!app || !app.national_id_front || !app.face_selfie) return;

    await KycApplication.updateStatus(userId, "AI_VERIFICATION_IN_PROGRESS");

    const FormData = (await import("form-data")).default;
    const fs = await import("fs");
    const form = new FormData();
    form.append("id_image", fs.createReadStream(app.national_id_front));
    form.append("selfie_image", fs.createReadStream(app.face_selfie));

    const response = await fetch(`${FACE_SERVICE_URL}/verify`, {
      method: "POST",
      body: form as any,
      headers: form.getHeaders(),
    });

    if (!response.ok) {
      console.error("[Face Verify] Service returned:", response.status);
      await KycApplication.updateStatus(userId, "MANUAL_REVIEW", "Face verification service error");
      return;
    }

    const result = await response.json() as { verified: boolean; distance: number };
    await KycApplication.updateFaceVerification(userId, result.distance, result.verified);

    if (result.verified) {
      await KycApplication.updateStatus(userId, "APPROVED");
    } else {
      await KycApplication.updateStatus(userId, "REJECTED", "Face does not match the ID photo.");
    }
  } catch (err) {
    console.error("[Face Verify] Error:", err);
    await KycApplication.updateStatus(userId, "MANUAL_REVIEW", "Face verification failed");
  }
}

// ─── Multer error handler ────────────────────────────────────

router.use((err: any, _req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "File too large. Maximum size is 10MB." });
    return;
  }
  if (err.message) {
    res.status(400).json({ error: err.message });
    return;
  }
  next(err);
});

export default router;
