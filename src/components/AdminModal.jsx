import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminModal.css';

const AdminModal = ({ onClose }) => {
  const { setupAdmin } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    setupAdmin(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Create Help Desk Admin</h2>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        
        <div className="modal-content">
          <div className="modal-grid">
            <div className="form-group">
              <label>Admin ID</label>
              <input type="text" value="ADM-01" readOnly className="readonly-input" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>First Name <span className="required">*</span></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone <span className="required">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password <span className="required">*</span></label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-outlined" onClick={() => setFormData({})}>Reset</button>
          <button className="btn-outlined" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>
            <Save size={18} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
