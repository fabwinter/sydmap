import { Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  isDeleting: boolean;
}

export function BulkActionBar({ selectedCount, onDelete, onClear, isDeleting }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground rounded-full px-5 py-3 shadow-elevated flex items-center gap-3"
    >
      <span className="text-sm font-bold">{selectedCount} selected</span>
      <Button
        size="sm"
        variant="secondary"
        className="rounded-full gap-1 text-xs"
        onClick={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        Delete
      </Button>
      <button onClick={onClear} className="p-1 rounded-full hover:bg-white/20">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
