import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Helper to handle Zod errors from backend responses
const parseResponse = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("[Zod] Validation failed:", result.error);
    // In production we might want to throw, but for now return raw data if schema fails
    // to prevent app crashing on minor mismatches
    return data as T; 
  }
  return result.data;
};

// GET /api/plates
export function usePlates(sort?: 'worst' | 'recent' | 'popular', search?: string) {
  return useQuery({
    queryKey: [api.plates.list.path, sort, search],
    queryFn: async () => {
      const url = new URL(window.location.origin + api.plates.list.path);
      if (sort) url.searchParams.set("sort", sort);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch plates");
      
      const data = await res.json();
      return parseResponse(api.plates.list.responses[200], data);
    },
  });
}

// GET /api/plates/:id
export function usePlate(id: number) {
  return useQuery({
    queryKey: [api.plates.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.plates.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch plate details");
      
      const data = await res.json();
      return parseResponse(api.plates.get.responses[200], data);
    },
  });
}

// POST /api/plates/analyze (Mock AI analysis)
export function useAnalyzePlate() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      // Simulate delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await fetch(api.plates.analyze.path, {
        method: api.plates.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to analyze image");
      }
      
      return parseResponse(api.plates.analyze.responses[200], await res.json());
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
