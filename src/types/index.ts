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

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}