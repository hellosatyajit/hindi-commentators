import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "../utils/supabase";
import type { Commentator, Vote } from "../types/database";
import { Route } from "../routes/__root";
import { getCommentatorsFn } from "~/utils/commentators";
import { CACHE_TIME } from "~/utils/config";

export type CommentatorWithVotes = Commentator & {
  vote_sum: number;
  total_votes: number;
  user_vote?: number;
};

export function useCommentators() {
  const [commentators, setCommentators] = useState<CommentatorWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const { user } = Route.useRouteContext();

  const updateCommentatorVote = useCallback(
    (commentatorId: string, voteType: 1 | -1) => {
      setCommentators((prevCommentators) => {
        return prevCommentators.map((commentator) => {
          if (commentator.id !== commentatorId) return commentator;

          let voteDiff = voteType;
          if (commentator.user_vote) {
            voteDiff = voteType - commentator.user_vote;
          }

          return {
            ...commentator,
            vote_sum: commentator.vote_sum + voteDiff,
            total_votes: commentator.user_vote
              ? commentator.total_votes
              : commentator.total_votes + 1,
            user_vote: voteType,
          };
        });
      });
    },
    [user?.id]
  );

  const fetchCommentators = useCallback(async () => {
    try {
      if (!user?.id) {
        return;
      }
      const data = await getCommentatorsFn({
        data: { userId: user?.id } as unknown as any,
      });

      setCommentators(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching commentators:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch commentators")
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCommentators();
    const supabase = getSupabaseClient();

    const channel = supabase.channel("votes_channel");

    channel
      .on("broadcast", { event: "vote_update" }, async (payload) => {
        if (payload.payload.user_id !== user?.id) {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdate;

          if (timeSinceLastUpdate >= CACHE_TIME) {
            await fetchCommentators();
            setLastUpdate(now);
          }
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
        } else if (status === "CHANNEL_ERROR") {
          console.error("Failed to subscribe to vote updates");
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchCommentators, user?.id, lastUpdate]);

  return {
    commentators,
    loading,
    error,
    fetchCommentators,
    updateCommentatorVote,
    totalVotes: commentators.reduce(
      (sum, commentator) => sum + commentator.total_votes,
      0
    ),
  };
}
