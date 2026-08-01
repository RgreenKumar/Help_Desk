import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import './DepartmentsPage.css';

const mockDepartments = [
  { id: 1, name: 'IT', description: 'Software development & support', employees: 1, icon: '🏗️', color: '#3B82F6' },
  { id: 2, name: 'HR', description: 'Human resources management', employees: 0, icon: '👥', color: '#10B981' },
  { id: 3, name: 'Finance', description: 'Financial operations', employees: 0, icon: '💰', color: '#F59E0B' },
  { id: 4, name: 'Operations', description: 'Business operations', employees: 0, icon: '⚙️', color: '#8B5CF6' }
];

export default function DepartmentsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  return (
    <div className="departments-page">
      <div className="departments-header">
        <div>
          <h1>Departments</h1>
          <p>Organize your teams into departments.</p>
        </div>
        <button className="add-dept-btn" onClick={() => setShowAddModal(true)}>+ Add Department</button>
      </div>

      <div className="departments-grid">
        {mockDepartments.map(dept => (
          <div key={dept.id} className="dept-card">
            <button className="delete-btn"><Trash2 size={18} /></button>
            <div className="dept-icon-wrapper" style={{ backgroundColor: `${dept.color}15`, color: dept.color }}>
              <span className="dept-icon">{dept.icon}</span>
            </div>
            <h3 className="dept-name">{dept.name}</h3>
            <p className="dept-desc">{dept.description}</p>
            <div className="dept-footer">
              {dept.employees} Employees
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card add-dept-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Department</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Marketing" 
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows={4}
                  placeholder="What does this department do?"
                  value={newDeptDesc}
                  onChange={e => setNewDeptDesc(e.target.value)}
                ></textarea>
              </div>
              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="save-btn" onClick={() => setShowAddModal(false)}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
