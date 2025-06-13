import React from "react";
import AddRoleForm from "../../forms/role/AddRoleForm";

interface AddRoleModalProps {
  showModal: boolean;
  onRoleAdded: (message: string) => void;
  onClose: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
  showModal,
  onRoleAdded,
  onClose,
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Add New Role</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <AddRoleForm onRoleAdded={onRoleAdded} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default AddRoleModal;