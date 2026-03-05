import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Dropdown.module.css";
import { classNames } from "../../lib/utils";

interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  alignRight?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  alignRight = false,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={classNames(styles.dropdown, className)} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <svg
          className={classNames(styles.chevron, isOpen && styles.chevronOpen)}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={classNames(styles.menu, alignRight && styles.menuRight)}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                className={classNames(
                  styles.item,
                  option.value === value && styles.itemActive,
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                type="button"
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
