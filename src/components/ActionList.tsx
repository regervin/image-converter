import React, { useState } from 'react';
import { ActionItem } from '../types';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

interface ActionListProps {
  actions: ActionItem[];
  onAdd: (action: ActionItem) => void;
  onDelete: (id: string) => void;
  onUpdate: (action: ActionItem) => void;
  onToggleComplete: (id: string) => void;
}

const ActionList: React.FC<ActionListProps> = ({ 
  actions, 
  onAdd, 
  onDelete, 
  onUpdate, 
  onToggleComplete 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addNewRow = () => {
    const newAction: ActionItem = {
      id: Date.now().toString(),
      action: '',
      accomplishment: '',
      assignee: '',
      dueDate: '',
      completed: false
    };
    onAdd(newAction);
    setEditingId(newAction.id);
  };

  const ActionRow = ({ action }: { action: ActionItem }) => {
    const isEditing = editingId === action.id;

    if (isEditing) {
      return (
        <tr className="border-b">
          <td className="p-2">
            <input
              type="text"
              value={action.action}
              onChange={(e) => onUpdate({ ...action, action: e.target.value })}
              className="w-full p-1 border rounded"
            />
          </td>
          <td className="p-2">
            <textarea
              value={action.accomplishment}
              onChange={(e) => onUpdate({ ...action, accomplishment: e.target.value })}
              className="w-full p-1 border rounded"
              rows={2}
            />
          </td>
          <td className="p-2">
            <input
              type="text"
              value={action.assignee}
              onChange={(e) => onUpdate({ ...action, assignee: e.target.value })}
              className="w-full p-1 border rounded"
            />
          </td>
          <td className="p-2">
            <input
              type="date"
              value={action.dueDate}
              onChange={(e) => onUpdate({ ...action, dueDate: e.target.value })}
              className="w-full p-1 border rounded"
            />
          </td>
          <td className="p-2">
            <input
              type="checkbox"
              checked={action.completed}
              onChange={() => onToggleComplete(action.id)}
              className="w-4 h-4"
            />
          </td>
          <td className="p-2">
            <button
              onClick={() => setEditingId(null)}
              className="text-blue-500 hover:text-blue-700 mr-2"
            >
              Save
            </button>
          </td>
        </tr>
      );
    }

    return (
      <tr className={`border-b ${action.completed ? 'bg-green-50' : ''}`}>
        <td className={`p-2 ${action.completed ? 'line-through' : ''}`}>{action.action}</td>
        <td className={`p-2 ${action.completed ? 'line-through' : ''}`}>{action.accomplishment}</td>
        <td className={`p-2 ${action.completed ? 'line-through' : ''}`}>{action.assignee}</td>
        <td className={`p-2 ${action.completed ? 'line-through' : ''}`}>
          {action.dueDate && new Date(action.dueDate).toLocaleDateString()}
        </td>
        <td className="p-2">
          <input
            type="checkbox"
            checked={action.completed}
            onChange={() => onToggleComplete(action.id)}
            className="w-4 h-4"
          />
        </td>
        <td className="p-2">
          <button
            onClick={() => setEditingId(action.id)}
            className="text-blue-500 hover:text-blue-700 mr-2"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(action.id)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Action</th>
            <th className="p-2 text-left">How It Will Be Accomplished</th>
            <th className="p-2 text-left">Who Will Do It</th>
            <th className="p-2 text-left">When It Will Be Done</th>
            <th className="p-2 text-left">Done</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {actions.map(action => (
            <ActionRow key={action.id} action={action} />
          ))}
        </tbody>
      </table>
      <div className="p-4">
        <button
          onClick={addNewRow}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <FaPlus /> Add Row
        </button>
      </div>
    </div>
  );
};

export default ActionList;
