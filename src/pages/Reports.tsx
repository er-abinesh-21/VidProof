import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Report } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Trash2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const ReportsPage = () => {
  const { session, supabase, loading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    const fetchReports = async () => {
      if (session) {
        try {
          setIsFetching(true);
          const { data, error } = await supabase
            .from('reports')
            .select('id, file_name, score, summary, issues, analyzed_at')
            .order('analyzed_at', { ascending: false });

          if (error) throw error;

          if (data) {
            const formattedReports: Report[] = data.map((report: any) => ({
              id: report.id,
              fileName: report.file_name,
              score: report.score,
              summary: report.summary,
              issues: report.issues,
              analyzedAt: report.analyzed_at,
            }));
            setReports(formattedReports);
          }
        } catch (error) {
          console.error("Failed to load reports:", error);
          showError("Could not load your reports.");
        } finally {
          setIsFetching(false);
        }
      }
    };

    if (session) {
      fetchReports();
    }
  }, [session, supabase]);

  const handleClearHistory = async () => {
    if (session && window.confirm("Are you sure you want to delete all your reports? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('user_id', session.user.id);
        
        if (error) throw error;

        setReports([]);
        showSuccess("All reports have been deleted.");
      } catch (error) {
        console.error("Failed to clear history:", error);
        showError("Could not delete your reports.");
      }
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
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-neon-sm transition-all hover:shadow-neon">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>My Reports</CardTitle>
          <CardDescription>
            A complete history of all your video analyses.
          </CardDescription>
        </div>
        {reports.length > 0 && (
          <Button variant="destructive" onClick={handleClearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b-primary/20">
              <TableHead>File Name</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Loading reports...
                </TableCell>
              </TableRow>
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report.id} className="border-b-primary/10 hover:bg-primary/10">
                  <TableCell className="font-medium">{report.fileName}</TableCell>
                  <TableCell>{report.score}</TableCell>
                  <TableCell>
                    {new Date(report.analyzedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link to={`/reports/${report.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  You haven't analyzed any videos yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReportsPage;