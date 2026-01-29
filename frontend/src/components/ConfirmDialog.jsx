import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-2">
          <button 
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded"
          >
            Confirm
          </button>
          <button 
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;