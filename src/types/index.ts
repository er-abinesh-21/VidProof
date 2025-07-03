export interface ReportIssue {
  timestamp: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface Report {
  id: string;
  fileName: string;
  score: number;
  summary: string;
  issues: ReportIssue[];
  analyzedAt: string;
}