import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === Plates API ===

  app.get(api.plates.list.path, async (req, res) => {
    try {
      const sort = req.query.sort as 'worst' | 'recent' | 'popular' | undefined;
      const search = req.query.search as string | undefined;
      const plates = await storage.getPlates(sort, search);
      res.json(plates);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch plates" });
    }
  });

  app.get(api.plates.get.path, async (req, res) => {
    try {
      const plate = await storage.getPlate(Number(req.params.id));
      if (!plate) {
        return res.status(404).json({ message: "Plate not found" });
      }
      res.json(plate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plate" });
    }
  });

  app.post(api.plates.analyze.path, async (req, res) => {
    try {
      const { imageUrl } = api.plates.analyze.input.parse(req.body);

      // Use OpenAI Vision to detect license plate
      const response = await openai.chat.completions.create({
        model: "gpt-5.1", // Or appropriate vision model if gpt-5.1 supports it, or generic vision fallback
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Identify the license plate number in this image. Return ONLY the alphanumeric text of the license plate, no other text or explanation. If no plate is visible, return 'UNKNOWN'." },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 20,
      });

      const plateNumber = response.choices[0].message.content?.trim().replace(/[^A-Z0-9]/gi, '') || "UNKNOWN";

      res.json({ licenseNumber: plateNumber });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // === Reports API ===

  app.post(api.reports.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.reports.create.input.parse(req.body);
      
      // Find or create plate
      let plate = await storage.getPlateByNumber(input.licenseNumber);
      if (!plate) {
        plate = await storage.createPlate(input.licenseNumber);
      }

      const report = await storage.createReport(req.user!.id, {
        ...input,
        plateId: plate.id,
      });

      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          field: error.errors[0].path.join('.'),
        });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get(api.reports.list.path, async (req, res) => {
    const reports = await storage.getRecentReports();
    res.json(reports);
  });

  // Initialize seed data
  seedDatabase();

  return httpServer;
}

// Seed function
async function seedDatabase() {
  try {
    const plates = await storage.getPlates();
    if (plates.length === 0) {
      console.log("Seeding database...");
      const p1 = await storage.createPlate("BADDRVR");
      const p2 = await storage.createPlate("CUTOFF");
      
      // We need a user ID. If none exists, we can't easily seed reports with valid reporterId without creating a user first.
      // Skipping report seeding if no users, or we can mock it if we had a seed user.
      // For now, just plates is fine.
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}
