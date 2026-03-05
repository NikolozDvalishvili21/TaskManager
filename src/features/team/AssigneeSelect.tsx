import { useState, useRef, useEffect } from "react";
import { Avatar } from "../../components";
import { TeamMember, Assignee } from "../../types";
import { classNames } from "../../lib/utils";
import styles from "./AssigneeSelect.module.css";

interface AssigneeSelectProps {
  value: Assignee | null;
  onChange: (assignee: Assignee | null) => void;
  teamMembers: TeamMember[];
  placeholder?: string;
  onAddMember?: () => void;
}

export function AssigneeSelect({
  value,
  onChange,
  teamMembers,
  placeholder = "Assign to...",
  onAddMember,
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

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.displayName.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (member: TeamMember) => {
    onChange({
      uid: member.uid,
      displayName: member.displayName,
      photoURL: member.photoURL,
      email: member.email,
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
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className={styles.optionsList}>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <button
                  key={member.uid}
                  type="button"
                  className={classNames(
                    styles.option,
                    value?.uid === member.uid && styles.optionSelected,
                  )}
                  onClick={() => handleSelect(member)}
                >
                  <Avatar
                    src={member.photoURL}
                    name={member.displayName}
                    size="sm"
                  />
                  <div className={styles.optionDetails}>
                    <div className={styles.optionName}>
                      {member.displayName}
                    </div>
                    <div className={styles.optionEmail}>{member.email}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className={styles.noResults}>
                {search ? "No members found" : "No team members yet"}
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

          {onAddMember && (
            <div className={styles.addMemberSection}>
              <button
                type="button"
                className={styles.addMemberButton}
                onClick={() => {
                  setIsOpen(false);
                  onAddMember();
                }}
              >
                <svg
                  className={styles.addMemberIcon}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                </svg>
                Add team member
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
