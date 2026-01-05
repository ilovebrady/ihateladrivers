import { pgTable, text, serial, integer, timestamp, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Export auth and chat models
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

export const plates = pgTable("plates", {
  id: serial("id").primaryKey(),
  licenseNumber: varchar("license_number", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  plateId: integer("plate_id").references(() => plates.id),
  reporterId: varchar("reporter_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  carMake: varchar("car_make", { length: 50 }),
  rating: integer("rating").notNull(), // 1-5, 5 is worst
  comment: text("comment"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platesRelations = relations(plates, ({ many }) => ({
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  plate: one(plates, {
    fields: [reports.plateId],
    references: [plates.id],
  }),
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
}));

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  plateId: true,
  reporterId: true,
}).extend({
  licenseNumber: z.string().min(1, "License plate is required"),
});

export const analyzeImageSchema = z.object({
  imageUrl: z.string(),
});

export type Plate = typeof plates.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type PlateWithStats = Plate & {
  reportCount: number;
  averageRating: number | null;
  lastReported: Date | null;
};
