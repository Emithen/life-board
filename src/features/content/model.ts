export const TOPIC_NAME_MAX_LENGTH = 60;
export const TOPIC_DESCRIPTION_MAX_LENGTH = 240;
export const DOCUMENT_TITLE_MAX_LENGTH = 120;
export const DOCUMENT_CONTENT_MAX_LENGTH = 10_000;
export const TAG_NAME_MAX_LENGTH = 30;

export const TOPIC_COLORS = [
  "#047857",
  "#2563eb",
  "#7c3aed",
  "#c2410c",
  "#be123c",
  "#525252",
] as const;

export const TAG_COLORS = [
  "gray",
  "blue",
  "green",
  "amber",
  "red",
  "violet",
] as const;

export const NODE_TYPES = ["structure", "concept", "reference"] as const;

export type TopicColor = (typeof TOPIC_COLORS)[number];
export type TagColor = (typeof TAG_COLORS)[number];
export type NodeType = (typeof NODE_TYPES)[number];
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

export type TagActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"name" | "color", string>>;
};

export const initialTagActionState: TagActionState = {
  status: "idle",
  message: "",
};

export function isTopicColor(value: string): value is TopicColor {
  return TOPIC_COLORS.includes(value as TopicColor);
}

export function isTagColor(value: string): value is TagColor {
  return TAG_COLORS.includes(value as TagColor);
}

export function isNodeType(value: string): value is NodeType {
  return NODE_TYPES.includes(value as NodeType);
}
