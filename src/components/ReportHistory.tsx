import { Report } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import ReportHistoryItem from "./ReportHistoryItem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReportHistoryProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onClearHistory: () => void;
  onDeleteReport: (reportId: string) => void;
}

const ReportHistory = ({
  reports,
  onSelectReport,
  onClearHistory,
  onDeleteReport,
}: ReportHistoryProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            {reports.length > 0
              ? "Select a report to view its details."
              : "Your previously generated reports will appear here."}
          </CardDescription>
        </div>
        {reports.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  of your analysis reports from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onClearHistory}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, clear history
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardHeader>
      <CardContent>
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportHistoryItem
                key={report.id}
                report={report}
                onSelectReport={onSelectReport}
                onDeleteReport={onDeleteReport}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p>No history yet.</p>
            <p className="text-sm">Upload a video to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportHistory;