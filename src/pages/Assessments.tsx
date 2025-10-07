import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Assessments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Assessments</h2>
        <p className="text-muted-foreground">
          Create and manage job-specific assessments
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Assessment Builder Coming Soon
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create custom assessments with various question types, conditional logic,
            and live preview functionality.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assessments;
