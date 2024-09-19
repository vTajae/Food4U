import React from 'react';

interface ModalProps {
  title: string; // Title for the modal
  description: string; // Description text for the modal
  onConfirm: () => void; // Function to call when "Yes" is clicked
  onCancel: () => void; // Function to call when "No" is clicked
}

const Modal: React.FC<ModalProps> = ({ title, description, onConfirm, onCancel }) => {
  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h2>{title}</h2>
        <p>{description}</p>
        <div style={modalActionsStyle}>
          <button onClick={onConfirm} style={confirmButtonStyle}>
            Yes
          </button>
          <button onClick={onCancel} style={cancelButtonStyle}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

// Styling for the modal background
const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

// Styling for the modal content
const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
};

// Styling for the action buttons container
const modalActionsStyle: React.CSSProperties = {
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'space-between',
};

// Styling for the confirm button
const confirmButtonStyle: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

// Styling for the cancel button
const cancelButtonStyle: React.CSSProperties = {
  backgroundColor: '#f44336',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default Modal;
