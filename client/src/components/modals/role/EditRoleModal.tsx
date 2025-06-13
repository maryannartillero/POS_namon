import React from "react";
import EditRoleForm from "../../forms/role/EditRoleForm";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface EditRoleModalProps {
  showModal: boolean;
  role: Role | null;
  onRoleUpdated: (message: string) => void;
  onClose: () => void;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  showModal,
  role,
  onRoleUpdated,
  onClose,
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Edit Role</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <EditRoleForm 
            role={role} 
            onRoleUpdated={onRoleUpdated} 
            onClose={onClose} 
          />
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;