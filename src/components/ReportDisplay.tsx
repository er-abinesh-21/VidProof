import { useRef, useState } from "react";
import { Report, ReportIssue } from "@/types";
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
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck, Download, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ReportDisplayProps {
  report: Report;
}

const SeverityIcon = ({ severity }: { severity: ReportIssue["severity"] }) => {
  switch (severity) {
    case "high":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "medium":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "low":
      return <CheckCircle className="h-5 w-5 text-gray-500" />;
    default:
      return null;
  }
};

const ReportDisplay = ({ report }: ReportDisplayProps) => {
  const scoreColor =
    report.score >= 80
      ? "text-green-400"
      : report.score >= 50
      ? "text-yellow-400"
      : "text-red-500";
  
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = () => {
    if (!reportRef.current) return;
    setIsDownloading(true);

    html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#0a0a0a' }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const margin = 40;
      let finalWidth = pdfWidth - margin * 2;
      let finalHeight = finalWidth / ratio;
      if (finalHeight > pdfHeight - margin * 2) {
        finalHeight = pdfHeight - margin * 2;
        finalWidth = finalHeight * ratio;
      }
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`VidProof-Report-${report.fileName}.pdf`);
      setIsDownloading(false);
    });
  };

  return (
    <div className="space-y-6">
      <div ref={reportRef} className="p-4 rounded-lg">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-neon-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {report.score >= 80 ? (
                    <ShieldCheck className="h-6 w-6 text-green-400" />
                  ) : (
                    <ShieldAlert className="h-6 w-6 text-red-500" />
                  )}
                  Authenticity Report for {report.fileName}
                </CardTitle>
                <CardDescription>
                  Analyzed on {new Date(report.analyzedAt).toLocaleString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center space-y-2 p-6 border border-primary/20 rounded-lg bg-card/50 backdrop-blur-sm animate-pulse-glow">
              <h3 className="text-lg font-medium">Authenticity Score</h3>
              <div className="relative h-32 w-32">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path
                    className="text-muted/20"
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
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl font-bold ${scoreColor}`}>
                    {report.score}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">out of 100</p>
            </div>
            <div className="md:col-span-2 p-6 border border-primary/20 rounded-lg bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-medium">Summary</h3>
              <p className="text-muted-foreground mt-2">{report.summary}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle>Detailed Findings</CardTitle>
            <CardDescription>
              List of potential issues detected during the analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b-primary/20">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.issues.length > 0 ? (
                  report.issues.map((issue, index) => (
                    <TableRow key={index} className="border-b-primary/10 hover:bg-primary/10">
                      <TableCell className="font-mono">{issue.timestamp}</TableCell>
                      <TableCell>{issue.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <SeverityIcon severity={issue.severity} />
                          <span className="capitalize">{issue.severity}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No issues found. The video appears to be authentic.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="text-center">
        <Button onClick={handleDownloadPdf} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>
    </div>
  );
};

export default ReportDisplay;