import React, { useEffect, useState } from "react";
import { rolesAPI } from "../../../services/api";
import LoadingSpinner from "../../ui/LoadingSpinner";
import { Edit, Trash2, Shield, Users } from "lucide-react";
import toast from "react-hot-toast";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  users_count?: number;
  created_at: string;
}

interface RolesTableProps {
  refreshRoles: boolean;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  searchTerm?: string;
}

const RolesTable: React.FC<RolesTableProps> = ({ 
  refreshRoles, 
  onEditRole, 
  onDeleteRole,
  searchTerm = ""
}) => {
  const [state, setState] = useState({
    loadingRoles: true,
    roles: [] as Role[],
  });

  const handleLoadRoles = async () => {
    setState((prevState) => ({
      ...prevState,
      loadingRoles: true,
    }));

    try {
      const response = await rolesAPI.getAll({ search: searchTerm });
      
      if (response.status === 200) {
        setState((prevState) => ({
          ...prevState,
          roles: response.data.roles.data || response.data.roles,
        }));
      }
    } catch (error: any) {
      toast.error("Failed to load roles");
      console.error("Error loading roles:", error);
    } finally {
      setState((prevState) => ({
        ...prevState,
        loadingRoles: false,
      }));
    }
  };

  useEffect(() => {
    handleLoadRoles();
  }, [refreshRoles, searchTerm]);

  const isSystemRole = (roleName: string) => {
    return ['admin', 'manager', 'cashier'].includes(roleName);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Roles ({state.roles.length})</h3>
      </div>
      <div className="card-body p-0">
        {state.loadingRoles ? (
          <div className="text-center p-4">
            <LoadingSpinner />
            <p className="mt-2">Loading roles...</p>
          </div>
        ) : state.roles.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted">No roles found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Display Name</th>
                  <th>Description</th>
                  <th>Users</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.roles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Shield size={16} color="var(--primary-color)" />
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {role.name}
                        </code>
                        {isSystemRole(role.name) && (
                          <span className="badge badge-secondary text-xs">System</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{role.display_name}</strong>
                    </td>
                    <td>
                      <span className="text-muted">
                        {role.description || 'No description'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{role.users_count || 0}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm">
                        {new Date(role.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onEditRole(role)}
                          title="Edit Role"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onDeleteRole(role)}
                          disabled={isSystemRole(role.name)}
                          title={isSystemRole(role.name) ? "Cannot delete system role" : "Delete Role"}
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
  );
};

export default RolesTable;