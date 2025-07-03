import { Report } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
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

interface ReportHistoryItemProps {
  report: Report;
  onSelectReport: (report: Report) => void;
  onDeleteReport: (reportId: string) => void;
}

const ReportHistoryItem = ({
  report,
  onSelectReport,
  onDeleteReport,
}: ReportHistoryItemProps) => {
  const scoreColor =
    report.score >= 80
      ? "text-green-500"
      : report.score >= 50
      ? "text-yellow-500"
      : "text-red-500";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onDeleteReport(report.id);
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors flex flex-col justify-between"
      onClick={() => onSelectReport(report)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-medium truncate pr-2">
            {report.fileName}
          </CardTitle>
          <div className="flex items-center flex-shrink-0">
            {report.score === 100 ? (
              <ShieldCheck className="h-6 w-6 text-green-500" />
            ) : (
              <ShieldAlert className={`h-6 w-6 ${scoreColor}`} />
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the report for "{report.fileName}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="space-y-1">
          <p>
            Score: <span className={`font-bold ${scoreColor}`}>{report.score}</span>
          </p>
          <p>Date: {new Date(report.analyzedAt).toLocaleDateString()}</p>
        </div>
        <div className="relative h-16 w-16">
          <svg className="h-full w-full" viewBox="0 0 36 36">
            <path
              className="text-gray-200 dark:text-gray-700"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className={scoreColor}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${report.score}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${scoreColor}`}>
              {report.score}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportHistoryItem;