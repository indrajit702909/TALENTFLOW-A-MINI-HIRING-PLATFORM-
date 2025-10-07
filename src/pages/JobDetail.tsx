import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateJobs } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const jobs = generateJobs(25);
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-foreground">Job Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The job you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <Badge
                    variant={job.status === "active" ? "default" : "secondary"}
                    className={cn(
                      job.status === "active" && "bg-success text-success-foreground"
                    )}
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {job.department}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button>Apply Now</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Slug</h3>
              <code className="text-sm bg-muted px-2 py-1 rounded">{job.slug}</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetail;
