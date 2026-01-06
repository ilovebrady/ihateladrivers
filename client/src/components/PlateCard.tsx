import { motion } from "framer-motion";
import { Star, AlertTriangle, Clock, Share2, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PlateCardProps {
  id: number;
  licenseNumber: string;
  reportCount: number;
  averageRating: number | null;
  lastReported: string | null;
  rank?: number;
}

export function PlateCard({ id, licenseNumber, reportCount, averageRating, lastReported, rank }: PlateCardProps) {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/plate/${id}`;
  const shareText = `check out this terrible driver in la: ${licenseNumber}`;

  const handleShare = (platform: 'twitter' | 'facebook' | 'copy') => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "link copied",
        description: "share this driver with the world",
      });
    } else {
      window.open(urls[platform], '_blank');
    }
  };

  return (
    <div className="group relative">
      <Link href={`/plate/${id}`}>
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="cursor-pointer"
        >
          <div className="glass-panel rounded-xl p-5 hover:border-primary/50 transition-colors h-full flex flex-col justify-between">
            {/* Rank Badge if provided */}
            {rank && rank <= 3 && (
              <div className={`absolute -top-3 -left-3 px-3 h-8 rounded-full flex items-center justify-center font-normal text-white shadow-lg text-[10px] whitespace-nowrap ${
                rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : 'bg-orange-700'
              }`}>
                {rank === 1 ? 'biggest idiot' : rank === 2 ? 'second biggest idiot' : 'third biggest idiot'}
              </div>
            )}

            <div className="space-y-4">
              {/* License Plate Graphic */}
              <div className="flex justify-center">
                <div className="license-plate px-6 py-2 text-3xl sm:text-4xl min-w-[180px] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-shadow uppercase">
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
                    {averageRating ? Number(averageRating).toFixed(1) : "-"}
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
                {lastReported ? formatDistanceToNow(new Date(lastReported), { addSuffix: true }) : 'no reports yet'}
              </div>
              <span className="text-primary/80 font-normal group-hover:translate-x-1 transition-transform">
                view details →
              </span>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Social Share Overlay */}
      <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border"
          onClick={(e) => { e.stopPropagation(); handleShare('twitter'); }}
          title="share on x"
        >
          <Twitter size={14} />
        </Button>
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border"
          onClick={(e) => { e.stopPropagation(); handleShare('facebook'); }}
          title="share on facebook"
        >
          <Facebook size={14} />
        </Button>
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border"
          onClick={(e) => { e.stopPropagation(); handleShare('copy'); }}
          title="copy link"
        >
          <LinkIcon size={14} />
        </Button>
      </div>
    </div>
  );
}
