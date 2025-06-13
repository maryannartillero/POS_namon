import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { rolesAPI } from "../../../services/api";
import LoadingSpinner from "../../ui/LoadingSpinner";
import toast from "react-hot-toast";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface RoleFieldErrors {
  name?: string[];
  display_name?: string[];
  description?: string[];
}

interface EditRoleFormProps {
  role: Role | null;
  onRoleUpdated: (message: string) => void;
  onClose: () => void;
}

const EditRoleForm: React.FC<EditRoleFormProps> = ({ role, onRoleUpdated, onClose }) => {
  const [state, setState] = useState({
    loadingUpdate: false,
    name: "",
    display_name: "",
    description: "",
    errors: {} as RoleFieldErrors,
  });

  useEffect(() => {
    if (role) {
      setState((prevState) => ({
        ...prevState,
        name: role.name,
        display_name: role.display_name,
        description: role.description || "",
      }));
    }
  }, [role]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
      errors: {
        ...prevState.errors,
        [name]: undefined
      }
    }));
  };

  const handleUpdateRole = async (e: FormEvent) => {
    e.preventDefault();

    if (!role) return;

    setState((prevState) => ({
      ...prevState,
      loadingUpdate: true,
      errors: {}
    }));

    try {
      const response = await rolesAPI.update(role.id, {
        name: state.name,
        display_name: state.display_name,
        description: state.description
      });

      if (response.status === 200) {
        setState((prevState) => ({
          ...prevState,
          errors: {} as RoleFieldErrors,
        }));

        onRoleUpdated(response.data.message);
        toast.success("Role updated successfully!");
        onClose();
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setState((prevState) => ({
          ...prevState,
          errors: error.response.data.errors,
        }));
      } else {
        toast.error(error.response?.data?.message || "Failed to update role");
      }
    } finally {
      setState((prevState) => ({
        ...prevState,
        loadingUpdate: false,
      }));
    }
  };

  if (!role) return null;

  return (
    <form onSubmit={handleUpdateRole}>
      <div className="form-group">
        <label className="form-label">Role Name *</label>
        <input
          type="text"
          className={`form-input ${state.errors.name ? "error" : ""}`}
          name="name"
          value={state.name}
          onChange={handleInputChange}
          placeholder="e.g., supervisor"
          required
          disabled={['admin', 'manager', 'cashier'].includes(role.name)}
        />
        <small className="text-muted">Use lowercase letters and underscores only</small>
        {state.errors.name && (
          <div className="form-error">{state.errors.name[0]}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Display Name *</label>
        <input
          type="text"
          className={`form-input ${state.errors.display_name ? "error" : ""}`}
          name="display_name"
          value={state.display_name}
          onChange={handleInputChange}
          placeholder="e.g., Supervisor"
          required
        />
        {state.errors.display_name && (
          <div className="form-error">{state.errors.display_name[0]}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className={`form-textarea ${state.errors.description ? "error" : ""}`}
          name="description"
          value={state.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="Describe the role's responsibilities and permissions"
        />
        {state.errors.description && (
          <div className="form-error">{state.errors.description[0]}</div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={state.loadingUpdate}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={state.loadingUpdate}
        >
          {state.loadingUpdate ? (
            <>
              <LoadingSpinner size="sm" />
              Updating...
            </>
          ) : (
            "Update Role"
          )}
        </button>
      </div>
    </form>
  );
};

export default EditRoleForm;