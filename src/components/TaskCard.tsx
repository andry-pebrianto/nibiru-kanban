import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ITask, TId } from "./KanbanBoard";

interface ITaskCardProps {
  task: ITask;
  deleteTask: (taskId: TId) => void;
  updateTask: (taskId: TId, title: string) => void;
}

export default function TaskCard(props: ITaskCardProps) {
  const { task, deleteTask, updateTask } = props;

  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-slate-200 pt-4 pb-3 px-4 rounded-sm mt-2 h-[100px] overflow-auto relative opacity-50 border-2 border-red-700"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-200 pt-4 pb-3 px-4 rounded-sm mt-2 h-[100px] overflow-auto relative touch-none"
    >
      <div className="w-[275px] h-full" onClick={() => setEditMode(true)}>
        {editMode ? (
          <textarea
            onChange={(e) => updateTask(task.id, e.target.value)}
            autoFocus
            className="w-full px-2 h-full resize-none"
            onBlur={() => setEditMode(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                setEditMode(false);
              }
            }}
            value={task.content}
            placeholder="Input content"
          ></textarea>
        ) : (
          <p className="w-full break-words whitespace-pre-wrap">
            <span className="opacity-0 -ml-[5px]">.</span>
            {task.content}
          </p>
        )}
      </div>
      {!editMode && (
        <div
          className="h-6 w-6 bg-red-600 text-white flex justify-center items-center rounded-full cursor-pointer opacity-60 hover:opacity-100 absolute right-3 top-3"
          onClick={() => deleteTask(task.id)}
        >
          <span>x</span>
        </div>
      )}
    </div>
  );
}
