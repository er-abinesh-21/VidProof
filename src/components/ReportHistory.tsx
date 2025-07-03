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

interface ReportHistoryProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onClearHistory: () => void;
}

const ReportHistory = ({
  reports,
  onSelectReport,
  onClearHistory,
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
          <Button variant="outline" size="sm" onClick={onClearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
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