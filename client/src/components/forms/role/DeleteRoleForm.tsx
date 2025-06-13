import React, { FormEvent, useState } from "react";
import { rolesAPI } from "../../../services/api";
import LoadingSpinner from "../../ui/LoadingSpinner";
import toast from "react-hot-toast";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface DeleteRoleFormProps {
  role: Role | null;
  onRoleDeleted: (message: string) => void;
  onClose: () => void;
}

const DeleteRoleForm: React.FC<DeleteRoleFormProps> = ({ role, onRoleDeleted, onClose }) => {
  const [loadingDestroy, setLoadingDestroy] = useState(false);

  const handleDestroyRole = async (e: FormEvent) => {
    e.preventDefault();

    if (!role) return;

    setLoadingDestroy(true);

    try {
      const response = await rolesAPI.delete(role.id);

      if (response.status === 200) {
        onRoleDeleted(response.data.message);
        toast.success("Role deleted successfully!");
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete role");
    } finally {
      setLoadingDestroy(false);
    }
  };

  if (!role) return null;

  const isSystemRole = ['admin', 'manager', 'cashier'].includes(role.name);

  return (
    <form onSubmit={handleDestroyRole}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Are you sure you want to delete this role?</h3>
        
        {isSystemRole && (
          <div className="alert alert-warning mb-4">
            <strong>Warning:</strong> This is a system role and cannot be deleted.
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Role Name</label>
              <input
                type="text"
                className="form-input"
                value={role.name}
                readOnly
              />
            </div>
            <div>
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                value={role.display_name}
                readOnly
              />
            </div>
          </div>
          
          {role.description && (
            <div className="mt-4">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={role.description}
                rows={3}
                readOnly
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loadingDestroy}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-danger"
          disabled={loadingDestroy || isSystemRole}
        >
          {loadingDestroy ? (
            <>
              <LoadingSpinner size="sm" />
              Deleting...
            </>
          ) : (
            "Delete Role"
          )}
        </button>
      </div>
    </form>
  );
};

export default DeleteRoleForm;