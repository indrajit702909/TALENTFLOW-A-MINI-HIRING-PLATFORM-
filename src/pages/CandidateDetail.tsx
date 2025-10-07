import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateJobs, generateCandidates } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { CandidateStage } from "@/types";

const stageColors: Record<CandidateStage, string> = {
  applied: "bg-blue-500",
  screen: "bg-purple-500",
  tech: "bg-orange-500",
  offer: "bg-green-500",
  hired: "bg-emerald-500",
  rejected: "bg-gray-500",
};

const stageLabels: Record<CandidateStage, string> = {
  applied: "Applied",
  screen: "Screening",
  tech: "Technical Interview",
  offer: "Offer Extended",
  hired: "Hired",
  rejected: "Rejected",
};

const CandidateDetail = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  
  const { candidate, job } = useMemo(() => {
    const jobs = generateJobs(25);
    const candidates = generateCandidates(jobs, 1000);
    const cand = candidates.find((c) => c.id === candidateId);
    const j = jobs.find((job) => job.id === cand?.jobId);
    return { candidate: cand, job: j };
  }, [candidateId]);

  // Generate mock timeline
  const timeline = useMemo(() => {
    if (!candidate) return [];
    
    const stages: CandidateStage[] = ["applied", "screen", "tech", "offer", "hired"];
    const currentStageIndex = stages.indexOf(candidate.stage);
    
    return stages.slice(0, currentStageIndex + 1).map((stage, index) => {
      const date = new Date(candidate.appliedAt);
      date.setDate(date.getDate() + index * 7);
      
      return {
        id: `timeline-${index}`,
        stage,
        timestamp: date.toISOString(),
        note: index === 0 ? "Candidate submitted application" : `Moved to ${stageLabels[stage]}`,
      };
    });
  }, [candidate]);

  if (!candidate || !job) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/candidates")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-foreground">Candidate Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The candidate you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/candidates")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Candidates
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    {candidate.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                    <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {candidate.email}
                      </span>
                      {candidate.phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {candidate.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge
                  className={cn("text-white", stageColors[candidate.stage])}
                >
                  {stageLabels[candidate.stage]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>Applied for:</span>
                <span className="font-medium text-foreground">{job.title}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          stageColors[event.stage],
                          "text-white"
                        )}
                      >
                        <Calendar className="h-5 w-5" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-12 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {stageLabels[event.stage]}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">Schedule Interview</Button>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
              <Button variant="outline" className="w-full">
                Add Note
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Applied:</span>
                <p className="font-medium text-foreground">
                  {new Date(candidate.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Current Stage:</span>
                <p className="font-medium text-foreground">
                  {stageLabels[candidate.stage]}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Job:</span>
                <p className="font-medium text-foreground">{job.title}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>
                <p className="font-medium text-foreground">{job.department}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
