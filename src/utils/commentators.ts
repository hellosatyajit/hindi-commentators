import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "./supabase";
import { Vote } from "~/types/database";

export const getCommentatorsFn = createServerFn().handler(async ({ data }: any) => {
  const supabase = getSupabaseServerClient();

  const { data: commentators, error } = await supabase
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

  const commentatorsWithVotes = commentators.map((commentator) => {
    const userVote = commentator.votes?.find(
      (vote: Vote) => vote.user_id === data?.userId
    )?.vote_type;
    return {
      ...commentator,
      vote_count:
        commentator.votes?.reduce(
          (sum: number, vote: Pick<Vote, "vote_type">) =>
            sum + (vote.vote_type || 0),
          0
        ) || 0,
      total_votes: commentator.votes?.length || 0,
      user_vote: userVote,
    };
  });
  return commentatorsWithVotes;
});

export const handleVoteFn = createServerFn().handler(async ({ data }: any) => {
  const { userId, commentatorId, voteType } = data;
  
  if (!userId || !commentatorId || ![1, -1].includes(voteType)) {
    throw new Error('Invalid vote data');
  }

  const supabase = getSupabaseServerClient();
  
  try {
    const { error: insertError } = await supabase
      .from('votes')
      .upsert({
        user_id: userId,
        commentator_id: commentatorId,
        vote_type: voteType,
      });

    if (insertError?.code === '23505') {
      await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('user_id', userId)
        .eq('commentator_id', commentatorId);
    }

    const channel = supabase.channel('votes_channel');
    await channel.send({
      type: 'broadcast',
      event: 'vote_update',
      payload: {
        user_id: userId,
        commentator_id: commentatorId,
        vote_type: voteType
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
});
