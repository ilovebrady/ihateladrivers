import { usePlates } from "@/hooks/use-plates";
import { PlateCard } from "@/components/PlateCard";
import { Loader2, AlertTriangle, TrendingUp, ShieldAlert, Car } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  // Sort by 'worst' to show highest average rating plates first
  const { data: plates, isLoading } = usePlates('worst');

  const { data: brandStats, isLoading: isBrandsLoading } = useQuery({
    queryKey: ["/api/brands/stats"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-normal mb-6 border border-primary/20">
              <ShieldAlert size={14} />
              <span>Community Driven Road Safety</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-normal mb-6 leading-none">
              terrible driver? <br />
              <span className="text-primary">
                keep them accountable
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Join the community database of road incidents. Spot bad driving? 
              Snap a photo, rate the driver, and help keep our roads accountable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/report">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Report a Driver
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white">
                  Search Database
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Tally Section */}
      <section className="container max-w-7xl mx-auto px-4 mb-20">
        <Card className="border-none shadow-none bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-normal">
              <Car className="text-primary" />
              worst driving brands
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isBrandsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {brandStats?.map((brand: any) => (
                  <div key={brand.make} className="bg-background p-4 rounded-xl border flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-normal text-muted-foreground">{brand.make}</span>
                    <span className="text-2xl font-normal text-primary">{brand.count}</span>
                    <span className="text-xs text-muted-foreground">reports</span>
                  </div>
                ))}
                {(!brandStats || brandStats.length === 0) && (
                  <div className="col-span-full py-8 text-center text-muted-foreground italic">
                    Waiting for brand data...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Leaderboard Section */}
      <section className="container max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-normal flex items-center gap-3">
              <TrendingUp className="text-primary" />
              community reports
            </h2>
            <p className="text-muted-foreground mt-2">Drivers with the highest severity ratings this week.</p>
          </div>
          <Link href="/search">
            <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-primary">
              View All Plates →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plates?.map((plate, index) => (
            <motion.div
              key={plate.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlateCard
                id={plate.id}
                licenseNumber={plate.licenseNumber}
                reportCount={plate.reportCount}
                averageRating={plate.averageRating}
                lastReported={plate.createdAt ? new Date(plate.createdAt).toISOString() : null}
                rank={index + 1}
              />
            </motion.div>
          ))}

          {(!plates || plates.length === 0) && (
            <div className="col-span-full py-20 text-center glass-panel rounded-xl border-dashed">
              <p className="text-muted-foreground text-lg">No reports yet. Be the first to report a bad driver!</p>
              <Link href="/report">
                <Button className="mt-4" variant="outline">Start Reporting</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
