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
import { showSuccess, showError } from "@/utils/toast";
import { analyzeVideoClientSide } from "@/lib/video-analyzer";
import { UserNav } from "@/components/UserNav";

const Index = () => {
  const { session, supabase, loading } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

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

  const handleAnalyze = async (file: File) => {
    setIsLoading(true);
    setReport(null);
    setProgress(0);
    setProgressMessage('Starting analysis...');

    const progressCallback = (message: string, value: number) => {
      setProgressMessage(message);
      setProgress(value);
    };

    try {
      const analysisResult = await analyzeVideoClientSide(file, progressCallback);
      
      progressCallback('Saving report...', 100);
      
      if (session) {
        const { data: savedReport, error: dbError } = await supabase
          .from('reports')
          .insert({
            user_id: session.user.id,
            file_name: file.name,
            score: analysisResult.score,
            summary: analysisResult.summary,
            issues: analysisResult.issues,
          })
          .select('id, file_name, score, summary, issues, analyzed_at')
          .single();

        if (dbError) {
          throw dbError;
        }

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
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      showError(`Analysis failed: ${error.message || 'Please try again.'}`);
      setProgress(0);
      setProgressMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReport = (selectedReport: Report) => {
    setReport(selectedReport);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteReport = async (reportId: string) => {
    if (session) {
      try {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('id', reportId);

        if (error) throw error;

        setHistory(prevHistory => prevHistory.filter(r => r.id !== reportId));
        if (report?.id === reportId) {
          setReport(null);
        }
        showSuccess("Report deleted successfully.");
      } catch (error: any) {
        showError(`Failed to delete report: ${error.message}`);
      }
    }
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
        setReport(null);
        showSuccess("Analysis history cleared.");
      } catch (error: any) {
        showError(`Failed to clear history: ${error.message}`);
      }
    }
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
          <UserNav />
        </div>
        <VideoUpload onAnalyze={handleAnalyze} isLoading={isLoading} />

        {isLoading && (
          <div className="space-y-4 text-center">
            <p>{progressMessage}</p>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {report && !isLoading && <ReportDisplay report={report} />}

        <ReportHistory
          reports={history}
          onSelectReport={handleSelectReport}
          onDeleteReport={handleDeleteReport}
          onClearHistory={handleClearHistory}
        />
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;