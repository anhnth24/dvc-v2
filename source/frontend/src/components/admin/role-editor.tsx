import React, { useState } from 'react';
import './role-editor.css';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface RoleEditorProps {
  roles?: Role[];
  permissions?: Permission[];
  onCreateRole?: (role: Omit<Role, 'id'>) => void;
  onUpdateRole?: (id: string, updates: Partial<Role>) => void;
  onDeleteRole?: (id: string) => void;
}

export function RoleEditor({
  roles = [],
  permissions = [],
  onCreateRole,
  onUpdateRole,
  onDeleteRole
}: RoleEditorProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedRole) return;

    const newPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(p => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    const updatedRole = { ...selectedRole, permissions: newPermissions };
    setSelectedRole(updatedRole);
    onUpdateRole?.(selectedRole.id, { permissions: newPermissions });
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="role-editor">
      <div className="role-editor__header">
        <h2>Role Management</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Role
        </button>
      </div>

      <div className="role-editor__content">
        <div className="roles-list">
          <h3>Roles ({roles.length})</h3>
          {roles.map(role => (
            <div
              key={role.id}
              className={`role-item ${selectedRole?.id === role.id ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(role)}
            >
              <div className="role-info">
                <div className="role-name">{role.name}</div>
                <div className="role-description">{role.description}</div>
                <div className="role-meta">
                  {role.isSystem && <span className="system-badge">System</span>}
                  <span className="permission-count">{role.permissions.length} permissions</span>
                </div>
              </div>
              {!role.isSystem && (
                <button
                  className="delete-role-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRole?.(role.id);
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="permissions-panel">
          {selectedRole ? (
            <>
              <div className="panel-header">
                <h3>Permissions for &quot;{selectedRole.name}&quot;</h3>
                <span className="selected-count">
                  {selectedRole.permissions.length} selected
                </span>
              </div>

              <div className="permissions-categories">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="permission-category">
                    <h4 className="category-title">{category}</h4>
                    <div className="permission-list">
                      {categoryPermissions.map(permission => (
                        <label key={permission.id} className="permission-item">
                          <input
                            type="checkbox"
                            checked={selectedRole.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            disabled={selectedRole.isSystem}
                          />
                          <div className="permission-details">
                            <div className="permission-name">{permission.name}</div>
                            <div className="permission-description">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-selection">
              Select a role to view and edit permissions
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateRoleModal
          onSubmit={(roleData) => {
            onCreateRole?.(roleData);
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

interface CreateRoleModalProps {
  onSubmit: (role: Omit<Role, 'id'>) => void;
  onCancel: () => void;
}

function CreateRoleModal({ onSubmit, onCancel }: CreateRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isSystem: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create New Role</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="role-form">
          <div className="form-group">
            <label>Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="form-textarea"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}