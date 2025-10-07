import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Archive, Edit, ExternalLink, GripVertical, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { JobDialog } from "@/components/JobDialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableJobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
  onView: (jobId: string) => void;
}

const SortableJobCard = ({ job, onEdit, onArchive, onView }: SortableJobCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className={cn("transition-all", isDragging && "shadow-2xl")}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <button
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <Badge variant={job.status === "active" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </div>

              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {job.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(job)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onArchive(job)}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  {job.status === "active" ? "Archive" : "Unarchive"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(job.id)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const JobsNew = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const pageSize = 10;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.getJobs({
        search: searchQuery,
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        pageSize,
        sort: "order",
      });
      setJobs(response.data);
      setTotalPages(response.totalPages);
      setTotalJobs(response.total);
    } catch (error) {
      toast.error("Failed to load jobs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, statusFilter, currentPage]);

  const activeJobs = useMemo(
    () => totalJobs - jobs.filter((j) => j.status === "archived").length,
    [jobs, totalJobs]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = jobs.findIndex((j) => j.id === active.id);
      const newIndex = jobs.findIndex((j) => j.id === over.id);

      const oldJob = jobs[oldIndex];
      const fromOrder = oldJob.order;
      const toOrder = jobs[newIndex].order;

      // Optimistic update
      const reorderedJobs = arrayMove(jobs, oldIndex, newIndex).map((job, index) => ({
        ...job,
        order: (currentPage - 1) * pageSize + index,
      }));
      setJobs(reorderedJobs);

      try {
        await api.reorderJob(active.id as string, fromOrder, toOrder);
        toast.success("Job reordered successfully");
      } catch (error: any) {
        // Rollback on error
        toast.error(error.message || "Failed to reorder. Rolling back...");
        fetchJobs(); // Refetch to restore correct order
      }
    }
  };

  const handleSaveJob = async (data: Partial<Job>) => {
    try {
      if (editingJob) {
        await api.updateJob(editingJob.id, data);
        toast.success("Job updated successfully");
      } else {
        await api.createJob(data);
        toast.success("Job created successfully");
      }
      setDialogOpen(false);
      setEditingJob(null);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Failed to save job");
    }
  };

  const handleArchive = async (job: Job) => {
    try {
      const newStatus: JobStatus = job.status === "active" ? "archived" : "active";
      await api.updateJob(job.id, { status: newStatus });
      toast.success(
        newStatus === "archived" ? "Job archived successfully" : "Job unarchived successfully"
      );
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Failed to update job");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Jobs Board</h1>
            <p className="text-muted-foreground mt-2">
              Manage your open positions and track applications
            </p>
          </div>
          <Button onClick={() => { setEditingJob(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Total Jobs</div>
              <div className="text-3xl font-bold text-foreground mt-2">{totalJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Active Jobs</div>
              <div className="text-3xl font-bold text-foreground mt-2">{activeJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Archived</div>
              <div className="text-3xl font-bold text-foreground mt-2">
                {totalJobs - activeJobs}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as JobStatus | "all");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Job List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={jobs.map((j) => j.id)}
                strategy={verticalListSortingStrategy}
              >
                {jobs.map((job) => (
                  <SortableJobCard
                    key={job.id}
                    job={job}
                    onEdit={(job) => {
                      setEditingJob(job);
                      setDialogOpen(true);
                    }}
                    onArchive={handleArchive}
                    onView={(jobId) => navigate(`/jobs/${jobId}`)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <JobDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        job={editingJob}
        existingSlugs={jobs.map(j => j.slug).filter(slug => slug !== editingJob?.slug)}
        onSave={handleSaveJob}
      />
    </div>
  );
};

export default JobsNew;
