"use client";

import React, { useState } from "react";
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
  // There is no DialogTrigger, so remember what had focus when the modal opened
  // and return focus there when it closes (Radix would otherwise drop it on <body>).
  const [returnFocusTo] = useState(() =>
    typeof document === "undefined" ? null : (document.activeElement as HTMLElement | null)
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo?.focus();
        }}
      >
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
