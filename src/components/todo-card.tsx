import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, ArrowLeft, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Todo } from '@/types/todo';
import { cn } from '@/lib/utils';

interface TodoCardProps {
    todo: Todo;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    onMove: (id: string, direction: 'left' | 'right') => void;
}

export function TodoCard({ todo, onEdit, onDelete, onMove }: TodoCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: todo.id, data: { ...todo } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "mb-3 cursor-grab active:cursor-grabbing group relative hover:shadow-md transition-all bg-card border-l-4 p-3",
                todo.status === 'todo'
                    ? 'border-l-blue-500'
                    : todo.status === 'in-progress'
                        ? 'border-l-yellow-500'
                        : 'border-l-green-500'
            )}
            {...attributes}
            {...listeners}
        >
            <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-semibold leading-tight line-clamp-1">{todo.title}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {todo.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{todo.description}</p>
            )}

            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                    {todo.assignee && (
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {todo.assignee.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                    {todo.deadline && (
                        <Badge
                            variant={new Date(todo.deadline) < new Date() ? "destructive" : "secondary"}
                            className="text-[10px] px-1 py-0 h-5"
                        >
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {format(new Date(todo.deadline), 'MMM d')}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Move Buttons */}
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {todo.status !== 'todo' && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); onMove(todo.id, 'left'); }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <ArrowLeft className="h-3 w-3" />
                    </Button>
                )}
                {todo.status !== 'completed' && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); onMove(todo.id, 'right'); }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <ArrowRight className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </Card>
    );
}
