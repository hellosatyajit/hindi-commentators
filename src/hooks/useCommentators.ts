import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "../utils/supabase";
import type { Commentator, Vote } from "../types/database";
import { Route } from "../routes/__root";

export type CommentatorWithVotes = Commentator & {
  votes?: Pick<Vote, "vote_type" | "user_id">[];
  total_votes: number;
  user_vote?: number;
};

export function useCommentators() {
  const [commentators, setCommentators] = useState<CommentatorWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
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

          const totalVotes = updatedVotes.reduce(
            (sum, vote) => sum + (vote.vote_type || 0),
            0
          );

          return {
            ...commentator,
            votes: updatedVotes,
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
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("commentators")
        .select(
          `
          *,
          votes (
            vote_type,
            user_id
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const commentatorsWithVotes = data.map((commentator) => {
        const userVote = commentator.votes?.find(
          (vote: Vote) => vote.user_id === user?.id
        )?.vote_type;
        return {
          ...commentator,
          total_votes:
            commentator.votes?.reduce(
              (sum: number, vote: Pick<Vote, "vote_type">) =>
                sum + (vote.vote_type || 0),
              0
            ) || 0,
          user_vote: userVote,
        };
      });
      console.log("commentatorsWithVotes", commentatorsWithVotes);
      
      setCommentators(commentatorsWithVotes);
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

    const channel = supabase.channel('votes_channel');

    channel
      .on('broadcast', { event: 'vote_update' }, async (payload) => {
        if (payload.payload.user_id !== user?.id) {
          await fetchCommentators();
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
  }, [fetchCommentators, user?.id]);

  return {
    commentators,
    loading,
    error,
    fetchCommentators,
    updateCommentatorVote,
  };
}
