import { Router, Response } from "express";
import { body, param, validationResult } from "express-validator";
import Card from "../models/Card";
import CardDelivery from "../models/CardDelivery";
import Account from "../models/Account";
import User from "../models/User";
import { authenticate, requireActiveUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// ─── POST /cards/request ────────────────────────────────────
// Request a new debit or prepaid card

router.post("/request", authenticate, requireActiveUser, [
  body("cardType").isIn(["DEBIT", "PREPAID"]).withMessage("Card type must be DEBIT or PREPAID"),
  body("dailyLimit").optional().isFloat({ gt: 0, max: 100000 }).withMessage("Daily limit must be between 0 and 100,000"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const { cardType, dailyLimit } = req.body;

    // User must have an active account
    const account = await Account.findByUserId(userId);
    if (!account) {
      res.status(400).json({ error: "You must have an active bank account before requesting a card." });
      return;
    }

    // Fetch user for cardholder name
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Business rules: max 1 active debit card, max 3 active prepaid cards
    const existingCards = await Card.findActiveByUserIdAndType(userId, cardType);

    if (cardType === "DEBIT" && existingCards.length >= 1) {
      res.status(400).json({
        error: "You already have an active debit card. Please cancel your existing one before requesting a new one.",
      });
      return;
    }

    if (cardType === "PREPAID" && existingCards.length >= 3) {
      res.status(400).json({
        error: "You can have a maximum of 3 active prepaid cards.",
      });
      return;
    }

    // Build cardholder name
    const cardholderName = [user.first_name, user.middle_name, user.last_name]
      .filter(Boolean)
      .join(" ")
      .toUpperCase();

    // Debit card links directly to the user's account
    const linkedAccountId = cardType === "DEBIT" ? account.account_id : null;

    const card = await Card.create(
      userId,
      cardType,
      cardholderName,
      linkedAccountId,
      dailyLimit || 10000
    );

    res.status(201).json({
      message: `${cardType === "DEBIT" ? "Debit" : "Prepaid"} card created successfully.`,
      card: Card.toSafe(card),
    });
  } catch (err) {
    console.error("[Card Request Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /cards/deliveries/all ───────────────────────────────
// Get all delivery requests for the authenticated user
// NOTE: This must be registered BEFORE /:cardId to avoid Express matching "deliveries" as a param

router.get("/deliveries/all", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const deliveries = await CardDelivery.findAllByUserId(userId);
    res.json({ deliveries });
  } catch (err) {
    console.error("[Card Deliveries List Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /cards ─────────────────────────────────────────────
// Get all cards for the authenticated user

router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cards = await Card.findByUserId(userId);

    // Also fetch the main account balance for context
    const account = await Account.findByUserId(userId);

    res.json({
      cards: cards.map(Card.toSafe),
      accountBalance: account ? parseFloat(String(account.balance)) : 0,
    });
  } catch (err) {
    console.error("[Card List Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /cards/:cardId ─────────────────────────────────────
// Get a single card's details

router.get("/:cardId", authenticate, [
  param("cardId").isInt({ gt: 0 }).withMessage("Invalid card ID"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const cardId = parseInt(req.params.cardId, 10);

    const card = await Card.findById(cardId);
    if (!card || card.user_id !== userId) {
      res.status(404).json({ error: "Card not found." });
      return;
    }

    // For debit cards, also return linked account balance
    let linkedAccountBalance: number | null = null;
    if (card.card_type === "DEBIT" && card.linked_account_id) {
      const account = await Account.findByUserId(userId);
      if (account) {
        linkedAccountBalance = parseFloat(String(account.balance));
      }
    }

    res.json({
      card: Card.toSafe(card),
      linkedAccountBalance,
    });
  } catch (err) {
    console.error("[Card Detail Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /cards/:cardId/freeze ─────────────────────────────
// Toggle freeze / unfreeze a card

router.post("/:cardId/freeze", authenticate, requireActiveUser, [
  param("cardId").isInt({ gt: 0 }).withMessage("Invalid card ID"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const cardId = parseInt(req.params.cardId, 10);

    const card = await Card.findById(cardId);
    if (!card || card.user_id !== userId) {
      res.status(404).json({ error: "Card not found." });
      return;
    }

    if (card.status === "CANCELLED") {
      res.status(400).json({ error: "Cannot freeze a cancelled card." });
      return;
    }

    const newStatus = card.status === "FROZEN" ? "ACTIVE" : "FROZEN";
    const updatedCard = await Card.updateStatus(cardId, newStatus);

    res.json({
      message: newStatus === "FROZEN" ? "Card has been frozen." : "Card has been unfrozen.",
      card: updatedCard ? Card.toSafe(updatedCard) : null,
    });
  } catch (err) {
    console.error("[Card Freeze Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /cards/:cardId/cancel ─────────────────────────────
// Permanently cancel a card

router.post("/:cardId/cancel", authenticate, requireActiveUser, [
  param("cardId").isInt({ gt: 0 }).withMessage("Invalid card ID"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const cardId = parseInt(req.params.cardId, 10);

    const card = await Card.findById(cardId);
    if (!card || card.user_id !== userId) {
      res.status(404).json({ error: "Card not found." });
      return;
    }

    if (card.status === "CANCELLED") {
      res.status(400).json({ error: "Card is already cancelled." });
      return;
    }

    // If prepaid card has remaining balance, auto-refund to main account
    if (card.card_type === "PREPAID" && parseFloat(String(card.prepaid_balance)) > 0) {
      const unloadResult = await Card.unloadPrepaid(userId, cardId, parseFloat(String(card.prepaid_balance)));
      if (!unloadResult.success) {
        res.status(500).json({ error: `Failed to refund prepaid balance: ${unloadResult.error}` });
        return;
      }
    }

    const updatedCard = await Card.updateStatus(cardId, "CANCELLED");

    res.json({
      message: "Card has been permanently cancelled.",
      card: updatedCard ? Card.toSafe(updatedCard) : null,
      refundedToAccount: card.card_type === "PREPAID" ? parseFloat(String(card.prepaid_balance)) : 0,
    });
  } catch (err) {
    console.error("[Card Cancel Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /cards/:cardId/set-limit ──────────────────────────
// Update the daily spending limit

router.post("/:cardId/set-limit", authenticate, requireActiveUser, [
  param("cardId").isInt({ gt: 0 }).withMessage("Invalid card ID"),
  body("dailyLimit").isFloat({ gt: 0, max: 100000 }).withMessage("Daily limit must be between 0 and 100,000"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const cardId = parseInt(req.params.cardId, 10);

    const card = await Card.findById(cardId);
    if (!card || card.user_id !== userId) {
      res.status(404).json({ error: "Card not found." });
      return;
    }

    if (card.status !== "ACTIVE") {
      res.status(400).json({ error: "Can only update limits on active cards." });
      return;
    }

    const { dailyLimit } = req.body;
    const updatedCard = await Card.updateDailyLimit(cardId, dailyLimit);

    res.json({
      message: `Daily limit updated to ${dailyLimit}.`,
      card: updatedCard ? Card.toSafe(updatedCard) : null,
    });
  } catch (err) {
    console.error("[Card Set Limit Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /cards/load ───────────────────────────────────────
// Transfer money from main account → prepaid card

router.post("/load", authenticate, requireActiveUser, [
  body("cardId").isInt({ gt: 0 }).withMessage("Card ID is required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const { cardId, amount } = req.body;

    const result = await Card.loadPrepaid(userId, parseInt(cardId, 10), parseFloat(amount));

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: `Successfully loaded ${amount} to prepaid card.`,
      newPrepaidBalance: result.newPrepaidBalance,
      newAccountBalance: result.newAccountBalance,
    });
  } catch (err) {
    console.error("[Card Load Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /cards/unload ─────────────────────────────────────
// Transfer money from prepaid card → main account

router.post("/unload", authenticate, requireActiveUser, [
  body("cardId").isInt({ gt: 0 }).withMessage("Card ID is required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const { cardId, amount } = req.body;

    const result = await Card.unloadPrepaid(userId, parseInt(cardId, 10), parseFloat(amount));

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: `Successfully withdrew ${amount} from prepaid card to main account.`,
      newPrepaidBalance: result.newPrepaidBalance,
      newAccountBalance: result.newAccountBalance,
    });
  } catch (err) {
    console.error("[Card Unload Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /cards/transfer ───────────────────────────────────
// Transfer funds between two prepaid cards (same user)

router.post("/transfer", authenticate, requireActiveUser, [
  body("fromCardId").isInt({ gt: 0 }).withMessage("Source card ID is required"),
  body("toCardId").isInt({ gt: 0 }).withMessage("Destination card ID is required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const { fromCardId, toCardId, amount } = req.body;

    if (parseInt(fromCardId) === parseInt(toCardId)) {
      res.status(400).json({ error: "Cannot transfer to the same card." });
      return;
    }

    const result = await Card.transferBetweenPrepaid(
      userId,
      parseInt(fromCardId, 10),
      parseInt(toCardId, 10),
      parseFloat(amount)
    );

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: `Successfully transferred ${amount} between prepaid cards.`,
    });
  } catch (err) {
    console.error("[Card Transfer Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── POST /cards/:cardId/delivery ────────────────────────────
// Request physical delivery of a card

router.post("/:cardId/delivery", authenticate, requireActiveUser, [
  param("cardId").isInt({ gt: 0 }).withMessage("Invalid card ID"),
  body("deliveryAddress").trim().notEmpty().withMessage("Delivery address is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("postalCode").trim().notEmpty().withMessage("Postal code is required"),
  body("contactPhone").trim().notEmpty().withMessage("Contact phone number is required"),
  body("notes").optional().trim(),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const cardId = parseInt(req.params.cardId, 10);

    // Verify the card belongs to this user
    const card = await Card.findById(cardId);
    if (!card || card.user_id !== userId) {
      res.status(404).json({ error: "Card not found." });
      return;
    }

    if (card.status === "CANCELLED") {
      res.status(400).json({ error: "Cannot request delivery for a cancelled card." });
      return;
    }

    // Check for an existing active delivery
    const hasActive = await CardDelivery.hasActiveDelivery(cardId);
    if (hasActive) {
      res.status(400).json({ error: "There is already an active delivery request for this card." });
      return;
    }

    const { deliveryAddress, city, postalCode, contactPhone, notes } = req.body;

    const delivery = await CardDelivery.create(
      cardId, userId, deliveryAddress, city, postalCode, contactPhone, notes
    );

    res.status(201).json({
      message: "Card delivery request submitted successfully. Estimated delivery in 5-7 business days.",
      delivery,
    });
  } catch (err) {
    console.error("[Card Delivery Request Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── GET /cards/:cardId/delivery ─────────────────────────────
// Get the latest delivery status for a card

router.get("/:cardId/delivery", authenticate, [
  param("cardId").isInt({ gt: 0 }).withMessage("Invalid card ID"),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user!.id;
    const cardId = parseInt(req.params.cardId, 10);

    // Verify the card belongs to this user
    const card = await Card.findById(cardId);
    if (!card || card.user_id !== userId) {
      res.status(404).json({ error: "Card not found." });
      return;
    }

    const delivery = await CardDelivery.findByCardId(cardId);
    if (!delivery) {
      res.status(404).json({ error: "No delivery request found for this card." });
      return;
    }

    res.json({ delivery });
  } catch (err) {
    console.error("[Card Delivery Status Error]", err);
    res.status(500).json({ error: "Internal server error." });
  }
});


export default router;
