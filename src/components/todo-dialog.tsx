import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types/todo';

interface TodoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (todo: Omit<Todo, 'id' | 'createdAt' | 'status'>) => void;
    initialData?: Todo;
    mode: 'create' | 'edit';
}

export function TodoDialog({ open, onOpenChange, onSubmit, initialData, mode }: TodoDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState('');
    const [deadline, setDeadline] = useState<Date | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* eslint-disable react-hooks/set-state-in-effect -- form fields must mirror the task being edited */
    useEffect(() => {
        if (open && initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setAssignee(initialData.assignee || '');
            setDeadline(initialData.deadline ? new Date(initialData.deadline) : undefined);
        } else if (open && !initialData) {
            setTitle('');
            setDescription('');
            setAssignee('');
            setDeadline(undefined);
        }
        if (!open) {
            setIsSubmitting(false);
        }
    }, [open, initialData]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        onSubmit({
            title,
            description,
            assignee,
            deadline,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task title"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Input
                            id="assignee"
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2 flex flex-col">
                        <Label>Deadline</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !deadline && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={deadline}
                                    onSelect={setDeadline}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {mode === 'create' ? 'Create' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
