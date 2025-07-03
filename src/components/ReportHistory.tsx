import { Report } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { Eye, Trash2 } from "lucide-react";

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
  if (reports.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            View your previously generated reports.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onClearHistory}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.fileName}</TableCell>
                <TableCell>{report.score}</TableCell>
                <TableCell>
                  {new Date(report.analyzedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectReport(report)}
                    title="View Report"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteReport(report.id)}
                    title="Delete Report"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReportHistory;