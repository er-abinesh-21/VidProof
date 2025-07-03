import { Video } from "lucide-react";

const Header = () => {
  return (
    <header className="py-4 px-6 border-b bg-card">
      <div className="container mx-auto flex items-center gap-2">
        <Video className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">VidProof</h1>
        <span className="hidden sm:block text-sm text-muted-foreground">
          AI-Powered CCTV Video Authenticity Checker
        </span>
      </div>
    </header>
  );
};

export default Header;