import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Report } from "@/types";
import Header from "@/components/Header";
import ReportDisplay from "@/components/ReportDisplay";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { showError } from "@/utils/toast";

const ReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { session, supabase, loading } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    const fetchReport = async () => {
      if (session && id) {
        try {
          setIsFetching(true);
          const { data, error } = await supabase
            .from('reports')
            .select('id, file_name, score, summary, issues, analyzed_at')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .single();

          if (error) throw error;
          
          if (data) {
            setReport({
              id: data.id,
              fileName: data.file_name,
              score: data.score,
              summary: data.summary,
              issues: data.issues,
              analyzedAt: data.analyzed_at,
            });
          } else {
            showError("Report not found or you don't have permission to view it.");
            navigate('/reports');
          }
        } catch (error) {
          console.error("Failed to load report:", error);
          showError("Could not load the report.");
          navigate('/reports');
        } finally {
          setIsFetching(false);
        }
      }
    };

    if (session) {
      fetchReport();
    }
  }, [session, supabase, id, navigate]);

  if (loading || isFetching || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading report...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex justify-start">
          <Button variant="outline" asChild>
            <Link to="/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Reports
            </Link>
          </Button>
        </div>
        {report ? (
          <ReportDisplay report={report} />
        ) : (
          <p>Report not found.</p>
        )}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default ReportDetailPage;