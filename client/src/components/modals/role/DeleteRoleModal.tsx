import React from "react";
import DeleteRoleForm from "../../forms/role/DeleteRoleForm";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface DeleteRoleModalProps {
  showModal: boolean;
  role: Role | null;
  onRoleDeleted: (message: string) => void;
  onClose: () => void;
}

const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({
  showModal,
  role,
  onRoleDeleted,
  onClose,
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Delete Role</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <DeleteRoleForm 
            role={role} 
            onRoleDeleted={onRoleDeleted} 
            onClose={onClose} 
          />
        </div>
      </div>
    </div>
  );
};

export default DeleteRoleModal;