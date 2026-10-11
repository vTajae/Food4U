import React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface ModalProps {
  title: string; // Title for the modal
  description: string; // Description text for the modal
  onConfirm: () => void; // Function to call when "Yes" is clicked
  onCancel: () => void; // Function to call when "No" is clicked
}

// Confirmation dialog: shown while mounted. Escape or clicking outside counts as "No".
const Modal: React.FC<ModalProps> = ({ title, description, onConfirm, onCancel }) => {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            No
          </Button>
          <Button onClick={onConfirm}>Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
