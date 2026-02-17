import { Trash2, X, Loader2, CheckSquare, Database, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onDelete: () => void;
  onClear: () => void;
  onSelectAll?: () => void;
  onAddToDb?: () => void;
  onRemoveFromDb?: () => void;
  isDeleting: boolean;
  isImporting?: boolean;
  hasDbSelected?: boolean;
  hasFsSelected?: boolean;
}

export function BulkActionBar({
  selectedCount, totalCount, onDelete, onClear, onSelectAll,
  onAddToDb, onRemoveFromDb, isDeleting, isImporting,
  hasDbSelected, hasFsSelected,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground rounded-full px-5 py-3 shadow-elevated flex items-center gap-2 flex-wrap justify-center"
    >
      <span className="text-sm font-bold">{selectedCount} selected</span>
      {onSelectAll && (
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full gap-1 text-xs"
          onClick={onSelectAll}
        >
          <CheckSquare className="w-3 h-3" />
          {selectedCount === totalCount ? "Deselect All" : "Select All"}
        </Button>
      )}
      {hasFsSelected && onAddToDb && (
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full gap-1 text-xs"
          onClick={onAddToDb}
          disabled={isImporting}
        >
          {isImporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
          Add to DB
        </Button>
      )}
      {hasDbSelected && onRemoveFromDb && (
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full gap-1 text-xs"
          onClick={onRemoveFromDb}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Remove from DB
        </Button>
      )}
      <button onClick={onClear} className="p-1 rounded-full hover:bg-white/20">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
