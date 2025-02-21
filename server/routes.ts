import type { Express } from "express";
import { createServer, type Server } from "http";
import { arrayInputSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /bfhl endpoint
  app.post("/api/bfhl", async (req, res) => {
    try {
      // Validate input
      const { data } = arrayInputSchema.parse(req.body);
      
      // Process arrays
      const numbers = data.filter(item => !isNaN(Number(item)));
      const alphabets = data.filter(item => /^[A-Za-z]$/.test(item));
      const highest_alphabet = alphabets.length > 0 ? 
        alphabets.reduce((a, b) => a.toLowerCase() > b.toLowerCase() ? a : b) : 
        undefined;

      res.json({
        is_success: true,
        user_id: "john_doe_17091999",
        email: "john@xyz.com",
        roll_number: "ABCD123",
        numbers,
        alphabets,
        highest_alphabet
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          is_success: false,
          message: "Invalid input format" 
        });
      } else {
        res.status(500).json({ 
          is_success: false,
          message: "Internal server error" 
        });
      }
    }
  });

  // GET /bfhl endpoint
  app.get("/api/bfhl", (_req, res) => {
    res.json({ operation_code: 1 });
  });

  const httpServer = createServer(app);
  return httpServer;
}
