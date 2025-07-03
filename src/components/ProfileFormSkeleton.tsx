import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ProfileFormSkeleton = () => {
  return (
    <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileFormSkeleton;