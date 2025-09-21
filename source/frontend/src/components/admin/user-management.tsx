import React, { useState } from 'react';
import './user-management.css';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  department?: string;
}

export interface UserManagementProps {
  users?: User[];
  onCreateUser?: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  onUpdateUser?: (id: string, updates: Partial<User>) => void;
  onDeleteUser?: (id: string) => void;
  onResetPassword?: (id: string) => void;
  loading?: boolean;
}

export function UserManagement({
  users = [],
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onResetPassword,
  loading = false
}: UserManagementProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectUser = (userId: string, selected: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (selected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const statusConfig = {
      active: { label: 'Active', color: 'green' },
      inactive: { label: 'Inactive', color: 'gray' },
      suspended: { label: 'Suspended', color: 'red' }
    };

    const config = statusConfig[status];
    return (
      <span className={`status-badge status-badge--${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="user-management">
      <div className="user-management__header">
        <div className="header-title">
          <h2>User Management</h2>
          <span className="user-count">{users.length} users</span>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="user-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {selectedUsers.size > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedUsers.size} selected</span>
            <button className="bulk-btn bulk-btn--deactivate">
              Deactivate
            </button>
            <button className="bulk-btn bulk-btn--delete">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>User</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="user-row">
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.fullName}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <div className="user-roles">
                    {user.roles.map(role => (
                      <span key={role} className="role-badge">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{getStatusBadge(user.status)}</td>
                <td>
                  <span className="last-login">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <div className="user-actions">
                    <button
                      className="action-btn action-btn--edit"
                      onClick={() => {/* Edit user */}}
                      title="Edit user"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn action-btn--reset"
                      onClick={() => onResetPassword?.(user.id)}
                      title="Reset password"
                    >
                      🔑
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => onDeleteUser?.(user.id)}
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            {searchTerm || statusFilter !== 'all'
              ? 'No users match your filters'
              : 'No users found'
            }
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onSubmit={(userData) => {
            onCreateUser?.(userData);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

interface CreateUserModalProps {
  onSubmit: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  onCancel: () => void;
}

function CreateUserModal({ onSubmit, onCancel }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    roles: [] as string[],
    status: 'active' as User['status'],
    department: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New User</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}