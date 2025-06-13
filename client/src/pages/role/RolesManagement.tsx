import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import RolesTable from "../../components/tables/role/RolesTable";
import AddRoleModal from "../../components/modals/role/AddRoleModal";
import EditRoleModal from "../../components/modals/role/EditRoleModal";
import DeleteRoleModal from "../../components/modals/role/DeleteRoleModal";
import toast from "react-hot-toast";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

const RolesManagement: React.FC = () => {
  const [refreshRoles, setRefreshRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [openAddRoleModal, setOpenAddRoleModal] = useState(false);
  const [openEditRoleModal, setOpenEditRoleModal] = useState(false);
  const [openDeleteRoleModal, setOpenDeleteRoleModal] = useState(false);

  const handleRefreshRoles = () => {
    setRefreshRoles(!refreshRoles);
  };

  const handleOpenEditRoleModal = (role: Role) => {
    setSelectedRole(role);
    setOpenEditRoleModal(true);
  };

  const handleCloseEditRoleModal = () => {
    setSelectedRole(null);
    setOpenEditRoleModal(false);
  };

  const handleOpenDeleteRoleModal = (role: Role) => {
    setSelectedRole(role);
    setOpenDeleteRoleModal(true);
  };

  const handleCloseDeleteRoleModal = () => {
    setSelectedRole(null);
    setOpenDeleteRoleModal(false);
  };

  const handleRoleAdded = (message: string) => {
    toast.success(message);
    handleRefreshRoles();
    setOpenAddRoleModal(false);
  };

  const handleRoleUpdated = (message: string) => {
    toast.success(message);
    handleRefreshRoles();
    handleCloseEditRoleModal();
  };

  const handleRoleDeleted = (message: string) => {
    toast.success(message);
    handleRefreshRoles();
    handleCloseDeleteRoleModal();
  };

  return (
    <div className="roles-management fade-in">
      {/* Header */}
      <div className="page-header flex-between mb-4">
        <div>
          <h1>Roles Management</h1>
          <p className="text-muted">Manage user roles and permissions</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setOpenAddRoleModal(true)}
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
      <RolesTable
        refreshRoles={refreshRoles}
        onEditRole={handleOpenEditRoleModal}
        onDeleteRole={handleOpenDeleteRoleModal}
        searchTerm={searchTerm}
      />

      {/* Modals */}
      <AddRoleModal
        showModal={openAddRoleModal}
        onRoleAdded={handleRoleAdded}
        onClose={() => setOpenAddRoleModal(false)}
      />

      <EditRoleModal
        showModal={openEditRoleModal}
        role={selectedRole}
        onRoleUpdated={handleRoleUpdated}
        onClose={handleCloseEditRoleModal}
      />

      <DeleteRoleModal
        showModal={openDeleteRoleModal}
        role={selectedRole}
        onRoleDeleted={handleRoleDeleted}
        onClose={handleCloseDeleteRoleModal}
      />
    </div>
  );
};

export default RolesManagement;