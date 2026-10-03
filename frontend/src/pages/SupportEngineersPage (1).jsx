import React, { useState, useEffect } from 'react';
import { Search, Eye, Pencil, Trash, AlertTriangle, X } from 'lucide-react';
import api from '../api/axios';
import './SupportEngineersPage.css';

const INITIAL_DATA = [
  {id:1, engineerId:'ENG-S01', firstName:'balaji', lastName:'C', email:'balaji@gmail.com', phone:'8975643122', department:'Technical support', specialization:'Software Specialist', status:'active', availability:'available'}
];

const SupportEngineersPage = () => {
  const [engineers, setEngineers] = useState([]);
  const [search, setSearch] = useState('');
  
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeEngineer, setActiveEngineer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
  const fetchEngineers = async () => {
    try {
      const response = await api.get('/engineers');
      setEngineers(response.data);
    } catch (error) {
      console.error('Failed to load engineers:', error);
    }
  };

  fetchEngineers();
  }, []);

  const [formData, setFormData] = useState({
    status: 'active', firstName: '', lastName: '', email: '', phone: '', 
    department: 'Technical support', specialization: '', password: '', confirmPassword: '', availability: 'available'
  });

  const filteredEngineers = engineers.filter(e => 
    e.firstName.toLowerCase().includes(search.toLowerCase()) ||
    e.lastName.toLowerCase().includes(search.toLowerCase()) ||
    e.engineerId.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setIsEditing(false);
    setFormData({status: 'active', firstName: '', lastName: '', email: '', phone: '', department: 'Technical support', specialization: '', password: '', confirmPassword: '', availability: 'available'});
    setShowAddEdit(true);
  };

  const openEdit = (eng) => {
    setIsEditing(true);
    setActiveEngineer(eng);
    setFormData({...eng, password: '', confirmPassword: ''});
    setShowAddEdit(true);
  };

  const openView = (eng) => {
    setActiveEngineer(eng);
    setShowView(true);
  };

  const openDelete = (eng) => {
    setActiveEngineer(eng);
    setShowDelete(true);
  };

  const handleDelete = () => {
    setEngineers(engineers.filter(e => e.id !== activeEngineer.id));
    setShowDelete(false);
  };

  const handleSave = async () => {
  try {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (isEditing) {
      const response = await api.put(
        `/engineers/${activeEngineer.id}`,
        formData
      );

      setEngineers(
        engineers.map(eng =>
          eng.id === activeEngineer.id ? response.data : eng
        )
      );
    } else {
      const engineerData = {
        ...formData,
        engineerId: `ENG-S${String(engineers.length + 1).padStart(2, '0')}`
      };

      const response = await api.post('/engineers', engineerData);

      setEngineers([...engineers, response.data]);
    }

    setShowAddEdit(false);
  } catch (error) {
    console.error('Failed to save engineer:', error);
    alert('Failed to save engineer.');
  }
  };

  const getInitials = (f, l) => `${f.charAt(0).toUpperCase()}${l.charAt(0).toUpperCase()}`;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Support Engineers</h1>
          <p className="page-subtitle">Manage your organization's support engineers.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          + Add Engineer
        </button>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="employee-count">{filteredEngineers.length} engineer(s)</div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>ID</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>DEPARTMENT</th>
                <th>SPECIALIZATION</th>
                <th>STATUS</th>
                <th>AVAILABILITY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEngineers.map(eng => (
                <tr key={eng.id}>
                  <td>
                    <div className="avatar-cell">
                      <div className="avatar-circle">{getInitials(eng.firstName, eng.lastName)}</div>
                      <span>{eng.firstName} {eng.lastName}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-orange">{eng.engineerId}</span></td>
                  <td>{eng.email}</td>
                  <td>{eng.phone}</td>
                  <td>{eng.department}</td>
                  <td>{eng.specialization}</td>
                  <td><span className="badge badge-success">{eng.status}</span></td>
                  <td><span className="badge badge-blue">{eng.availability}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" onClick={() => openView(eng)}><Eye size={18} /></button>
                      <button className="icon-btn" onClick={() => openEdit(eng)}><Pencil size={18} /></button>
                      <button className="icon-btn" onClick={() => openDelete(eng)}><Trash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <span>Page 1 of 1</span>
          <div className="pagination-controls">
            <button className="btn-secondary">Prev</button>
            <span className="badge badge-purple">1</span>
            <button className="btn-secondary">Next</button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showView && activeEngineer && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h2>{activeEngineer.firstName} {activeEngineer.lastName}</h2>
              <button className="close-btn" onClick={() => setShowView(false)}><X size={20}/></button>
            </div>
            <div className="view-profile-header">
              <div className="avatar-circle large">{getInitials(activeEngineer.firstName, activeEngineer.lastName)}</div>
              <h3>{activeEngineer.firstName} {activeEngineer.lastName}</h3>
              <p>Software Engineer</p>
              <span className="badge badge-success">{activeEngineer.status}</span>
            </div>
            <div className="info-grid">
              <div className="info-item"><label>ID</label><span>{activeEngineer.engineerId}</span></div>
              <div className="info-item"><label>Role</label><span>engineer</span></div>
              <div className="info-item"><label>Email</label><span>{activeEngineer.email}</span></div>
              <div className="info-item"><label>Phone</label><span>{activeEngineer.phone}</span></div>
              <div className="info-item"><label>Department</label><span>{activeEngineer.department}</span></div>
              <div className="info-item"><label>Availability</label><span>{activeEngineer.availability}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddEdit && (
        <div className="modal-overlay">
          <div className="modal-content form-modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Support Engineer' : 'Add Support Engineer'}</h2>
              <button className="close-btn" onClick={() => setShowAddEdit(false)}><X size={20}/></button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Engineer ID</label>
                <input type="text" value={isEditing ? activeEngineer.engineerId : 'EMP-1001'} readOnly className="read-only" />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                  <option value="Technical support">Technical support</option>
                  <option value="Network">Network</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security">Security</option>
                </select>
              </div>
              <div className="form-group">
                <label>Specialization *</label>
                <input type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Availability *</label>
                <select value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})}>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setFormData({status: 'active', firstName: '', lastName: '', email: '', phone: '', department: 'Technical support', specialization: '', password: '', confirmPassword: '', availability: 'available'})}>Reset</button>
              <button className="btn-secondary" onClick={() => setShowAddEdit(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>{isEditing ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <button className="close-btn abs" onClick={() => setShowDelete(false)}><X size={20}/></button>
            <h2>Delete</h2>
            <div className="delete-modal-body">
              <div className="delete-modal-info">
                <div className="delete-icon-wrapper">
                  <AlertTriangle className="warning-icon" size={48} />
                </div>
                <p>Want to Delete the support Engineer {activeEngineer?.firstName} {activeEngineer?.lastName}?</p>
              </div>
              <button className="btn-danger full-width" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportEngineersPage;
