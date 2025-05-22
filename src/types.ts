export interface FormHeader {
  department: string;
  responsiblePerson: string;
  date: string;
}

export interface ActionItem {
  id: string;
  action: string;
  accomplishment: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
}
