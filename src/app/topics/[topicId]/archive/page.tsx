import { redirect } from "next/navigation";

export default async function DocumentArchivePage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  redirect(`/topics/${topicId}`);
}
