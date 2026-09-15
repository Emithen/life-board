"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDatabaseConfigured } from "@/db";
import type { ContentActionState } from "@/features/content/model";
import {
  archiveDocumentInTreeById,
  insertChildDocument,
  insertDocument,
  insertRootDocument,
  insertTopic,
  moveDocumentInTreeById,
  setDocumentArchived,
  setTopicArchived,
  updateDocumentInTreeById,
  updateDocumentById,
  updateTopicById,
} from "@/features/content/repository";
import {
  isValidContentId,
  parseDocumentInput,
  parseTopicInput,
} from "@/features/content/validation";

function errorState(message: string): ContentActionState {
  return { status: "error", message };
}

function databaseErrorState() {
  return errorState("데이터베이스 연결을 먼저 설정해 주세요.");
}

async function runContentMutation({
  mutate,
  successMessage,
  notFoundMessage,
  failureMessage,
  paths,
}: {
  mutate: () => Promise<boolean>;
  successMessage: string;
  notFoundMessage: string;
  failureMessage: string;
  paths: string[];
}): Promise<ContentActionState> {
  if (!isDatabaseConfigured()) return databaseErrorState();

  try {
    if (!(await mutate())) return errorState(notFoundMessage);
    for (const path of paths) revalidatePath(path);
    return { status: "success", message: successMessage };
  } catch (error) {
    console.error("Content mutation failed", error);
    return errorState(failureMessage);
  }
}

export async function createTopic(
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const parsed = parseTopicInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }
  if (!isDatabaseConfigured()) return databaseErrorState();

  try {
    await insertTopic(parsed.data);
    revalidatePath("/");
    revalidatePath("/topics/manage");
    return { status: "success", message: "문서를 만들었습니다." };
  } catch (error) {
    console.error("Topic creation failed", error);
    return errorState("문서를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function updateTopic(
  id: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(id)) return errorState("올바르지 않은 문서 요청입니다.");
  const parsed = parseTopicInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  return runContentMutation({
    mutate: () => updateTopicById(id, parsed.data),
    successMessage: "문서를 수정했습니다.",
    notFoundMessage: "수정할 수 있는 문서를 찾을 수 없습니다.",
    failureMessage: "문서를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", "/topics/manage", `/topics/manage/${id}`, `/topics/${id}`],
  });
}

export async function archiveTopic(
  id: string,
  _previousState: ContentActionState,
  _formData: FormData,
): Promise<ContentActionState> {
  void _previousState;
  void _formData;
  if (!isValidContentId(id)) return errorState("올바르지 않은 문서 요청입니다.");
  return runContentMutation({
    mutate: () => setTopicArchived(id, true),
    successMessage: "문서를 보관했습니다.",
    notFoundMessage: "보관할 수 있는 문서를 찾을 수 없습니다.",
    failureMessage: "문서를 보관하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", "/topics/manage", "/topics/archive", `/topics/manage/${id}`, `/topics/${id}`],
  });
}

export async function restoreTopic(
  id: string,
  _previousState: ContentActionState,
  _formData: FormData,
): Promise<ContentActionState> {
  void _previousState;
  void _formData;
  if (!isValidContentId(id)) return errorState("올바르지 않은 문서 요청입니다.");
  return runContentMutation({
    mutate: () => setTopicArchived(id, false),
    successMessage: "문서를 복원했습니다.",
    notFoundMessage: "복원할 수 있는 문서를 찾을 수 없습니다.",
    failureMessage: "문서를 복원하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", "/topics/manage", "/topics/archive", `/topics/manage/${id}`, `/topics/${id}`],
  });
}

export async function createDocument(
  topicId: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(topicId)) return errorState("올바르지 않은 문서 요청입니다.");
  const parsed = parseDocumentInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  return runContentMutation({
    mutate: () => insertDocument(topicId, parsed.data),
    successMessage: "문서를 추가했습니다.",
    notFoundMessage: "상위 문서를 찾을 수 없습니다.",
    failureMessage: "문서를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", `/topics/manage/${topicId}`, `/topics/${topicId}`],
  });
}

export async function updateDocument(
  topicId: string,
  id: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(topicId) || !isValidContentId(id)) {
    return errorState("올바르지 않은 문서 요청입니다.");
  }
  const parsed = parseDocumentInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  return runContentMutation({
    mutate: () => updateDocumentById(topicId, id, parsed.data),
    successMessage: "문서를 수정했습니다.",
    notFoundMessage: "수정할 수 있는 문서를 찾을 수 없습니다.",
    failureMessage: "문서를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", `/topics/manage/${topicId}`, `/topics/${topicId}`, `/documents/${id}`],
  });
}

