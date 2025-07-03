import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoUpload from "@/components/VideoUpload";
import ReportDisplay from "@/components/ReportDisplay";
import ReportHistory from "@/components/ReportHistory";
import { Report } from "@/types";
import { Progress } from "@/components/ui/progress";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
  const { session, supabase, loading } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (session) {
        try {
          const { data, error } = await supabase
            .from('reports')
            .select('id, file_name, score, summary, issues, analyzed_at')
            .order('analyzed_at', { ascending: false });

          if (error) throw error;

          if (data) {
            const formattedHistory: Report[] = data.map((report: any) => ({
              id: report.id,
              fileName: report.file_name,
              score: report.score,
              summary: report.summary,
              issues: report.issues,
              analyzedAt: report.analyzed_at,
            }));
            setHistory(formattedHistory);
          }
        } catch (error) {
          console.error("Failed to load history from database:", error);
          setHistory([]);
        }
      }
    };

    fetchHistory();
  }, [session, supabase]);

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

    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);
      
      const baseReport =
        Math.random() > 0.5 ? mockTamperedReport : mockAuthenticReport;
      
      if (session) {
        try {
          const { data: savedReport, error } = await supabase
            .from('reports')
            .insert({
              user_id: session.user.id,
              file_name: file.name,
              score: baseReport.score,
              summary: baseReport.summary,
              issues: baseReport.issues,
            })
            .select('id, file_name, score, summary, issues, analyzed_at')
            .single();

          if (error) throw error;

          if (savedReport) {
            const newReport: Report = {
              id: savedReport.id,
              fileName: savedReport.file_name,
              score: savedReport.score,
              summary: savedReport.summary,
              issues: savedReport.issues,
              analyzedAt: savedReport.analyzed_at,
            };
            setReport(newReport);
            setHistory(prevHistory => [newReport, ...prevHistory]);
          }
        } catch (error) {
          console.error("Failed to save report:", error);
        }
      }

      setIsLoading(false);
    }, 4000);
  };

  const handleSelectReport = (selectedReport: Report) => {
    setReport(selectedReport);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearHistory = async () => {
    if (session) {
      try {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('user_id', session.user.id);
        
        if (error) throw error;

        setHistory([]);
        if (report && history.find(h => h.id === report.id)) {
          setReport(null);
        }
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
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