import { CalendarDays } from "lucide-react";
import { priorityLabel } from "@/features/todos/model";

export function TodoMetadata({
  priority,
  dueDate,
}: {
  priority: number;
  dueDate: string | null;
}) {
  return (
    <>
      <span className="border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">
        {priorityLabel(priority)}
      </span>
      {dueDate ? (
        <span className="inline-flex items-center gap-1 border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">
          <CalendarDays size={13} aria-hidden="true" />
          {dueDate}
        </span>
      ) : null}
    </>
  );
}
