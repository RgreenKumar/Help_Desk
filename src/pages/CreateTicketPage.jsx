import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreateTicketPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: '',
    subcategory: '',
    priority: 'Medium'
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const user = JSON.parse(localStorage.getItem('user'));

      const ticketData = {
        ...form,
        status: 'Open',
        employeeName: user?.name || '',
        employeeDepartment: user?.department || '',
        employeeEmail: user?.email || ''
      };

      await api.post('/tickets', ticketData);

      alert('Ticket created successfully!');
      navigate('/tickets');
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px' }}>
      <h1>Raise a Ticket</h1>
      <p>Tell the support team about the problem you're experiencing.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: '25px' }}>
          <label>Subject *</label>
          <br />

          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px'
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>Description *</label>
          <br />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows="6"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px'
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>Category *</label>
          <br />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px'
            }}
          >
            <option value="">Select Category</option>
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Network">Network</option>
            <option value="Password Reset">Password Reset</option>
            <option value="Desktop">Desktop</option>
            <option value="Monitor">Monitor</option>
          </select>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>Subcategory *</label>
          <br />

          <input
            name="subcategory"
            value={form.subcategory}
            onChange={handleChange}
            required
            placeholder="Example: Software Installation"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px'
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label>Priority *</label>
          <br />

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px'
            }}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: '25px',
            padding: '12px 25px',
            cursor: 'pointer'
          }}
        >
          {submitting ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  );
};

export default CreateTicketPage;