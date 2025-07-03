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
}

const ReportHistory = ({
  reports,
  onSelectReport,
  onClearHistory,
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
              <TableHead className="text-right">Action</TableHead>
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
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectReport(report)}
                  >
                    <Eye className="h-4 w-4" />
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