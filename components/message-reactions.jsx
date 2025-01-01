import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MessageReactions({ onReact }) {
  const [selectedReaction, setSelectedReaction] = useState(null);

  const handleReactionClick = (reaction) => {
    setSelectedReaction(reaction);
    onReact(reaction);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReactionClick("happy")}
        className={`rounded-full w-8 h-8 p-0 ${
          selectedReaction === "happy" ? "bg-yellow-200" : "hover:bg-gray-100"
        }`}
      >
        😊
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReactionClick("sad")}
        className={`rounded-full w-8 h-8 p-0 ${
          selectedReaction === "sad" ? "bg-yellow-200" : "hover:bg-gray-100"
        }`}
      >
        ☹️
      </Button>
    </div>
  );
}
