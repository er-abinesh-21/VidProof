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
import { showError, showSuccess } from "@/utils/toast";
import { analyzeVideoClientSide } from "@/lib/video-analyzer";
import { UserNav } from "@/components/UserNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { session, supabase, loading } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{
    action: () => void;
    title: string;
    description: string;
  } | null>(null);

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

        if (dbError) throw dbError;

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

  const handleDeleteReport = (reportId: string) => {
    setActionToConfirm({
      title: 'Are you absolutely sure?',
      description: 'This action cannot be undone. This will permanently delete this report from our servers.',
      action: async () => {
        if (!session) return;
        try {
          const { error } = await supabase.from('reports').delete().eq('id', reportId);
          if (error) throw error;
          setHistory(prev => prev.filter(r => r.id !== reportId));
          if (report?.id === reportId) setReport(null);
          showSuccess("Report deleted.");
        } catch (err) {
          showError("Failed to delete report.");
        }
      }
    });
    setIsAlertOpen(true);
  };

  const handleClearHistory = () => {
    setActionToConfirm({
      title: 'Are you sure you want to clear all history?',
      description: 'This action cannot be undone. This will permanently delete all of your reports.',
      action: async () => {
        if (!session) return;
        try {
          const { error } = await supabase.from('reports').delete().eq('user_id', session.user.id);
          if (error) throw error;
          setHistory([]);
          setReport(null);
          showSuccess("History cleared.");
        } catch (err) {
          showError("Failed to clear history.");
        }
      }
    });
    setIsAlertOpen(true);
  };

  const onConfirm = () => {
    actionToConfirm?.action();
    setIsAlertOpen(false);
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
          onClearHistory={handleClearHistory}
          onDeleteReport={handleDeleteReport}
        />
      </main>
      <MadeWithDyad />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionToConfirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionToConfirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;