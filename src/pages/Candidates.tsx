import { useState, useMemo } from "react";
import { Search, Mail, Phone } from "lucide-react";
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
import { Candidate, CandidateStage } from "@/types";
import { generateJobs, generateCandidates } from "@/lib/mockData";
import { cn } from "@/lib/utils";

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

const Candidates = () => {
  const [candidates] = useState<Candidate[]>(() => {
    const jobs = generateJobs(25);
    return generateCandidates(jobs, 1000);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<CandidateStage | "all">("all");

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === "all" || candidate.stage === stageFilter;
      return matchesSearch && matchesStage;
    }).slice(0, 50); // Show first 50 for performance
  }, [candidates, searchQuery, stageFilter]);

  const stageCounts = useMemo(() => {
    const counts: Record<CandidateStage, number> = {
      applied: 0,
      screen: 0,
      tech: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };
    candidates.forEach((c) => {
      counts[c.stage]++;
    });
    return counts;
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Candidates</h2>
        <p className="text-muted-foreground">
          Track and manage candidate applications
        </p>
      </div>

      {/* Stage Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {(Object.keys(stageLabels) as CandidateStage[]).map((stage) => (
          <Card key={stage}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={cn("h-3 w-3 rounded-full", stageColors[stage])} />
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {stageCounts[stage]}
                  </div>
                  <p className="text-xs text-muted-foreground">{stageLabels[stage]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={stageFilter}
          onValueChange={(v) => setStageFilter(v as CandidateStage | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {(Object.keys(stageLabels) as CandidateStage[]).map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stageLabels[stage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Candidates List */}
      <div className="grid gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {candidate.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {candidate.email}
                        </span>
                        {candidate.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {candidate.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Applied {new Date(candidate.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Badge className={cn("text-white", stageColors[candidate.stage])}>
                  {stageLabels[candidate.stage]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No candidates found matching your criteria.
          </p>
        </div>
      )}

      {filteredCandidates.length === 50 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing first 50 results. Use filters to narrow down your search.
        </div>
      )}
    </div>
  );
};

export default Candidates;
