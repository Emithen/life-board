"use server";

import { revalidatePath } from "next/cache";
import { isDatabaseConfigured } from "@/db";
import type { ContentActionState } from "@/features/content/model";
import {
  insertDocument,
  insertTopic,
  setDocumentArchived,
  setTopicArchived,
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
    return { status: "success", message: "주제를 추가했습니다." };
  } catch (error) {
    console.error("Topic creation failed", error);
    return errorState("주제를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function updateTopic(
  id: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(id)) return errorState("올바르지 않은 주제 요청입니다.");
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
    successMessage: "주제를 수정했습니다.",
    notFoundMessage: "수정할 수 있는 주제를 찾을 수 없습니다.",
    failureMessage: "주제를 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", `/topics/${id}`],
  });
}

export async function archiveTopic(
  id: string,
  _previousState: ContentActionState,
  _formData: FormData,
): Promise<ContentActionState> {
  void _previousState;
  void _formData;
  if (!isValidContentId(id)) return errorState("올바르지 않은 주제 요청입니다.");
  return runContentMutation({
    mutate: () => setTopicArchived(id, true),
    successMessage: "주제를 보관했습니다.",
    notFoundMessage: "보관할 수 있는 주제를 찾을 수 없습니다.",
    failureMessage: "주제를 보관하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", "/topics/archive", `/topics/${id}`],
  });
}

export async function restoreTopic(
  id: string,
  _previousState: ContentActionState,
  _formData: FormData,
): Promise<ContentActionState> {
  void _previousState;
  void _formData;
  if (!isValidContentId(id)) return errorState("올바르지 않은 주제 요청입니다.");
  return runContentMutation({
    mutate: () => setTopicArchived(id, false),
    successMessage: "주제를 복원했습니다.",
    notFoundMessage: "복원할 수 있는 주제를 찾을 수 없습니다.",
    failureMessage: "주제를 복원하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", "/topics/archive", `/topics/${id}`],
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
    notFoundMessage: "문서를 추가할 수 있는 주제를 찾을 수 없습니다.",
    failureMessage: "문서를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    paths: ["/", `/topics/${topicId}`],
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
    paths: ["/", `/topics/${topicId}`],
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
    paths: ["/", `/topics/${topicId}`, `/topics/${topicId}/archive`],
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
