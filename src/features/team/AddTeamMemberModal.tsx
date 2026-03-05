import { useState } from "react";
import { Modal, Button, Input } from "../../components";
import { addTeamMember } from "./teamService";
import { useAuthStore } from "../auth/authStore";
import { useUIStore } from "../board/uiStore";
import { useTeamStore } from "./teamStore";
import { v4 as uuidv4 } from "uuid";
import styles from "./AddTeamMemberModal.module.css";

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTeamMemberModal({
  isOpen,
  onClose,
}: AddTeamMemberModalProps) {
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const addMember = useTeamStore((state) => state.addMember);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
  }>({});

  const resetForm = () => {
    setDisplayName("");
    setEmail("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) return;

    const newErrors: { displayName?: string; email?: string } = {};

    if (!displayName.trim()) {
      newErrors.displayName = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const memberId = uuidv4();
      const memberData = {
        uid: memberId,
        email: email.trim(),
        displayName: displayName.trim(),
        photoURL: null,
      };

      await addTeamMember(user.uid, memberData);
      addMember(memberData);

      addToast("Team member added successfully", "success");
      handleClose();
    } catch (error) {
      console.error("Failed to add team member:", error);
      addToast("Failed to add team member", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Team Member"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Add Member
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input
          label="Name"
          placeholder="Enter member name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          autoFocus
        />

        <div>
          <Input
            label="Email"
            type="email"
            placeholder="Enter member email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <p className={styles.hint}>
            This email is for identification. The member does not need to have
            an account.
          </p>
        </div>
      </div>
    </Modal>
  );
}
