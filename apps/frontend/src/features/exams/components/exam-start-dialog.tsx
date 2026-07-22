import { Clock, FileQuestion, Trophy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExamStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
  title: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  passingScore: number;
}

export function ExamStartDialog({
  open,
  onOpenChange,
  onStart,
  title,
  description,
  questionCount,
  timeLimit,
  passingScore,
}: ExamStartDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="flex flex-col items-center gap-2 rounded-lg border p-3">
            <FileQuestion className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">{questionCount}</span>
            <span className="text-xs text-muted-foreground">题目数</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border p-3">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">{timeLimit}</span>
            <span className="text-xs text-muted-foreground">分钟</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border p-3">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">{passingScore}</span>
            <span className="text-xs text-muted-foreground">及格分</span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onStart}>开始考试</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
