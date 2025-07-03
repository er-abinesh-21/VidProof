import { useState } from "react";
import Header from "@/components/Header";
import VideoUpload from "@/components/VideoUpload";
import ReportDisplay from "@/components/ReportDisplay";
import { Report } from "@/types";
import { Progress } from "@/components/ui/progress";
import { MadeWithDyad } from "@/components/made-with-dyad";

// Mock data for a tampered video
const mockTamperedReport: Report = {
  id: "rep_12345",
  fileName: "cctv_feed_01.mp4",
  score: 42,
  summary:
    "The video shows significant signs of tampering. Multiple frame drops were detected, and metadata timestamps do not align with the content. Audio appears to be out of sync in several sections.",
  issues: [
    {
      timestamp: "00:01:15",
      description: "Potential frame splice detected.",
      severity: "high",
    },
    {
      timestamp: "00:02:30",
      description: "Metadata timestamp mismatch.",
      severity: "medium",
    },
    {
      timestamp: "00:02:45",
      description: "Audio/video desynchronization of 250ms.",
      severity: "medium",
    },
    {
      timestamp: "00:03:50",
      description: "Unusual encoding artifact found.",
      severity: "low",
    },
  ],
  analyzedAt: new Date().toISOString(),
};

// Mock data for an authentic video
const mockAuthenticReport: Report = {
  id: "rep_67890",
  fileName: "archive_footage_22.avi",
  score: 98,
  summary:
    "The video appears to be authentic. Frame analysis is consistent, metadata is intact, and audio is synchronized.",
  issues: [],
  analyzedAt: new Date().toISOString(),
};

const Index = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = (file: File) => {
    setIsLoading(true);
    setReport(null);
    setProgress(0);

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    // Simulate network delay and analysis time
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      // Randomly choose between the two mock reports
      const randomReport =
        Math.random() > 0.5 ? mockTamperedReport : mockAuthenticReport;
      randomReport.fileName = file.name; // Use the actual file name
      setReport(randomReport);
      setIsLoading(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <VideoUpload onAnalyze={handleAnalyze} isLoading={isLoading} />

        {isLoading && (
          <div className="space-y-4 text-center">
            <p>Analyzing video... This may take a moment.</p>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {report && !isLoading && <ReportDisplay report={report} />}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;