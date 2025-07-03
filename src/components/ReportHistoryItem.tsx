import { Report } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface ReportHistoryItemProps {
  report: Report;
  onSelectReport: (report: Report) => void;
}

const ReportHistoryItem = ({ report, onSelectReport }: ReportHistoryItemProps) => {
  const scoreColor =
    report.score >= 80
      ? "text-green-500"
      : report.score >= 50
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors flex flex-col justify-between"
      onClick={() => onSelectReport(report)}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between text-lg">
          <span className="truncate pr-2 font-medium">{report.fileName}</span>
          {report.score === 100 ? (
            <ShieldCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
          ) : (
            <ShieldAlert className={`h-6 w-6 ${scoreColor} flex-shrink-0`} />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="space-y-1">
          <p>Score: <span className={`font-bold ${scoreColor}`}>{report.score}</span></p>
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