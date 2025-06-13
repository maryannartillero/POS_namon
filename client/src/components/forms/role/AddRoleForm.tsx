import React, { ChangeEvent, FormEvent, useState } from "react";
import { rolesAPI } from "../../../services/api";
import LoadingSpinner from "../../ui/LoadingSpinner";
import toast from "react-hot-toast";

interface RoleFieldErrors {
  name?: string[];
  display_name?: string[];
  description?: string[];
}

interface AddRoleFormProps {
  onRoleAdded: (message: string) => void;
  onClose: () => void;
}

const AddRoleForm: React.FC<AddRoleFormProps> = ({ onRoleAdded, onClose }) => {
  const [state, setState] = useState({
    loadingStore: false,
    name: "",
    display_name: "",
    description: "",
    errors: {} as RoleFieldErrors,
  });

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

  const handleStoreRole = async (e: FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({
      ...prevState,
      loadingStore: true,
      errors: {}
    }));

    try {
      const response = await rolesAPI.create({
        name: state.name,
        display_name: state.display_name,
        description: state.description
      });

      if (response.status === 201) {
        setState((prevState) => ({
          ...prevState,
          name: "",
          display_name: "",
          description: "",
          errors: {} as RoleFieldErrors,
        }));

        onRoleAdded(response.data.message);
        toast.success("Role created successfully!");
        onClose();
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setState((prevState) => ({
          ...prevState,
          errors: error.response.data.errors,
        }));
      } else {
        toast.error(error.response?.data?.message || "Failed to create role");
      }
    } finally {
      setState((prevState) => ({
        ...prevState,
        loadingStore: false,
      }));
    }
  };

  return (
    <form onSubmit={handleStoreRole}>
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
          disabled={state.loadingStore}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={state.loadingStore}
        >
          {state.loadingStore ? (
            <>
              <LoadingSpinner size="sm" />
              Creating...
            </>
          ) : (
            "Create Role"
          )}
        </button>
      </div>
    </form>
  );
};

export default AddRoleForm;