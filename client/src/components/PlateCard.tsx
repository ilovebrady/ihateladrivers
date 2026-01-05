import { motion } from "framer-motion";
import { Star, AlertTriangle, Clock } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface PlateCardProps {
  id: number;
  licenseNumber: string;
  reportCount: number;
  averageRating: number | null;
  lastReported: string | null;
  rank?: number;
}

export function PlateCard({ id, licenseNumber, reportCount, averageRating, lastReported, rank }: PlateCardProps) {
  return (
    <Link href={`/plate/${id}`}>
      <motion.div 
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="group relative cursor-pointer"
      >
        <div className="glass-panel rounded-xl p-5 hover:border-primary/50 transition-colors h-full flex flex-col justify-between">
          {/* Rank Badge if provided */}
          {rank && rank <= 3 && (
            <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-normal text-white shadow-lg ${
              rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : 'bg-orange-700'
            }`}>
              {rank}
            </div>
          )}

          <div className="space-y-4">
            {/* License Plate Graphic */}
            <div className="flex justify-center">
              <div className="license-plate px-6 py-2 text-3xl sm:text-4xl min-w-[180px] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-shadow">
                {licenseNumber}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-background/40 rounded-lg p-2.5 text-center border border-white/5">
                <div className="flex items-center justify-center text-orange-500 mb-1">
                  <Star size={16} fill="currentColor" />
                </div>
                <div className="text-xl font-normal text-foreground">
                  {averageRating ? averageRating.toFixed(1) : "-"}
                </div>
                <div className="text-[10px] tracking-wider text-muted-foreground">avg rating</div>
              </div>
              
              <div className="bg-background/40 rounded-lg p-2.5 text-center border border-white/5">
                <div className="flex items-center justify-center text-primary mb-1">
                  <AlertTriangle size={16} />
                </div>
                <div className="text-xl font-normal text-foreground">{reportCount}</div>
                <div className="text-[10px] tracking-wider text-muted-foreground">reports</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              {lastReported ? formatDistanceToNow(new Date(lastReported), { addSuffix: true }) : 'No reports yet'}
            </div>
            <span className="text-primary/80 font-normal group-hover:translate-x-1 transition-transform">
              view details →
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
