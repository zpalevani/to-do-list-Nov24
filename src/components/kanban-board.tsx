'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { TodoCard } from './todo-card';
import { TodoDialog } from './todo-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Todo, TodoStatus } from '@/types/todo';

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function KanbanBoard() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        // Find the containers
        const activeTask = todos.find(t => t.id === activeId);
        const overTask = todos.find(t => t.id === overId);

        if (!activeTask) return;

        const activeColumnId = activeTask.status;
        // If over a task, its status is the column. If over a column (droppable), the id is the status.
        const overColumnId = overTask ? overTask.status : (overId as TodoStatus);

        if (activeColumnId !== overColumnId) {
            setTodos((items) => {
                const activeIndex = items.findIndex((t) => t.id === activeId);
                const overIndex = items.findIndex((t) => t.id === overId);

                const newItems = [...items];
                // Update status
                newItems[activeIndex] = { ...newItems[activeIndex], status: overColumnId as TodoStatus };

                // If we are over a task, we might want to reorder too, but for now just changing status is enough for dragOver
                // The reordering happens in dragEnd or if we use arrayMove here.
                // To keep it simple and robust: just update status. The SortableContext will handle the rest visually.
                return arrayMove(newItems, activeIndex, overIndex >= 0 ? overIndex : activeIndex);
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = todos.find(t => t.id === activeId);
        if (!activeTask) return;

        const activeColumnId = activeTask.status;
        const overTask = todos.find(t => t.id === overId);
        const overColumnId = overTask ? overTask.status : (overId as TodoStatus);

        if (activeColumnId !== overColumnId) {
            // Handled in DragOver, but ensure final state
            setTodos((items) => {
                const activeIndex = items.findIndex((t) => t.id === activeId);
                const newItems = [...items];
                newItems[activeIndex] = { ...newItems[activeIndex], status: overColumnId as TodoStatus };
                return newItems;
            });
        } else {
            // Reorder in same column
            if (activeId !== overId) {
                setTodos((items) => {
                    const oldIndex = items.findIndex((t) => t.id === activeId);
                    const newIndex = items.findIndex((t) => t.id === overId);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        }
    };

    const handleAddTodo = (data: Omit<Todo, 'id' | 'createdAt' | 'status'>) => {
        const newTodo: Todo = {
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            status: 'todo',
            ...data,
        };
        setTodos((current) => [...current, newTodo]);
    };

    const handleEditTodo = (data: Omit<Todo, 'id' | 'createdAt' | 'status'>) => {
        if (!editingTodo) return;
        setTodos((items) => items.map((t) => (t.id === editingTodo.id ? { ...t, ...data } : t)));
        setEditingTodo(undefined);
    };

    const handleDeleteTodo = (id: string) => {
        setTodos((items) => items.filter((t) => t.id !== id));
    };

    const handleMoveTodo = (id: string, direction: 'left' | 'right') => {
        setTodos((items) =>
            items.map((t) => {
                if (t.id !== id) return t;

                let newStatus: TodoStatus = t.status;
                if (direction === 'right') {
                    if (t.status === 'todo') newStatus = 'in-progress';
                    else if (t.status === 'in-progress') newStatus = 'completed';
                } else {
                    if (t.status === 'completed') newStatus = 'in-progress';
                    else if (t.status === 'in-progress') newStatus = 'todo';
                }

                return { ...t, status: newStatus };
            })
        );
    };

    const openAddDialog = () => {
        setEditingTodo(undefined);
        setIsDialogOpen(true);
    };

    const openEditDialog = (todo: Todo) => {
        setEditingTodo(todo);
        setIsDialogOpen(true);
    };

    const columns: TodoStatus[] = ['todo', 'in-progress', 'completed'];
    const columnTitles = {
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    };

    const activeTodo = activeId ? todos.find(t => t.id === activeId) : null;

    return (
        <div className="h-full min-h-0 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Task Manager by Zara</h1>
                    <p className="text-muted-foreground">Plan, prioritize, and finish every task with clarity.</p>
                </div>
                <Button onClick={openAddDialog} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Task
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                    {columns.map((colId) => (
                        <KanbanColumn
                            key={colId}
                            id={colId}
                            title={columnTitles[colId]}
                            todos={todos.filter(t => t.status === colId)}
                            onEdit={openEditDialog}
                            onDelete={handleDeleteTodo}
                            onMove={handleMoveTodo}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTodo ? (
                        <TodoCard
                            todo={activeTodo}
                            onEdit={() => { }}
                            onDelete={() => { }}
                            onMove={() => { }}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <TodoDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={editingTodo ? handleEditTodo : handleAddTodo}
                initialData={editingTodo}
                mode={editingTodo ? 'edit' : 'create'}
            />
        </div>
    );
}
