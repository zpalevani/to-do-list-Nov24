import { KanbanBoard } from '@/components/kanban-board';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 lg:p-12 bg-background">
      <div className="w-full max-w-7xl mx-auto h-[calc(100vh-6rem)]">
        <KanbanBoard />
      </div>
    </main>
  );
}
