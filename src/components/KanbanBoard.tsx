import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";

export type TId = string | number;

export interface IColumn {
  id: TId;
  title: string;
}

export interface ITask {
  id: TId;
  columnId: TId;
  content: string;
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<IColumn[]>([
    { id: 1, title: "Recycle Bin" },
  ]);
  const [tasks, setTasks] = useState<ITask[]>([]);

  const [activeColumn, setActiveColumn] = useState<IColumn | null>(null);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);

  useEffect(() => {
    const columnsLocalStorage = localStorage.getItem("columns");
    const tasksLocalStorage = localStorage.getItem("tasks");

    if (columnsLocalStorage) {
      setColumns(JSON.parse(columnsLocalStorage));
    }
    if (tasksLocalStorage) {
      setTasks(JSON.parse(tasksLocalStorage));
    }
  }, []);

  const saveDataToLocalStorage = () => {
    localStorage.setItem("columns", JSON.stringify(columns));
    localStorage.setItem("tasks", JSON.stringify(tasks));

    alert("Saved to your Browser Local Storage");
  };

  const getColumnPosition = (columnId: TId) => {
    return columns.findIndex((column) => column.id === columnId);
  };

  const getTaskPosition = (taskId: TId) => {
    return tasks.findIndex((task) => task.id === taskId);
  };

  const createColumn = () => {
    const idGenerated = new Date().getTime();

    setColumns((columns) => [
      {
        id: idGenerated,
        title: `Column ${idGenerated}`,
      },
      ...columns,
    ]);
  };

  const deleteColumn = (columnId: TId) => {
    setColumns((columns) => columns.filter((column) => column.id !== columnId));
    // memindahkan task dari kolom yang terhapus ke recycle bin
    setTasks((tasks) =>
      tasks.map((task) => {
        if (task.columnId === columnId) {
          return {
            ...task,
            columnId: 1,
          };
        }

        return task;
      })
    );
  };

  const updateColumn = (columnId: TId, title: string) => {
    if (title.length > 21) {
      alert("Too long! Max 21 character.");
    } else {
      const newColumn = columns.map((col) => {
        if (col.id !== columnId) return col;
        return { ...col, title };
      });

      setColumns(newColumn);
    }
  };

  const createTask = (columnId: TId) => {
    const idGenerated = new Date().getTime();

    setTasks((tasks) => [
      {
        id: idGenerated,
        columnId: columnId,
        content: `Task ${idGenerated}`,
      },
      ...tasks,
    ]);
  };

  const deleteTask = (taskId: TId) => {
    setTasks((tasks) => tasks.filter((task) => task.id !== taskId));
  };

  const updateTask = (taskId: TId, content: string) => {
    if (content.length > 50) {
      alert("Too long! Max 50 character.");
    } else {
      const newTask = tasks.map((task) => {
        if (task.id !== taskId) return task;
        return { ...task, content };
      });

      setTasks(newTask);
    }
  };

  const clearRecycleBin = () => {
    setTasks((tasks) => tasks.filter((task) => task.columnId !== 1));
  };

  const onDragStart = (event: DragStartEvent) => {
    console.log("DRAG START", event);

    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    console.log("DRAG END", event);

    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    setColumns((columns) => {
      const originalPosition = getColumnPosition(active.id);
      const newPosition = getColumnPosition(over?.id);

      return arrayMove(columns, originalPosition, newPosition);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    console.log("DRAG OVER", event);

    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // menyeret task ke task yang lain
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const originalPosition = getTaskPosition(active.id);
        const newPosition = getTaskPosition(over?.id);

        tasks[originalPosition].columnId = tasks[newPosition].columnId;

        return arrayMove(tasks, originalPosition, newPosition);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // menyeret task ke column yang kosong
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const originalPosition = getTaskPosition(active.id);

        tasks[originalPosition].columnId = over.id;

        return arrayMove(tasks, originalPosition, originalPosition);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px
      },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="container mx-auto max-w-6xl p-5 border-2 border-slate-700 rounded-sm mb-10">
      <div className="flex justify-between">
        <button
          className="min-w-32 pt-2 pb-1.5 border-2 border-slate-700 rounded-sm hover:bg-slate-100 active:bg-slate-200 mb-4"
          onClick={createColumn}
        >
          Add Column
        </button>
        <button
          className="min-w-32 pt-2 pb-1.5 border-2 border-slate-700 rounded-sm hover:bg-slate-100 active:bg-slate-200 mb-4"
          onClick={saveDataToLocalStorage}
        >
          Save Data
        </button>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        collisionDetection={closestCorners}
      >
        <div className="overflow-auto flex gap-4">
          <SortableContext
            items={columns}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                tasks={tasks.filter((task) => task.columnId === column.id)}
                deleteTask={deleteTask}
                updateTask={updateTask}
                clearRecycleBin={clearRecycleBin}
              />
            ))}
          </SortableContext>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                deleteTask={deleteTask}
                updateTask={updateTask}
                clearRecycleBin={clearRecycleBin}
              />
            )}

            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
