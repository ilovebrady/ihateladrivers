import { useState } from "react";
import { usePlates } from "@/hooks/use-plates";
import { PlateCard } from "@/components/PlateCard";
import { Input } from "@/components/ui/input";
import { Loader2, Search as SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // We need to create this simple hook or implement inline

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  // Simple debounce logic could be extracted, but for brevity using immediate value or custom hook logic
  // Let's assume user types and we query. Ideally use useDebounce hook.
  
  const { data: plates, isLoading } = usePlates('recent', searchTerm);

  return (
    <div className="min-h-screen container max-w-6xl mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12 space-y-4">
        <h1 className="text-4xl font-display font-bold">Search Database</h1>
        <p className="text-muted-foreground">Find a specific plate number to see their driving history.</p>
        
        <div className="relative max-w-lg mx-auto mt-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="pl-12 h-14 text-lg bg-secondary/50 border-white/10 focus:border-primary rounded-xl"
            placeholder="Enter license plate number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plates?.map((plate) => (
            <PlateCard
              key={plate.id}
              id={plate.id}
              licenseNumber={plate.licenseNumber}
              reportCount={plate.reportCount}
              averageRating={plate.averageRating}
              lastReported={plate.createdAt ? new Date(plate.createdAt).toISOString() : null}
            />
          ))}
          
          {plates?.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              No plates found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
