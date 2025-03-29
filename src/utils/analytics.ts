import mixpanel from "mixpanel-browser"
import { MIXPANEL_TOKEN } from "./config";

if (!MIXPANEL_TOKEN) {
  console.warn(
    "Mixpanel token not found in environment variables. Analytics will be disabled."
  );
}

mixpanel.init(MIXPANEL_TOKEN || "disabled", {
  debug: process.env.NODE_ENV !== "production",
  track_pageview: true,
  persistence: "localStorage",
  ignore_dnt: true,
});

export const trackSignIn = (
  userId: string,
  method: string,
  additionalProps?: Record<string, any>
) => {
  if (!MIXPANEL_TOKEN) return;

  mixpanel.identify(userId);
  mixpanel.track("Sign In", {
    userId,
    method,
    ...additionalProps,
  });
};

export const trackVote = (
  commentatorId: string,
  voteType: "upvote" | "downvote",
  additionalProps?: Record<string, any>
) => {
  if (!MIXPANEL_TOKEN) return;

  mixpanel.track("Vote Cast", {
    commentatorId,
    voteType,
    ...additionalProps,
  });
};

export const resetUser = (userId?: string) => {
  if (!MIXPANEL_TOKEN) return;

  mixpanel.track("Sign Out", {
    userId,
  });

  mixpanel.reset();
};

export { mixpanel };
