import {
  DOCUMENT_CONTENT_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
  TOPIC_DESCRIPTION_MAX_LENGTH,
  TOPIC_NAME_MAX_LENGTH,
  isTopicColor,
  type ContentFieldErrors,
  type TopicColor,
} from "./model";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function isValidContentId(id: string) {
  return uuidPattern.test(id);
}

export function parseTopicInput(formData: FormData) {
  const name = getString(formData, "name");
  const description = getString(formData, "description");
  const color = getString(formData, "color");
  const fieldErrors: ContentFieldErrors = {};

  if (!name) {
    fieldErrors.name = "문서 제목을 입력해 주세요.";
  } else if (name.length > TOPIC_NAME_MAX_LENGTH) {
    fieldErrors.name = `문서 제목은 ${TOPIC_NAME_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  if (description.length > TOPIC_DESCRIPTION_MAX_LENGTH) {
    fieldErrors.description = `설명은 ${TOPIC_DESCRIPTION_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  if (!isTopicColor(color)) {
    fieldErrors.color = "올바른 강조 색상을 선택해 주세요.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false as const, fieldErrors };
  }

  return {
    success: true as const,
    data: { name, description: description || null, color: color as TopicColor },
  };
}

export function parseDocumentInput(formData: FormData) {
  const title = getString(formData, "title");
  const content = getString(formData, "content");
  const fieldErrors: ContentFieldErrors = {};

  if (!title) {
    fieldErrors.title = "문서 제목을 입력해 주세요.";
  } else if (title.length > DOCUMENT_TITLE_MAX_LENGTH) {
    fieldErrors.title = `문서 제목은 ${DOCUMENT_TITLE_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  if (content.length > DOCUMENT_CONTENT_MAX_LENGTH) {
    fieldErrors.content = `본문은 ${DOCUMENT_CONTENT_MAX_LENGTH.toLocaleString()}자 이하로 입력해 주세요.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false as const, fieldErrors };
  }

  return {
    success: true as const,
    data: { title, content: content || null },
  };
}
