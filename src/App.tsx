import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import JobsNew from "./pages/JobsNew";
import JobDetail from "./pages/JobDetail";
import CandidatesNew from "./pages/CandidatesNew";
import CandidateDetail from "./pages/CandidateDetail";
import AssessmentsNew from "./pages/AssessmentsNew";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<JobsNew />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/candidates" element={<CandidatesNew />} />
            <Route path="/candidates/:candidateId" element={<CandidateDetail />} />
            <Route path="/assessments" element={<AssessmentsNew />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