async function changeDocumentArchiveState(
  topicId: string,
  id: string,
  archived: boolean,
) {
  if (!isValidContentId(topicId) || !isValidContentId(id)) {
    return errorState("올바르지 않은 문서 요청입니다.");
  }
  return runContentMutation({
    mutate: () => setDocumentArchived(topicId, id, archived),
    successMessage: archived ? "문서를 보관했습니다." : "문서를 복원했습니다.",
    notFoundMessage: archived
      ? "보관할 수 있는 문서를 찾을 수 없습니다."
      : "복원할 수 있는 문서를 찾을 수 없습니다.",
    failureMessage: archived
      ? "문서를 보관하지 못했습니다. 잠시 후 다시 시도해 주세요."
      : "문서를 복원하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", `/topics/manage/${topicId}`, `/topics/${topicId}`, `/topics/${topicId}/archive`, `/documents/${id}`],
  });
}

export async function archiveDocument(
  topicId: string,
  id: string,
  _previousState: ContentActionState,
  _formData: FormData,
) {
  void _previousState;
  void _formData;
  return changeDocumentArchiveState(topicId, id, true);
}

export async function restoreDocument(
  topicId: string,
  id: string,
  _previousState: ContentActionState,
  _formData: FormData,
) {
  void _previousState;
  void _formData;
  return changeDocumentArchiveState(topicId, id, false);
}

export async function updateDocumentFromDetail(
  id: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(id)) return errorState("올바르지 않은 문서 요청입니다.");
  const parsed = parseDocumentInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  return runContentMutation({
    mutate: () => updateDocumentInTreeById(id, parsed.data),
    successMessage: "문서를 수정했습니다.",
    notFoundMessage: "수정할 수 있는 문서를 찾을 수 없습니다.",
    failureMessage: "문서를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", `/documents/${id}`],
  });
}

export async function archiveDocumentFromDetail(
  id: string,
  _previousState: ContentActionState,
  _formData: FormData,
): Promise<ContentActionState> {
  void _previousState;
  void _formData;
  if (!isValidContentId(id)) return errorState("올바르지 않은 문서 요청입니다.");

  return runContentMutation({
    mutate: () => archiveDocumentInTreeById(id),
    successMessage: "문서를 보관했습니다.",
    notFoundMessage: "보관할 수 있는 문서를 찾을 수 없습니다.",
    failureMessage: "문서를 보관하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", `/documents/${id}`],
  });
}

export async function createChildDocument(
  parentId: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(parentId)) {
    return errorState("올바르지 않은 상위 문서 요청입니다.");
  }
  const parsed = parseDocumentInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }
  if (!isDatabaseConfigured()) return databaseErrorState();

  let createdId: string | null;
  try {
    createdId = await insertChildDocument(parentId, parsed.data);
  } catch (error) {
    console.error("Child document creation failed", error);
    return errorState("하위 문서를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  if (!createdId) {
    return errorState("하위 문서를 추가할 수 있는 상위 문서를 찾을 수 없습니다.");
  }

  revalidatePath("/");
  revalidatePath(`/documents/${parentId}`);
  redirect(`/documents/${createdId}`);
}

export async function createRootDocument(
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const parsed = parseDocumentInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 내용을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }
  if (!isDatabaseConfigured()) return databaseErrorState();

  let createdId: string | null;
  try {
    createdId = await insertRootDocument(parsed.data);
  } catch (error) {
    console.error("Document creation failed", error);
    return errorState("문서를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  if (!createdId) {
    return errorState("문서를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  revalidatePath("/");
  redirect(`/documents/${createdId}`);
}

export async function moveDocument(
  id: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(id)) return errorState("올바르지 않은 문서 요청입니다.");

  const parentValue = formData.get("parentId");
  if (typeof parentValue !== "string") {
    return errorState("이동할 위치를 확인해 주세요.");
  }
  const parentId = parentValue.trim() || null;
  if (parentId && !isValidContentId(parentId)) {
    return errorState("올바르지 않은 이동 위치입니다.");
  }

  return runContentMutation({
    mutate: () => moveDocumentInTreeById(id, parentId),
    successMessage: "문서를 이동했습니다.",
    notFoundMessage: "선택한 위치로 문서를 이동할 수 없습니다.",
    failureMessage: "문서를 이동하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", `/documents/${id}`],
  });
}
