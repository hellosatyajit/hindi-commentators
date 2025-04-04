import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "./supabase";

export const getCommentatorsFn = createServerFn().handler(
  async ({ data }: any) => {
    if (!data?.userId) {
      throw new Error("User ID is required");
    }
    const supabase = getSupabaseServerClient();

    const { data: commentators, error } = await supabase.rpc(
      "custom_commentators_votes",
      { user_id_param: data?.userId }
    );

    if (error) throw error;

    return commentators;
  }
);

export const handleVoteFn = createServerFn().handler(async ({ data }: any) => {
  const { userId, commentatorId, voteType } = data;

  if (!userId || !commentatorId || ![1, -1].includes(voteType)) {
    throw new Error("Invalid vote data");
  }

  const supabase = getSupabaseServerClient();

  try {
    const { error: insertError } = await supabase.from("votes").upsert({
      user_id: userId,
      commentator_id: commentatorId,
      vote_type: voteType,
    });

    if (insertError?.code === "23505") {
      await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("user_id", userId)
        .eq("commentator_id", commentatorId);
    }

    const channel = supabase.channel("votes_channel");
    await channel.send({
      type: "broadcast",
      event: "vote_update",
      payload: {
        user_id: userId,
        commentator_id: commentatorId,
        vote_type: voteType,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error voting:", error);
    throw error;
  }
});
