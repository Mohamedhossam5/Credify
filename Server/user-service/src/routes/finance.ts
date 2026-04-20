import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Account from "../models/Account";
import Transaction from "../models/Transaction";
import User from "../models/User";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const transferValidation = [
  body("type").isIn(["SAME_BANK", "DOMESTIC", "INTERNATIONAL"]).withMessage("Invalid transfer type"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
  body("recipientName").notEmpty().withMessage("Recipient name is required"),
  body("recipientAccount").notEmpty().withMessage("Recipient account is required"),
];

router.post("/transfer", authenticate, transferValidation, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { type, amount, recipientName, recipientAccount, recipientBank, swiftCode, recipientAddress, reference } = req.body;
    const userId = req.user!.id;

    if (type === "DOMESTIC" && !recipientBank) {
      res.status(400).json({ error: "Bank name is required for domestic transfers." });
      return;
    }
    if (type === "INTERNATIONAL") {
      if (!recipientBank) return res.status(400).json({ error: "Bank name is required for international transfers." }) as any;
      if (!swiftCode) return res.status(400).json({ error: "SWIFT code is required for international transfers." }) as any;
      if (!recipientAddress) return res.status(400).json({ error: "Bank address is required for international transfers." }) as any;
    }

    const senderAccount = await Account.findByUserId(userId);
    if (!senderAccount) {
      res.status(404).json({ error: "Sender account not found." });
      return;
    }

    const receiverInternalId = type === "SAME_BANK" ? recipientAccount : undefined;
    
    if (type === "SAME_BANK" && receiverInternalId === senderAccount.account_id) {
       res.status(400).json({ error: "You cannot transfer to your own account." });
       return;
    }

    const transferRes = await Account.transferFunds(userId, parseFloat(amount), receiverInternalId);
    
    if (!transferRes.success) {
      res.status(400).json({ error: transferRes.error });
      return;
    }

    const transaction = await Transaction.create({
      senderId: userId,
      senderAccountId: senderAccount.account_id,
      type,
      amount: parseFloat(amount),
      recipientName,
      recipientAccount,
      recipientBank,
      swiftCode,
      recipientAddress,
      reference
    });

    res.json({ message: "Transfer successful.", transaction });
  } catch (err) {
    console.error("[Transfer Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/transactions", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const user = await User.findById(req.user!.id);
    let transactions;
    if (user?.role === 'ADMIN' && req.query.global === 'true') {
      transactions = await Transaction.findAll(limit);
    } else {
      const account = await Account.findByUserId(req.user!.id);
      transactions = await Transaction.findByUserIdAndAccount(req.user!.id, account?.account_id, limit);
    }
    res.json({ transactions });
  } catch(err) {
    console.error("[Transactions Fetch Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/fx-rates", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const API_KEY = "4c467a1682-48ba6f1415-tdjq8e";
    const response = await fetch(`https://api.fastforex.io/fetch-all?from=EGP&api_key=${API_KEY}`);
    const data = await response.json() as any;
    
    res.json({
      updated: data.updated || new Date().toISOString(),
      results: data.results || {}
    });
  } catch (err) {
    console.error("[FX Rates Error]", err);
    res.status(500).json({ error: "Failed to fetch live FX rates." });
  }
});

export default router;
