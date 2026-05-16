import type {
  RouteFeedbackRating,
  RouteFeedbackRequest,
  RouteFeedbackTag
} from "@route5/shared";

export const feedbackRatingOptions: Array<{
  value: RouteFeedbackRating;
  label: string;
}> = [
  { value: "good", label: "よい" },
  { value: "neutral", label: "ふつう" },
  { value: "bad", label: "気になる" }
];

export const feedbackTagOptions: Array<{
  value: RouteFeedbackTag;
  label: string;
}> = [
  { value: "nice_view", label: "景色がよい" },
  { value: "good_for_beginner", label: "初心者向け" },
  { value: "want_again", label: "また使いたい" },
  { value: "distance_wrong", label: "距離が違う" },
  { value: "too_hilly", label: "坂が多い" },
  { value: "blocked", label: "通れない" },
  { value: "felt_unsafe", label: "不安を感じた" }
];

export const toggleFeedbackTag = (
  selectedTags: RouteFeedbackTag[],
  tag: RouteFeedbackTag
) =>
  selectedTags.includes(tag)
    ? selectedTags.filter((selectedTag) => selectedTag !== tag)
    : [...selectedTags, tag];

export const buildRouteFeedbackRequest = (
  planId: string,
  accessToken: string,
  routeCandidateId: string,
  rating: RouteFeedbackRating,
  tags: RouteFeedbackTag[],
  comment: string
): RouteFeedbackRequest => {
  const trimmedComment = comment.trim();

  return {
    planId,
    accessToken,
    routeCandidateId,
    rating,
    tags,
    ...(trimmedComment ? { comment: trimmedComment } : {})
  };
};
