import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import api from '../api/axios';
import './DepartmentsPage.css';

// Department model has no icon/color field, so we derive a look client-side.
const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
const colorFor = (id) => PALETTE[id % PALETTE.length];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const loadDepartments = () => {
    setLoading(true);
    api.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load departments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSave = async () => {
    if (!newDeptName.trim()) {
      setError('Department name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await api.post('/departments', {
        name: newDeptName.trim(),
        description: newDeptDesc.trim(),
      });
      setDepartments(prev => [...prev, res.data]);
      setShowAddModal(false);
      setNewDeptName('');
      setNewDeptDesc('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <div className="departments-page">
      <div className="departments-header">
        <div>
          <h1>Departments</h1>
          <p>Organize your teams into departments.</p>
        </div>
        <button className="add-dept-btn" onClick={() => setShowAddModal(true)}>+ Add Department</button>
      </div>

      {error && <p style={{ color: '#EF4444', marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p>Loading departments...</p>
      ) : (
        <div className="departments-grid">
          {departments.map(dept => {
            const color = colorFor(dept.id);
            return (
              <div key={dept.id} className="dept-card">
                <button className="delete-btn" onClick={() => handleDelete(dept.id)}>
                  <Trash2 size={18} />
                </button>
                <div className="dept-icon-wrapper" style={{ backgroundColor: `${color}15`, color }}>
                  <span className="dept-icon">🏢</span>
                </div>
                <h3 className="dept-name">{dept.name}</h3>
                <p className="dept-desc">{dept.description}</p>
                <div className="dept-footer">
                  {dept.employeeCount} Employees
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                <button className="cancel-btn" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
