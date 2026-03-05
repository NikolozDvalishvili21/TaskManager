import { useState, useRef, useEffect } from "react";
import { Avatar } from "../../components";
import { TeamMember, Assignee } from "../../types";
import { classNames } from "../../lib/utils";
import styles from "./AssigneeSelect.module.css";

interface AssigneeSelectProps {
  value: Assignee | null;
  onChange: (assignee: Assignee | null) => void;
  users: TeamMember[];
  placeholder?: string;
}

export function AssigneeSelect({
  value,
  onChange,
  users,
  placeholder = "Assign to...",
}: AssigneeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (user: TeamMember) => {
    onChange({
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      email: user.email,
    });
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={styles.assigneeSelect} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <div className={styles.triggerContent}>
            <Avatar src={value.photoURL} name={value.displayName} size="xs" />
            <span className={styles.triggerName}>{value.displayName}</span>
          </div>
        ) : (
          <span className={styles.triggerPlaceholder}>{placeholder}</span>
        )}
        <svg
          className={classNames(
            styles.triggerArrow,
            isOpen && styles.triggerArrowOpen,
          )}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <input
            ref={searchInputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className={styles.optionsList}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.uid}
                  type="button"
                  className={classNames(
                    styles.option,
                    value?.uid === user.uid && styles.optionSelected,
                  )}
                  onClick={() => handleSelect(user)}
                >
                  <Avatar
                    src={user.photoURL}
                    name={user.displayName}
                    size="sm"
                  />
                  <div className={styles.optionDetails}>
                    <div className={styles.optionName}>{user.displayName}</div>
                    <div className={styles.optionEmail}>{user.email}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className={styles.noResults}>
                {search ? "No users found" : "No users yet"}
              </div>
            )}

            {value && (
              <button
                type="button"
                className={styles.clearOption}
                onClick={handleClear}
              >
                Remove assignee
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
