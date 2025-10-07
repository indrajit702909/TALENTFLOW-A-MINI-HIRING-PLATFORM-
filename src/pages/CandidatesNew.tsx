import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mail, Phone, LayoutGrid, List, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Candidate, CandidateStage } from "@/types";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

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
  tech: "Technical",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

const CandidateCard = ({ candidate, onClick }: { candidate: Candidate; onClick?: () => void }) => (
  <Card className="transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{candidate.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Mail className="h-3 w-3" />
            <span>{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Phone className="h-3 w-3" />
              <span>{candidate.phone}</span>
            </div>
          )}
        </div>
        <Badge className={cn("text-white", stageColors[candidate.stage])}>
          {stageLabels[candidate.stage]}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground">
        Applied: {new Date(candidate.appliedAt).toLocaleDateString()}
      </div>
    </CardContent>
  </Card>
);

const CandidatesNew = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<CandidateStage | "all">("all");
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await api.getCandidates({
        search: searchQuery,
        stage: stageFilter === "all" ? undefined : stageFilter,
        pageSize: 1000, // Load all for client-side virtualization
      });
      setCandidates(response.data);
    } catch (error) {
      toast.error("Failed to load candidates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [searchQuery, stageFilter]);

  const filteredCandidates = candidates;

  const virtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const stageCounts = useMemo(() => {
    const counts: Record<CandidateStage, number> = {
      applied: 0,
      screen: 0,
      tech: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };
    candidates.forEach((candidate) => {
      counts[candidate.stage]++;
    });
    return counts;
  }, [candidates]);

  const candidatesByStage = useMemo(() => {
    const grouped: Record<CandidateStage, Candidate[]> = {
      applied: [],
      screen: [],
      tech: [],
      offer: [],
      hired: [],
      rejected: [],
    };
    filteredCandidates.forEach((candidate) => {
      grouped[candidate.stage].push(candidate);
    });
    return grouped;
  }, [filteredCandidates]);

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find((c) => c.id === event.active.id);
    setDraggedCandidate(candidate || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedCandidate(null);

    if (!over) return;

    const candidateId = active.id as string;
    const newStage = over.id as CandidateStage;
    const candidate = candidates.find((c) => c.id === candidateId);

    if (!candidate || candidate.stage === newStage) return;

    // Optimistic update
    const oldStage = candidate.stage;
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );

    try {
      await api.updateCandidate(candidateId, { stage: newStage });
      toast.success(`Moved to ${stageLabels[newStage]}`);
    } catch (error: any) {
      // Rollback on error
      toast.error(error.message || "Failed to update candidate");
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: oldStage } : c))
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Candidates</h1>
            <p className="text-muted-foreground mt-2">
              {candidates.length} total candidates
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <Card
              key={stage}
              className="cursor-pointer hover:shadow-md transition-all"
              onClick={() => setStageFilter(stage as CandidateStage)}
            >
              <CardContent className="p-4">
                <div
                  className={cn(
                    "text-xs font-medium mb-2 text-white w-fit px-2 py-1 rounded",
                    stageColors[stage as CandidateStage]
                  )}
                >
                  {stageLabels[stage as CandidateStage]}
                </div>
                <div className="text-2xl font-bold text-foreground">{count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={stageFilter}
                onValueChange={(value) => setStageFilter(value as CandidateStage | "all")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {Object.entries(stageLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "list" ? (
          <div ref={parentRef} className="h-[600px] overflow-auto">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const candidate = filteredCandidates[virtualRow.index];
                return (
                  <div
                    key={candidate.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="px-2 py-2"
                  >
                    <CandidateCard
                      candidate={candidate}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(candidatesByStage).map(([stage, stageCandidates]) => (
                <div
                  key={stage}
                  id={stage}
                  className="bg-muted/50 rounded-lg p-4 min-h-[400px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">
                      {stageLabels[stage as CandidateStage]}
                    </h3>
                    <Badge variant="secondary">{stageCandidates.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {stageCandidates.map((candidate) => (
                      <div key={candidate.id} id={candidate.id} className="cursor-move">
                        <CandidateCard
                          candidate={candidate}
                          onClick={() => navigate(`/candidates/${candidate.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DragOverlay>
              {draggedCandidate ? (
                <CandidateCard candidate={draggedCandidate} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default CandidatesNew;
