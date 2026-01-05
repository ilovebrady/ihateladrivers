import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDropzone } from "react-dropzone";
import { useAnalyzePlate } from "@/hooks/use-plates";
import { useCreateReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Loader2, Camera, Upload, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Helper to convert file to base64 for our mock backend
const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
});

export default function Report() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Form State
  const [licenseNumber, setLicenseNumber] = useState("");
  const [rating, setRating] = useState([3]); // 1-5 scale
  const [comment, setComment] = useState("");
  const [locationStr, setLocationStr] = useState("");

  const analyzeMutation = useAnalyzePlate();
  const createReportMutation = useCreateReport();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      
      // Auto-analyze upon upload
      const base64 = await toBase64(file);
      analyzeMutation.mutate(base64, {
        onSuccess: (data) => {
          setLicenseNumber(data.licenseNumber);
          setStep(2);
        }
      });
    }
  }, [analyzeMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB limit
  });

  const handleSubmit = () => {
    if (!imagePreview) return;
    
    createReportMutation.mutate({
      licenseNumber,
      imageUrl: imagePreview, // In a real app, upload to S3 first and get URL
      rating: rating[0],
      comment,
      location: locationStr,
    }, {
      onSuccess: () => {
        setStep(3);
        setTimeout(() => setLocation("/"), 3000); // Redirect after success
      }
    });
  };

  if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen py-12 px-4 container max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display font-bold mb-2 uppercase">Report Incident</h1>
        <p className="text-muted-foreground">Document dangerous driving in Los Angeles.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div 
              {...getRootProps()} 
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
              `}
            >
              <input {...getInputProps()} />
              {analyzeMutation.isPending ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-lg font-medium animate-pulse">Analyzing License Plate...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-2">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold">Upload Evidence</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Drag and drop a photo of the car/plate, or click to select from your device.
                  </p>
                  <Button variant="secondary" className="mt-4 pointer-events-none">
                    <Upload className="mr-2 h-4 w-4" /> Select Photo
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl space-y-8"
          >
            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden h-48 bg-black/50 border border-white/10">
              <img src={imagePreview!} alt="Evidence" className="w-full h-full object-contain" />
              <button 
                onClick={() => setStep(1)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
              >
                Change Photo
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plate">License Plate Number</Label>
                <div className="relative">
                  <Input 
                    id="plate" 
                    value={licenseNumber} 
                    onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                    className="font-display text-3xl tracking-widest text-center h-16 uppercase bg-white text-black border-4 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">EDITABLE</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>How bad was it? (1-5)</Label>
                  <span className="text-2xl font-bold text-primary">{rating[0]}/5</span>
                </div>
                <Slider 
                  value={rating} 
                  onValueChange={setRating} 
                  max={5} 
                  min={1} 
                  step={1} 
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Annoying</span>
                  <span>Dangerous</span>
                  <span>Criminal</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">What happened?</Label>
                <Textarea 
                  id="comment" 
                  placeholder="Cut me off on the highway, didn't use blinker..." 
                  className="bg-background/50"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. I-95 South, Exit 42" 
                  className="bg-background/50"
                  value={locationStr}
                  onChange={(e) => setLocationStr(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full h-12 text-lg font-bold"
                disabled={createReportMutation.isPending || !licenseNumber}
              >
                {createReportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>Submit Report <ArrowRight className="ml-2" /></>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-6"
          >
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-display font-bold">Report Filed!</h2>
            <p className="text-xl text-muted-foreground">
              Thank you for contributing to road safety. <br/>
              Redirecting you to the home page...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
