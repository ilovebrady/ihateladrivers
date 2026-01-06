import { formatDistanceToNow } from "date-fns";
import { Star, MapPin, Quote } from "lucide-react";
import type { Report } from "@shared/schema";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden group">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="w-full md:w-48 h-48 bg-muted relative shrink-0">
          {report.imageUrl && (
            <img 
              src={report.imageUrl} 
              alt="Report evidence" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                console.error("Image load error:", report.imageUrl);
                (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=No+Photo";
              }}
            />
          )}
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
            <Star size={12} className="text-orange-500" fill="currentColor" />
            {report.rating}/5
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">User {report.reporterId?.slice(0,6)}...</span>
                <span>•</span>
                <span>{report.createdAt ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true }) : 'Just now'}</span>
              </div>
            </div>

            {report.comment && (
              <div className="relative mb-4">
                <Quote className="absolute -left-2 -top-2 text-white/5 w-8 h-8 rotate-180" />
                <p className="text-foreground/90 italic pl-6 border-l-2 border-primary/20">
                  "{report.comment}"
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <MapPin size={12} className="text-primary" />
            {report.location || "Unknown location"}
          </div>
        </div>
      </div>
    </div>
  );
}
