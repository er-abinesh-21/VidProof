import { useState, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, UploadCloud, Search, FolderOpen } from "lucide-react";
import { showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

const VideoUpload = ({ onAnalyze, isLoading }: VideoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
      } else {
        showError("Please select a valid video file.");
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0] || null);
    event.target.value = "";
  };

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <Card className="bg-[#2c2a4a] border-[#4f4c7a] w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg text-gray-200 font-semibold">
          <Upload className="h-5 w-5" />
          Upload Video for Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <label
          htmlFor="video-upload-input"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center w-full h-60 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            "border-[#4f4c7a] bg-[#23213a]",
            isDragging ? "border-purple-400 bg-purple-900/20" : "hover:border-purple-400/50 hover:bg-[#2c2a4a]/50"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-12 h-12 mb-4 text-purple-400" />
            <p className="mb-2 text-md font-semibold text-gray-200">
              Drag and drop your video here
            </p>
            <p className="text-xs text-gray-400">or click to browse files</p>
            
            <div className="mt-4 pointer-events-none">
              <Button variant="outline" size="sm" className="bg-[#4f4c7a] border-[#6c699d] text-gray-200 hover:bg-[#4f4c7a]">
                <FolderOpen className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
            </div>
          </div>
          <Input
            id="video-upload-input"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </label>

        {selectedFile && (
          <div className="text-center text-sm text-gray-300">
            <p>Selected file: <span className="font-medium text-gray-100">{selectedFile.name}</span></p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || isLoading}
          className="w-full text-md py-5 bg-[#4f4c7a] hover:bg-[#6c699d] text-gray-100 font-semibold"
          size="lg"
        >
          <Search className="mr-2 h-5 w-5" />
          {isLoading ? "Analyzing..." : "Analyze Video"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;