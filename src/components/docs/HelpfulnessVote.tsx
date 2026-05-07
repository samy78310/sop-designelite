"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface HelpfulnessVoteProps {
  articleId: string;
}

export function HelpfulnessVote({ articleId }: HelpfulnessVoteProps) {
  const [voted, setVoted] = useState<boolean | null>(null);

  const handleVote = async (helpful: boolean) => {
    if (voted !== null) return;

    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, vote: helpful }),
    });

    setVoted(helpful);
  };

  return (
    <div className="mt-12 pt-6 border-t border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">
          Cette page vous a-t-elle été utile ?
        </span>

        {voted === null ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleVote(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 text-muted-foreground text-sm transition"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Oui
            </button>
            <button
              onClick={() => handleVote(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground text-sm transition"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              Non
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {voted
              ? "✅ Merci pour votre retour !"
              : "📝 Merci ! Nous allons améliorer cette page."}
          </p>
        )}
      </div>
    </div>
  );
}
