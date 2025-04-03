import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "../utils/supabase";
import type { Commentator, Vote } from "../types/database";
import { Route } from "../routes/__root";
import { getCommentatorsFn } from "~/utils/commentators";
import { CACHE_TIME } from "~/utils/config";

export type CommentatorWithVotes = Commentator & {
  votes?: Pick<Vote, "vote_type" | "user_id">[];
  vote_count: number;
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

          const existingVote = commentator.votes?.find(
            (vote) => vote.user_id === user?.id
          );
          const otherVotes =
            commentator.votes?.filter((vote) => vote.user_id !== user?.id) ||
            [];

          const updatedVotes = existingVote
            ? [...otherVotes, { ...existingVote, vote_type: voteType }]
            : [...otherVotes, { user_id: user?.id!, vote_type: voteType }];

          const voteCount = updatedVotes.reduce(
            (sum, vote) => sum + (vote.vote_type || 0),
            0
          );

          const totalVotes = updatedVotes.length;

          return {
            ...commentator,
            votes: updatedVotes,
            vote_count: voteCount,
            total_votes: totalVotes,
            user_vote: voteType,
          };
        });
      });
    },
    [user?.id]
  );

  const fetchCommentators = useCallback(async () => {
    try {
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
    totalVotes: commentators.reduce((sum, commentator) => sum + commentator.total_votes, 0)
  };
}
