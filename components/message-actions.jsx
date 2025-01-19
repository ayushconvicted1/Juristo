import { Copy, Volume2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MessageActions({
  onCopy,
  onGenerateResponse,
  onToggleAudio,
  showGenerateResponse = true,
  className,
  content,
}) {
  return (
    <div className={cn("flex items-center gap-2 ", className)}>
      {showGenerateResponse && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerateResponse}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md px-3 py-1.5 font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Generate Response
        </Button>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onCopy(content)}
        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md px-3 py-1.5 font-medium"
      >
        <Copy className="h-3.5 w-3.5 mr-1" />
        Copy
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggleAudio}
        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md px-3 py-1.5 font-medium"
      >
        <Volume2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
