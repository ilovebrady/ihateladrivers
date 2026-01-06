import { usePlate } from "@/hooks/use-plates";
import { ReportCard } from "@/components/ReportCard";
import { Loader2, AlertOctagon, Star, MessageSquare } from "lucide-react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PlateDetails() {
  const [match, params] = useRoute("/plate/:id");
  const id = params ? parseInt(params.id) : 0;
  
  const { data: plate, isLoading } = usePlate(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
        <AlertOctagon size={48} className="text-muted-foreground" />
        <h1 className="text-2xl font-bold">Plate Not Found</h1>
        <p className="text-muted-foreground">We couldn't find any records for this license plate ID.</p>
        <Link href="/">
          <Button>Back Home</Button>
        </Link>
      </div>
    );
  }

  // Calculate average rating from reports in details response
  const reports = plate.reports || [];
  const averageRating = reports.length > 0 
    ? (reports.reduce((acc, curr) => acc + Number(curr.rating), 0) / reports.length).toFixed(1)
    : "-";

  return (
    <div className="min-h-screen pb-20">
      {/* Header Stats */}
      <div className="bg-muted/30 border-b border-white/5 py-12">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block mx-auto mb-8">
            <div className="license-plate text-5xl sm:text-7xl px-8 py-4 min-w-[300px] shadow-2xl uppercase">
              {plate.licenseNumber}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-8">
            <div className="p-6 rounded-2xl bg-background/50 border border-white/5 backdrop-blur">
              <div className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Reports</div>
              <div className="text-4xl font-bold flex items-center justify-center gap-2">
                <MessageSquare className="text-primary w-6 h-6" />
                {reports.length}
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-background/50 border border-white/5 backdrop-blur">
              <div className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Avg Rating</div>
              <div className="text-4xl font-bold flex items-center justify-center gap-2 text-orange-500">
                <Star className="w-6 h-6 fill-current" />
                {averageRating}
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 p-6 rounded-2xl bg-background/50 border border-white/5 backdrop-blur flex flex-col items-center justify-center">
              <div className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Status</div>
              <div className="font-bold text-xl uppercase tracking-widest text-red-500">
                {Number(averageRating) > 3 ? "DANGEROUS" : "CAUTION"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 pl-2 border-l-4 border-primary">Incident History</h2>
        
        <div className="space-y-6">
          {reports.length > 0 ? (
            reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
              No detailed reports found for this plate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
