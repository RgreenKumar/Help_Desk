import React, { useState, useEffect } from 'react';
import { Search, Eye, Pencil, Trash, AlertTriangle, X } from 'lucide-react';
import api from '../api/axios';
import './EmployeesPage.css';

const INITIAL_DATA = [
  {id:1, employeeId:'EMP-1001', firstName:'riyas', lastName:'K', email:'riyas@gmail.com', phone:'9876543210', department:'IT', designation:'Software Engineer', status:'active'}
];

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
      const departmentResponse = await api.get('/departments');
      setDepartments(departmentResponse.data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  fetchEmployees();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    status: 'active', firstName: '', lastName: '', email: '', phone: '', department: '', designation: '', password: '', confirmPassword: ''
  });

  const filteredEmployees = employees.filter(e => 
    e.firstName.toLowerCase().includes(search.toLowerCase()) ||
    e.lastName.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setIsEditing(false);
    setFormData({
  status: 'active',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  password: '',
  confirmPassword: ''
    });
    setShowAddEdit(true);
  };

  const openEdit = (emp) => {
    setIsEditing(true);
    setActiveEmployee(emp);
    setFormData({...emp});
    setShowAddEdit(true);
  };

  const openView = (emp) => {
    setActiveEmployee(emp);
    setShowView(true);
  };

  const openDelete = (emp) => {
    setActiveEmployee(emp);
    setShowDelete(true);
  };

  const handleDelete = async () => {
  try {
    await api.delete(`/employees/${activeEmployee.id}`);

    setEmployees(
      employees.filter(emp => emp.id !== activeEmployee.id)
    );

    setShowDelete(false);
  } catch (error) {
    console.error('Failed to delete employee:', error);
    alert('Failed to delete employee.');
  }
  };
  const handleSave = async () => {
  try {
    if (!isEditing) {
      if (!formData.password) {
        alert('Password is required.');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
    }

    // Do not send confirmPassword to backend
    const { confirmPassword, ...employeeData } = formData;

    if (isEditing) {
      const response = await api.put(
        `/employees/${activeEmployee.id}`,
        employeeData
      );

      setEmployees(
        employees.map(emp =>
          emp.id === activeEmployee.id ? response.data : emp
        )
      );
    } else {
      const response = await api.post('/employees', employeeData);

      setEmployees([...employees, response.data]);
    }

    setShowAddEdit(false);

  } catch (error) {
    console.error('Failed to save employee:', error);
    alert(
      error.response?.data?.error ||
      'Failed to save employee.'
    );
  }
};
 

  const getInitials = (f, l) => `${f.charAt(0).toUpperCase()}${l.charAt(0).toUpperCase()}`;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your organization's employees.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          + Add Employee
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
        <div className="employee-count">{filteredEmployees.length} employee(s)</div>
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
                <th>DESIGNATION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="avatar-cell">
                      <div className="avatar-circle">{getInitials(emp.firstName, emp.lastName)}</div>
                      <span>{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-purple">{emp.employeeId}</span></td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td><span className="badge badge-success">{emp.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" onClick={() => openView(emp)}><Eye size={18} /></button>
                      <button className="icon-btn" onClick={() => openEdit(emp)}><Pencil size={18} /></button>
                      <button className="icon-btn" onClick={() => openDelete(emp)}><Trash size={18} /></button>
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
      {showView && activeEmployee && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h2>{activeEmployee.firstName} {activeEmployee.lastName}</h2>
              <button className="close-btn" onClick={() => setShowView(false)}><X size={20}/></button>
            </div>
            <div className="view-profile-header">
              <div className="avatar-circle large">{getInitials(activeEmployee.firstName, activeEmployee.lastName)}</div>
              <h3>{activeEmployee.firstName} {activeEmployee.lastName}</h3>
              <p>{activeEmployee.designation}</p>
              <span className="badge badge-success">{activeEmployee.status}</span>
            </div>
            <div className="info-grid">
              <div className="info-item"><label>ID</label><span>{activeEmployee.employeeId}</span></div>
              <div className="info-item"><label>Role</label><span>employee</span></div>
              <div className="info-item"><label>Email</label><span>{activeEmployee.email}</span></div>
              <div className="info-item"><label>Phone</label><span>{activeEmployee.phone}</span></div>
              <div className="info-item"><label>Department</label><span>{activeEmployee.department}</span></div>
              <div className="info-item"><label>Availability</label><span>available</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddEdit && (
        <div className="modal-overlay">
          <div className="modal-content form-modal">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="close-btn" onClick={() => setShowAddEdit(false)}><X size={20}/></button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Employee ID</label>
                <input type="text" value={isEditing ? activeEmployee.employeeId : 'EMP-XXXX'} readOnly className="read-only" />
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
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Designation *</label>
                <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
              </div>
              {!isEditing && (
  <>
    <div className="form-group">
      <label>Password *</label>
      <input
        type="password"
        value={formData.password}
        onChange={e =>
          setFormData({...formData, password: e.target.value})
        }
        placeholder="Enter password"
      />
    </div>

    <div className="form-group">
      <label>Confirm Password *</label>
      <input
        type="password"
        value={formData.confirmPassword}
        onChange={e =>
          setFormData({...formData, confirmPassword: e.target.value})
        }
        placeholder="Confirm password"
      />
    </div>
  </>
      )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setFormData({status: 'active', firstName: '', lastName: '', email: '', phone: '', department: '', designation: '', password: '', confirmPassword: ''})}>Reset</button>
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
                <p>Want to Delete Employee {activeEmployee?.firstName} {activeEmployee?.lastName}?</p>
              </div>
              <button className="btn-danger full-width" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
