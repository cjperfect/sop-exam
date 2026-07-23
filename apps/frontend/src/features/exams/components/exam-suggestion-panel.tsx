import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExamSuggestionPanelProps {
  suggestions: string;
}

export function ExamSuggestionPanel({ suggestions }: ExamSuggestionPanelProps) {
  if (!suggestions) return null;

  return (
    <Card className="gap-1 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          AI 学习建议
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm whitespace-pre-wrap text-muted-foreground">{suggestions}</div>
      </CardContent>
    </Card>
  );
}
