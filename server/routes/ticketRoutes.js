const express = require("express");
const Ticket = require("../models/Ticket");
const {
  analyzeTicketWithAI,
} = require("../services/aiService");

const router = express.Router();

// =========================================
// GET ALL TICKETS
// =========================================

router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({
      createdAt: -1,
    });

    res.json(tickets);
  } catch (error) {
    console.error("Fetch tickets error:", error);

    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
});

// =========================================
// CREATE NEW TICKET
// =========================================

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const ticket = new Ticket({
      ticketId: `INC-${Date.now()
        .toString()
        .slice(-6)}`,

      title: title.trim(),

      description: description.trim(),

      category: category || "Uncategorized",

      priority: priority || "Medium",
    });

    const savedTicket = await ticket.save();

    res.status(201).json(savedTicket);
  } catch (error) {
    console.error("Create ticket error:", error);

    res.status(500).json({
      message: "Failed to create ticket",
      error: error.message,
    });
  }
});

// =========================================
// AI TICKET ANALYSIS
// =========================================

router.post("/:id/analyze", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    console.log(
      `🤖 Analyzing ticket: ${ticket.ticketId}`
    );

    const aiAnalysis =
      await analyzeTicketWithAI(ticket);

    ticket.aiAnalysis = aiAnalysis;

    const updatedTicket =
      await ticket.save();

    console.log(
      `✅ AI analysis completed: ${ticket.ticketId}`
    );

    res.status(200).json({
      message: "Ticket analyzed successfully",
      aiAnalysis: updatedTicket.aiAnalysis,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error(
      "AI ticket analysis error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to analyze ticket",
      error: error.message,
    });
  }
});

// =========================================
// EXPORT ROUTER
// =========================================

module.exports = router;