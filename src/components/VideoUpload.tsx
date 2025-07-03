import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

interface VideoUploadProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

const VideoUpload = ({ onAnalyze, isLoading }: VideoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation for file type
      if (file.type === "video/mp4" || file.type === "video/x-msvideo") {
        setSelectedFile(file);
      } else {
        alert("Please select a valid .mp4 or .avi file.");
        event.target.value = ""; // Reset the input
      }
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>
          Select a .mp4 or .avi video file to check its authenticity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input
            id="video-upload"
            type="file"
            accept=".mp4,.avi"
            onChange={handleFileChange}
            disabled={isLoading}
            className="flex-grow"
          />
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="w-full sm:w-auto"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            {isLoading ? "Analyzing..." : "Analyze Video"}
          </Button>
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            Selected file: {selectedFile.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoUpload;