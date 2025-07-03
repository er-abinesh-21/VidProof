import { useState, useEffect } from "react";
import Header from "@/components/Header";
import VideoUpload from "@/components/VideoUpload";
import ReportDisplay from "@/components/ReportDisplay";
import ReportHistory from "@/components/ReportHistory";
import { Report } from "@/types";
import { Progress } from "@/components/ui/progress";
import { MadeWithDyad } from "@/components/made-with-dyad";

// Mock data for a tampered video
const mockTamperedReport: Omit<Report, "id" | "fileName" | "analyzedAt"> = {
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
};

// Mock data for an authentic video
const mockAuthenticReport: Omit<Report, "id" | "fileName" | "analyzedAt"> = {
  score: 98,
  summary:
    "The video appears to be authentic. Frame analysis is consistent, metadata is intact, and audio is synchronized.",
  issues: [],
};

const Index = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("vidproof_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage:", error);
      setHistory([]);
    }
  }, []);

  const handleAnalyze = (file: File) => {
    setIsLoading(true);
    setReport(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const baseReport =
        Math.random() > 0.5 ? mockTamperedReport : mockAuthenticReport;
      
      const newReport: Report = {
        ...baseReport,
        id: `rep_${Date.now()}`,
        fileName: file.name,
        analyzedAt: new Date().toISOString(),
      };

      setReport(newReport);
      const updatedHistory = [newReport, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("vidproof_history", JSON.stringify(updatedHistory));

      setIsLoading(false);
    }, 4000);
  };

  const handleSelectReport = (selectedReport: Report) => {
    setReport(selectedReport);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("vidproof_history");
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

        <ReportHistory
          reports={history}
          onSelectReport={handleSelectReport}
          onClearHistory={handleClearHistory}
        />
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;