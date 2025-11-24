import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TodoCard } from './todo-card';
import { Todo, TodoStatus } from '@/types/todo';

interface KanbanColumnProps {
    id: TodoStatus;
    title: string;
    todos: Todo[];
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    onMove: (id: string, direction: 'left' | 'right') => void;
}

export function KanbanColumn({ id, title, todos, onEdit, onDelete, onMove }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="flex flex-col h-full min-h-0 bg-muted/50 rounded-lg p-4 w-full min-w-[300px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{title}</h3>
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                    {todos.length}
                </span>
            </div>

            <div className="flex-1 min-h-0">
                <div ref={setNodeRef} className="h-full overflow-y-auto space-y-3 pr-1">
                    <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {todos.map((todo) => (
                            <TodoCard
                                key={todo.id}
                                todo={todo}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onMove={onMove}
                            />
                        ))}
                    </SortableContext>
                    {todos.length === 0 && (
                        <div className="h-24 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-background/50">
                            Drop tasks here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
