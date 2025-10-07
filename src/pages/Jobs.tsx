import { useState, useMemo } from "react";
import { Plus, Search, Filter, Archive, Edit, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Job, JobStatus } from "@/types";
import { generateJobs } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const Jobs = () => {
  const [jobs] = useState<Job[]>(() => generateJobs(25));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  const activeCount = jobs.filter((j) => j.status === "active").length;
  const archivedCount = jobs.filter((j) => j.status === "archived").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Jobs</h2>
          <p className="text-muted-foreground">
            Manage your job openings and track applications
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{jobs.length}</div>
            <p className="text-sm text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{activeCount}</div>
            <p className="text-sm text-muted-foreground">Active Positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">{archivedCount}</div>
            <p className="text-sm text-muted-foreground">Archived</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className={cn(
              "transition-all hover:shadow-md",
              selectedJob?.id === job.id && "ring-2 ring-primary"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {job.title}
                        </h3>
                        <Badge
                          variant={job.status === "active" ? "default" : "secondary"}
                          className={cn(
                            job.status === "active" && "bg-success text-success-foreground"
                          )}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{job.department}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Jobs;
