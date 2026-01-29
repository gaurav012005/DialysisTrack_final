import React, { useState } from 'react';
import { showSuccess } from '../utils/errorHandler';

const AddMachineModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    machine_id: '',
    name: '',
    machine_type: 'hemodialysis',
    manufacturer: 'Fresenius',
    model: '',
    serial_number: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/machines/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          purchase_date: new Date().toISOString().split('T')[0],
          status: 'available'
        })
      });

      if (response.ok) {
        const newMachine = await response.json();
        onAdd(newMachine);
        onClose();
        showSuccess('Machine added successfully!');
        setFormData({
          machine_id: '',
          name: '',
          machine_type: 'hemodialysis',
          manufacturer: 'Fresenius',
          model: '',
          serial_number: ''
        });
      } else {
        alert('Failed to add machine. Please try again.');
      }
    } catch (error) {
      console.error('Failed to add machine:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Machine</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Machine ID (e.g., M005)"
            value={formData.machine_id}
            onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Machine Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={formData.machine_type}
            onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="hemodialysis">Hemodialysis</option>
            <option value="peritoneal">Peritoneal</option>
            <option value="hdf">HDF</option>
          </select>
          <input
            type="text"
            placeholder="Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Serial Number"
            value={formData.serial_number}
            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex space-x-2">
            <button type="submit" className="flex-1 bg-blue-500 text-white p-2 rounded">
              Add Machine
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-500 text-white p-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMachineModal;