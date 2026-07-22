import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { fetchSop } from "@/features/sops/api";
import { InlineExam } from "./components/inline-exam";

export function ExamTake() {
  const { sopId } = useParams({ from: "/_authenticated/sops/$sopId/exam/" });
  const navigate = useNavigate();

  const { data: sop, isLoading } = useQuery({
    queryKey: ["sops", sopId],
    queryFn: () => fetchSop(sopId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sop) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <p>文档不存在</p>
      </div>
    );
  }

  return (
    <InlineExam
      sop={sop}
      onBack={() => navigate({ to: `/sops/${sop.id}` })}
    />
  );
}
