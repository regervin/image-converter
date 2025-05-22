import React from 'react';
import { FormHeader } from '../types';

interface HeaderFormProps {
  header: FormHeader;
  setHeader: (header: FormHeader) => void;
}

const HeaderForm: React.FC<HeaderFormProps> = ({ header, setHeader }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department Name
          </label>
          <input
            type="text"
            id="department"
            value={header.department}
            onChange={(e) => setHeader({ ...header, department: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="responsiblePerson" className="block text-sm font-medium text-gray-700">
            Responsible Person's Name
          </label>
          <input
            type="text"
            id="responsiblePerson"
            value={header.responsiblePerson}
            onChange={(e) => setHeader({ ...header, responsiblePerson: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={header.date}
            onChange={(e) => setHeader({ ...header, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderForm;
