import { db } from "./db";
import {
  plates,
  reports,
  type Plate,
  type Report,
  type InsertReport,
  type PlateWithStats
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Plates
  getPlates(sort?: 'worst' | 'recent' | 'popular', search?: string): Promise<PlateWithStats[]>;
  getPlate(id: number): Promise<Plate & { reports: Report[] } | undefined>;
  getPlateByNumber(licenseNumber: string): Promise<Plate | undefined>;
  createPlate(licenseNumber: string): Promise<Plate>;

  // Reports
  createReport(userId: string, report: InsertReport & { plateId: number }): Promise<Report>;
  getRecentReports(): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  async getPlates(sort: 'worst' | 'recent' | 'popular' = 'recent', search?: string): Promise<PlateWithStats[]> {
    let query = db.select({
      ...plates,
      reportCount: sql<number>`count(${reports.id})::int`,
      averageRating: sql<number>`avg(${reports.rating})`,
      lastReported: sql<Date>`max(${reports.createdAt})`,
    })
    .from(plates)
    .leftJoin(reports, eq(plates.id, reports.plateId))
    .groupBy(plates.id);

    if (search) {
      query.where(sql`${plates.licenseNumber} ILIKE ${`%${search}%`}`);
    }

    // This is a bit complex for Drizzle's query builder without simpler relations, 
    // but the above is standard SQL grouping.
    // For sorting:
    if (sort === 'worst') {
      query.orderBy(sql`avg(${reports.rating}) DESC NULLS LAST`);
    } else if (sort === 'popular') {
      query.orderBy(sql`count(${reports.id}) DESC`);
    } else {
      query.orderBy(desc(plates.createdAt));
    }

    const results = await query;
    return results;
  }

  async getPlate(id: number): Promise<Plate & { reports: Report[] } | undefined> {
    const plate = await db.query.plates.findFirst({
      where: eq(plates.id, id),
    });

    if (!plate) return undefined;

    const plateReports = await db.query.reports.findMany({
      where: eq(reports.plateId, id),
      orderBy: desc(reports.createdAt),
      with: {
        reporter: true
      }
    });

    return { ...plate, reports: plateReports };
  }

  async getPlateByNumber(licenseNumber: string): Promise<Plate | undefined> {
    return db.query.plates.findFirst({
      where: eq(plates.licenseNumber, licenseNumber),
    });
  }

  async createPlate(licenseNumber: string): Promise<Plate> {
    const [plate] = await db.insert(plates)
      .values({ licenseNumber })
      .returning();
    return plate;
  }

  async createReport(userId: string, report: InsertReport & { plateId: number }): Promise<Report> {
    const [newReport] = await db.insert(reports)
      .values({
        ...report,
        reporterId: userId,
      })
      .returning();
    return newReport;
  }

  async getRecentReports(): Promise<Report[]> {
    return db.query.reports.findMany({
      orderBy: desc(reports.createdAt),
      limit: 10,
    });
  }
}

export const storage = new DatabaseStorage();
