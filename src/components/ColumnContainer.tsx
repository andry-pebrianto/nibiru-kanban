import { useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IColumn, ITask, TId } from "./KanbanBoard";
import TaskCard from "./TaskCard";

interface IColumnContainerProps {
  column: IColumn;
  deleteColumn: (columnId: TId) => void;
  updateColumn: (columnId: TId, title: string) => void;
  tasks: ITask[];
  createTask: (columnId: TId) => void;
  deleteTask: (taskId: TId) => void;
  updateTask: (taskId: TId, title: string) => void;
  clearRecycleBin: () => void;
}

export default function ColumnContainer(props: IColumnContainerProps) {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
    clearRecycleBin,
  } = props;

  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
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
        className="border-2 border-red-700 min-w-[350px] min-h-[550px] bg-white opacity-40"
      >
        <div {...attributes} {...listeners}></div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-2 border-slate-700 min-w-[350px] max-w-[350px] min-h-[550px] max-h-[550px] bg-white"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex justify-between items-center bg-slate-200 py-4 px-4 touch-none"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="h-6 w-6 bg-slate-700 text-white flex justify-center items-center">
            <span className="mt-0.5">0</span>
          </div>
          <div onClick={() => setEditMode(true)} className="w-full">
            {editMode ? (
              <input
                type="text"
                autoFocus
                className="w-11/12 py-0.5 px-2"
                onBlur={() => setEditMode(false)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  setEditMode(false);
                }}
                value={column.title}
                onChange={(e) => updateColumn(column.id, e.target.value)}
                placeholder="Input title"
              />
            ) : (
              <p className="text-lg w-11/12">
                <span className="opacity-0">.</span>
                {column.title}
              </p>
            )}
          </div>
        </div>
        {column.id !== 1 && (
          <div
            className="h-6 w-6 bg-red-600 text-white flex justify-center items-center rounded-full cursor-pointer"
            onClick={() => deleteColumn(column.id)}
          >
            <span>x</span>
          </div>
        )}
      </div>
      {column.id !== 1 ? (
        <button
          onClick={() => createTask(column.id)}
          className="min-w-40 pt-1 pb-0.5 border-2 border-slate-700 rounded-sm hover:bg-slate-100 active:bg-slate-200 block mx-auto mt-4"
        >
          Add Task
        </button>
      ) : (
        <button
          onClick={() => clearRecycleBin()}
          className="min-w-40 pt-1 pb-0.5 border-2 border-slate-700 rounded-sm hover:bg-slate-100 active:bg-slate-200 block mx-auto mt-4"
        >
          Clear Recycle Bin
        </button>
      )}
      <div className="overflow-auto hide-scrollbar h-[430px] py-4 px-2">
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
