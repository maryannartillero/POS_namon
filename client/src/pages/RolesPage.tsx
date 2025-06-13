import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react'
import { rolesAPI } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import AddRoleModal from '../components/modals/role/AddRoleModal'
import EditRoleModal from '../components/modals/role/EditRoleModal'
import DeleteRoleModal from '../components/modals/role/DeleteRoleModal'

interface Role {
  id: number
  name: string
  display_name: string
  description: string
  users_count?: number
  created_at: string
}

const RolesPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery(
    ['roles', searchTerm],
    () => rolesAPI.getAll({ search: searchTerm }),
    { keepPreviousData: true }
  )

  const roles: Role[] = rolesData?.data?.roles?.data || rolesData?.data?.roles || []

  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setEditingRole(null)
    setShowEditModal(false)
  }

  const handleOpenDeleteModal = (role: Role) => {
    setDeletingRole(role)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setDeletingRole(null)
    setShowDeleteModal(false)
  }

  const handleRoleAdded = (message: string) => {
    queryClient.invalidateQueries('roles')
    toast.success(message)
    setShowAddModal(false)
  }

  const handleRoleUpdated = (message: string) => {
    queryClient.invalidateQueries('roles')
    toast.success(message)
    handleCloseEditModal()
  }

  const handleRoleDeleted = (message: string) => {
    queryClient.invalidateQueries('roles')
    toast.success(message)
    handleCloseDeleteModal()
  }

  return (
    <div className="roles-page fade-in">
      {/* Header */}
      <div className="page-header flex-between mb-4">
        <div>
          <h1>Roles Management</h1>
          <p className="text-muted">Manage user roles and permissions</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          Add Role
        </button>
      </div>

      {/* Search */}
      <div className="search-section mb-4">
        <div className="card">
          <div className="card-body">
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#666'
                }} 
              />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="card">
        <div className="card-header">
          <h3>Roles ({roles.length})</h3>
        </div>
        <div className="card-body p-0">
          {rolesLoading ? (
            <div className="text-center p-4">
              <LoadingSpinner />
              <p className="mt-2">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">No roles found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Display Name</th>
                    <th>Description</th>
                    <th>Users</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>
                        <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                          <Shield size={16} color="var(--primary-color)" />
                          <code>{role.name}</code>
                          {['admin', 'manager', 'cashier'].includes(role.name) && (
                            <span className="badge badge-secondary">System</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{role.display_name}</strong>
                      </td>
                      <td>{role.description || 'No description'}</td>
                      <td>{role.users_count || 0}</td>
                      <td>{new Date(role.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="flex" style={{ gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleOpenEditModal(role)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleOpenDeleteModal(role)}
                            disabled={['admin', 'manager', 'cashier'].includes(role.name)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddRoleModal
        showModal={showAddModal}
        onRoleAdded={handleRoleAdded}
        onClose={() => setShowAddModal(false)}
      />

      <EditRoleModal
        showModal={showEditModal}
        role={editingRole}
        onRoleUpdated={handleRoleUpdated}
        onClose={handleCloseEditModal}
      />

      <DeleteRoleModal
        showModal={showDeleteModal}
        role={deletingRole}
        onRoleDeleted={handleRoleDeleted}
        onClose={handleCloseDeleteModal}
      />
    </div>
  )
}

export default RolesPage