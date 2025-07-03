import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoUpload from "@/components/VideoUpload";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { showError } from "@/utils/toast";
import { analyzeVideoClientSide } from "@/lib/video-analyzer";

const Index = () => {
  const { session, supabase, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  const handleAnalyze = async (file: File) => {
    setIsLoading(true);
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
          .select('id')
          .single();

        if (dbError) throw dbError;

        if (savedReport) {
          navigate(`/reports/${savedReport.id}`);
        } else {
          throw new Error("Failed to save the report.");
        }
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      showError(`Analysis failed: ${error.message || 'Please try again.'}`);
      setProgress(0);
      setProgressMessage('');
      setIsLoading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <VideoUpload onAnalyze={handleAnalyze} isLoading={isLoading} />

      {isLoading && (
        <div className="w-full max-w-2xl mt-8 space-y-2">
          <p className="text-center text-sm text-muted-foreground">{progressMessage}</p>
          <Progress value={progress} className="w-full [&>div]:bg-purple-400" />
        </div>
      )}
    </div>
  );
};

export default Index;