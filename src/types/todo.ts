export type TodoStatus = 'todo' | 'in-progress' | 'completed';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  deadline?: Date;
  assignee?: string;
  createdAt: Date;
}

export type ColumnId = TodoStatus;
