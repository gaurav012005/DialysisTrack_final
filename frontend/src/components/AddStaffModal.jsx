import React, { useState } from 'react';

const AddStaffModal = ({ isOpen, onClose, onAdd, editingStaff = null }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    role: 'nurse',
    password: '',
    phone_number: '',
    department: 'Dialysis'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Generate a random secure password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPass = generatePassword();
    setFormData({ ...formData, password: newPass });
  };

  const handleGenerateResetPassword = () => {
    const newPass = generatePassword();
    setNewPassword(newPass);
  };

  // Update form data when editing staff changes
  React.useEffect(() => {
    if (editingStaff) {
      const [firstName, lastName] = editingStaff.name.split(' ');
      setFormData({
        first_name: firstName || '',
        last_name: lastName || '',
        email: editingStaff.email || '',
        username: editingStaff.username || '',
        role: editingStaff.role || 'nurse',
        password: '',
        phone_number: editingStaff.phone_number || '',
        department: editingStaff.department || 'Dialysis'
      });
      setShowResetPassword(false);
      setNewPassword('');
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        role: 'nurse',
        password: '',
        phone_number: '',
        department: 'Dialysis'
      });
    }
  }, [editingStaff]);

  // Reset password for existing staff
  const handleResetPassword = async () => {
    if (!newPassword) {
      alert('Please generate or enter a new password');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/auth/users/${editingStaff.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        alert(`Password reset successfully!\n\nNew Password: ${newPassword}\n\nPlease share this with the staff member securely.`);
        setShowResetPassword(false);
        setNewPassword('');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        phone_number: formData.phone_number,
        department: formData.department
      };

      // Add email, username and password only for new staff
      if (!editingStaff) {
        if (!formData.email) {
          alert('Email is required for new staff members');
          return;
        }
        if (!formData.password || formData.password.length < 6) {
          alert('Password is required and must be at least 6 characters');
          return;
        }
        userData.email = formData.email;
        userData.username = formData.email;
        userData.password = formData.password;
      }

      const url = editingStaff
        ? `http://localhost:8000/api/auth/users/${editingStaff.id}/`
        : 'http://localhost:8000/api/auth/users/';

      const method = editingStaff ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        onAdd();
        onClose();
        setFormData({ first_name: '', last_name: '', email: '', username: '', role: 'nurse', password: '', phone_number: '', department: 'Dialysis' });

        // Show password to admin for new staff
        if (!editingStaff && userData.password) {
          alert(`Staff member added successfully!\n\nLogin Credentials:\nEmail: ${userData.email}\nPassword: ${userData.password}\n\nPlease share these credentials with the staff member securely.`);
        } else {
          alert(`Staff member updated successfully!`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to ${editingStaff ? 'update' : 'add'} staff:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[450px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {!editingStaff && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value, username: e.target.value })}
                  className="input-field"
                  placeholder="This will be used as login username"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Password * (min 6 characters)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field pr-10"
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                {formData.password && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Password set. Make sure to share this with the staff member.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input-field"
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="technician">Technician</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field"
              >
                <option value="Dialysis">Dialysis</option>
                <option value="Nephrology">Nephrology</option>
                <option value="ICU">ICU</option>
                <option value="Emergency">Emergency</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="input-field"
              placeholder="Enter phone number"
            />
          </div>

          {/* Password Reset Section for Existing Staff */}
          {editingStaff && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-yellow-800">Reset Password</label>
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                >
                  {showResetPassword ? 'Cancel' : 'Reset Password'}
                </button>
              </div>

              {showResetPassword && (
                <div className="mt-2">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field flex-1"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateResetPassword}
                      className="px-3 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 text-sm"
                    >
                      Generate
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                  >
                    Confirm Password Reset
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <button type="submit" className="btn-primary flex-1">
              {editingStaff ? 'Update Staff' : 'Add Staff'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;