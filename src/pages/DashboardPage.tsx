import KanbanBoard from "../components/KanbanBoard";

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="py-10 w-[420px] mx-auto">
        <h1 className="text-3xl text-center mb-3 font-bold">NIBIRU KANBAN</h1>
        <p className="text-md text-end -rotate-6">
          by{" "}
          <a
            className="text-blue-600 font-bold"
            target="blank"
            href="https://github.com/andry-pebrianto"
          >
            Andry Pebrianto
          </a>
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
