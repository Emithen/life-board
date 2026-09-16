"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDatabaseConfigured } from "@/db";
import type {
  ContentActionState,
  TagActionState,
} from "@/features/content/model";
import {
  attachTagToDocument,
  createTagAndAttachToDocument,
  deleteReferenceDocumentById,
  detachTagFromDocument,
  insertChildDocument,
  insertDocument,
  insertReferenceDocument,
  insertRootDocument,
  insertTopic,
  moveDocumentInTreeById,
  setDocumentArchived,
  setTopicArchived,
  updateDocumentInTreeById,
  updateDocumentNodeType,
  updateReferenceDocumentTarget,
  updateDocumentById,
  updateTopicById,
} from "@/features/content/repository";
import {
  isValidContentId,
  parseDocumentCreateInput,
  parseDocumentInput,
  parseEditableNodeTypeInput,
  parseReferenceCreateInput,
  parseTagInput,
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

export async function changeDocumentNodeType(
  id: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(id)) return errorState("올바르지 않은 문서 요청입니다.");
  const parsed = parseEditableNodeTypeInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "변경할 유형을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }
  if (!isDatabaseConfigured()) return databaseErrorState();

  try {
    const result = await updateDocumentNodeType(id, parsed.data.nodeType);
    if (result === "has-children") {
      return errorState("하위 구성 요소가 있는 구조 노드는 개념으로 변경할 수 없습니다.");
    }
    if (result !== "updated") {
      return errorState("유형을 변경할 수 있는 노드를 찾지 못했습니다.");
    }
    revalidatePath("/");
    revalidatePath(`/documents/${id}`);
    return { status: "success", message: "노드 유형을 변경했습니다." };
  } catch (error) {
    console.error("Document node type update failed", error);
    return errorState("노드 유형을 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function createChildDocument(
  parentId: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(parentId)) {
    return errorState("올바르지 않은 상위 문서 요청입니다.");
  }
  const parsed = parseDocumentCreateInput(formData);
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
  const parsed = parseDocumentCreateInput(formData);
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

export async function createReferenceDocument(
  parentId: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(parentId)) {
    return errorState("올바르지 않은 상위 문서 요청입니다.");
  }
  const parsed = parseReferenceCreateInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "참조 대상을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }
  if (!isDatabaseConfigured()) return databaseErrorState();

  let createdId: string | null;
  try {
    createdId = await insertReferenceDocument(
      parentId,
      parsed.data.targetDocumentId,
    );
  } catch (error) {
    console.error("Reference document creation failed", error);
    return errorState("참조 노드를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  if (!createdId) {
    return errorState("현재 경로에서 참조할 수 있는 대상을 찾지 못했습니다.");
  }

  revalidatePath("/");
  revalidatePath(`/documents/${parentId}`);
  revalidatePath(`/documents/${parsed.data.targetDocumentId}`);
  redirect(`/documents/${createdId}`);
}

export async function updateReferenceTarget(
  referenceDocumentId: string,
  _previousState: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  if (!isValidContentId(referenceDocumentId)) {
    return errorState("올바르지 않은 참조 노드 요청입니다.");
  }
  const parsed = parseReferenceCreateInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "참조 대상을 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }
  if (!isDatabaseConfigured()) return databaseErrorState();

  try {
    const result = await updateReferenceDocumentTarget(
      referenceDocumentId,
      parsed.data.targetDocumentId,
    );
    if (!result) {
      return errorState("현재 경로에서 참조할 수 있는 대상을 찾지 못했습니다.");
    }

    revalidatePath("/");
    revalidatePath(`/documents/${referenceDocumentId}`);
    revalidatePath(`/documents/${parsed.data.targetDocumentId}`);
    if (result.previousTargetDocumentId) {
      revalidatePath(`/documents/${result.previousTargetDocumentId}`);
    }
    return { status: "success", message: "참조 대상을 변경했습니다." };
  } catch (error) {
    console.error("Reference target update failed", error);
    return errorState("참조 대상을 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function deleteReferenceDocument(
  referenceDocumentId: string,
  _previousState: ContentActionState,
  _formData: FormData,
): Promise<ContentActionState> {
  void _previousState;
  void _formData;
  if (!isValidContentId(referenceDocumentId)) {
    return errorState("올바르지 않은 참조 노드 요청입니다.");
  }
  if (!isDatabaseConfigured()) return databaseErrorState();

  let deleted:
    | Awaited<ReturnType<typeof deleteReferenceDocumentById>>
    | null = null;
  try {
    deleted = await deleteReferenceDocumentById(referenceDocumentId);
  } catch (error) {
    console.error("Reference document deletion failed", error);
    return errorState("참조 노드를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  if (deleted.status === "not-found") {
    return errorState("삭제할 수 있는 참조 노드를 찾을 수 없습니다.");
  }
  if (deleted.status === "has-children") {
    return errorState("하위 구성 요소가 있는 참조 노드는 삭제할 수 없습니다.");
  }
  if (deleted.status === "has-incoming-reference") {
    return errorState("다른 노드가 참조하고 있어 삭제할 수 없습니다.");
  }

  revalidatePath("/");
  if (deleted.parentId) revalidatePath(`/documents/${deleted.parentId}`);
  if (deleted.targetDocumentId) {
    revalidatePath(`/documents/${deleted.targetDocumentId}`);
  }
  redirect(deleted.parentId ? `/documents/${deleted.parentId}` : "/");
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

export async function createAndAttachDocumentTag(
  documentId: string,
  _previousState: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  if (!isValidContentId(documentId)) {
    return { status: "error", message: "올바르지 않은 문서 요청입니다." };
  }
  const parsed = parseTagInput(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "태그 정보를 확인해 주세요.",
      fieldErrors: parsed.fieldErrors,
    };
  }
  if (!isDatabaseConfigured()) {
    return { status: "error", message: "데이터베이스 연결을 먼저 설정해 주세요." };
  }

  try {
    const result = await createTagAndAttachToDocument(documentId, parsed.data);
    if (result === "duplicate-name") {
      return {
        status: "error",
        message: "같은 이름의 태그가 있습니다. 기존 태그를 선택해 주세요.",
        fieldErrors: { name: "이미 사용 중인 태그 이름입니다." },
      };
    }
    if (result !== "created") {
      return { status: "error", message: "태그를 추가할 수 있는 문서를 찾지 못했습니다." };
    }
    revalidatePath("/");
    revalidatePath(`/documents/${documentId}`);
    return { status: "success", message: "태그를 만들고 문서에 추가했습니다." };
  } catch (error) {
    console.error("Tag creation failed", error);
    return { status: "error", message: "태그를 만들지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
}

export async function attachDocumentTag(
  documentId: string,
  _previousState: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const tagId = formData.get("tagId");
  if (
    !isValidContentId(documentId) ||
    typeof tagId !== "string" ||
    !isValidContentId(tagId)
  ) {
    return { status: "error", message: "추가할 태그를 선택해 주세요." };
  }
  if (!isDatabaseConfigured()) {
    return { status: "error", message: "데이터베이스 연결을 먼저 설정해 주세요." };
  }

  try {
    if (!(await attachTagToDocument(documentId, tagId))) {
      return { status: "error", message: "태그를 추가할 수 없습니다." };
    }
    revalidatePath("/");
    revalidatePath(`/documents/${documentId}`);
    return { status: "success", message: "태그를 추가했습니다." };
  } catch (error) {
    console.error("Tag attachment failed", error);
    return { status: "error", message: "태그를 추가하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
}

export async function removeDocumentTag(documentId: string, tagId: string) {
  if (!isValidContentId(documentId) || !isValidContentId(tagId)) return;
  if (!isDatabaseConfigured()) return;

  try {
    if (await detachTagFromDocument(documentId, tagId)) {
      revalidatePath("/");
      revalidatePath(`/documents/${documentId}`);
    }
  } catch (error) {
    console.error("Tag removal failed", error);
  }
}
