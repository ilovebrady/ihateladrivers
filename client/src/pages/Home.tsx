import { usePlates } from "@/hooks/use-plates";
import { PlateCard } from "@/components/PlateCard";
import { Loader2, AlertTriangle, TrendingUp, ShieldAlert, Car, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plate, Report } from "@shared/schema";

export default function Home() {
  // Sort by 'popular' to show highest report count plates first
  const { data: plates, isLoading } = usePlates('popular');

  const { data: brandStats, isLoading: isBrandsLoading } = useQuery<{ make: string; count: number; avgRating: number }[]>({
    queryKey: ["/api/brands/stats"],
  });

  const { data: recentReports } = useQuery<Report[]>({
    queryKey: ["/api/reports/recent"],
  });

  // Calculate city frequency for "places to avoid"
  const cityStats = recentReports?.reduce((acc: Record<string, number>, report) => {
    if (report.location) {
      acc[report.location] = (acc[report.location] || 0) + 1;
    }
    return acc;
  }, {});

  const topCities = Object.entries(cityStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  console.log("Recent Reports:", recentReports);
  console.log("City Stats:", cityStats);
  console.log("Top Cities:", topCities);

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500/80 text-sm font-normal mb-6 border border-blue-500/20">
              <ShieldAlert size={14} className="text-blue-500/60" />
              <span>don't take pictures while driving!</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-normal mb-6 leading-none text-foreground">
              terrible driver? <br />
              <span className="text-primary">
                welcome to california
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              see a terrible driver? take a pic and provide them public shame! it is the right thing to do :)
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/report">
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                  upload socal driver
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white">
                  find terrible driver
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats and Places Section */}
      <section className="container max-w-7xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Brand Tally */}
          <Card className="lg:col-span-2 border-none shadow-none bg-muted/30">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {brandStats?.map((brand: any) => (
                    <div key={brand.make} className="bg-background p-4 rounded-xl border flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-normal text-muted-foreground">{brand.make?.toLowerCase()}</span>
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

          {/* Places to Avoid */}
          <Card className="border-none shadow-none bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-normal">
                <MapPin className="text-primary" />
                places to avoid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCities.map(([city, count], index) => (
                  <div key={city} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{index + 1}.</span>
                      <span className="text-sm font-normal">{city.toLowerCase()}</span>
                    </div>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                      {count} reports
                    </span>
                  </div>
                ))}
                {topCities.length === 0 && (
                  <p className="text-muted-foreground italic text-center py-4">
                    Waiting for location data...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="container max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-normal flex items-center gap-3">
              <TrendingUp className="text-primary" />
              biggest idiots
            </h2>
            <p className="text-muted-foreground mt-2 font-normal">Drivers with the highest severity ratings this week.</p>
          </div>
          <Link href="/search">
            <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-primary font-normal">
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
              <p className="text-muted-foreground text-lg font-normal">No reports yet. Be the first to report a bad driver!</p>
              <Link href="/report">
                <Button className="mt-4 font-normal" variant="outline">Start Reporting</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
