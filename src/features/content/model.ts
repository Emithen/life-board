export const TOPIC_NAME_MAX_LENGTH = 60;
export const TOPIC_DESCRIPTION_MAX_LENGTH = 240;
export const DOCUMENT_TITLE_MAX_LENGTH = 120;
export const DOCUMENT_CONTENT_MAX_LENGTH = 10_000;

export const TOPIC_COLORS = [
  "#047857",
  "#2563eb",
  "#7c3aed",
  "#c2410c",
  "#be123c",
  "#525252",
] as const;

export type TopicColor = (typeof TOPIC_COLORS)[number];
export type ContentFieldErrors = Partial<
  Record<"name" | "description" | "color" | "title" | "content", string>
>;

export type ContentActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: ContentFieldErrors;
};

export const initialContentActionState: ContentActionState = {
  status: "idle",
  message: "",
};

export function isTopicColor(value: string): value is TopicColor {
  return TOPIC_COLORS.includes(value as TopicColor);
}
