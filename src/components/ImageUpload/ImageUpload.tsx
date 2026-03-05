import { useState, useRef, useCallback } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../lib/firebase";
import { useAuthStore } from "../../features/auth/authStore";
import { useUIStore } from "../../features/board/uiStore";
import { Spinner } from "../Spinner/Spinner";
import styles from "./ImageUpload.module.css";
import { classNames } from "../../lib/utils";

interface ImageUploadProps {
  taskId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  onImageClick?: (url: string) => void;
}

export function ImageUpload({
  taskId,
  images,
  onImagesChange,
  onImageClick,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);

  const uploadFiles = useCallback(
    async (files: FileList) => {
      if (!user) return;

      const validFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          addToast(`${file.name} is not an image`, "error");
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          addToast(`${file.name} is too large (max 5MB)`, "error");
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setUploading(true);

      try {
        const uploadPromises = validFiles.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const storageRef = ref(
            storage,
            `users/${user.uid}/tasks/${taskId}/${fileName}`,
          );
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        });

        const newUrls = await Promise.all(uploadPromises);
        onImagesChange([...images, ...newUrls]);
        addToast(`${validFiles.length} image(s) uploaded`, "success");
      } catch (error) {
        console.error("Upload error:", error);
        addToast("Failed to upload images", "error");
      } finally {
        setUploading(false);
      }
    },
    [user, taskId, images, onImagesChange, addToast],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFiles(e.target.files);
        e.target.value = "";
      }
    },
    [uploadFiles],
  );

  const handleDelete = useCallback(
    async (url: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) return;

      try {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
        onImagesChange(images.filter((img) => img !== url));
        addToast("Image deleted", "success");
      } catch (error) {
        console.error("Delete error:", error);
        addToast("Failed to delete image", "error");
      }
    },
    [user, images, onImagesChange, addToast],
  );

  return (
    <div className={styles.uploadContainer}>
      <div
        className={classNames(
          styles.dropzone,
          isDragging && styles.dropzoneActive,
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <Spinner size="md" />
        ) : (
          <>
            <svg
              className={styles.dropzoneIcon}
              viewBox="0 0 40 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="8" width="32" height="24" rx="2" />
              <circle cx="14" cy="18" r="3" />
              <path d="M36 28l-8-8-12 12M4 32l10-10 6 6" />
            </svg>
            <div className={styles.dropzoneText}>
              Drop images here or click to upload
            </div>
            <div className={styles.dropzoneHint}>PNG, JPG up to 5MB</div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.hiddenInput}
        onChange={handleFileSelect}
      />

      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((url) => (
            <div
              key={url}
              className={styles.imageItem}
              onClick={() => onImageClick?.(url)}
            >
              <img src={url} alt="Task attachment" />
              <button
                className={styles.deleteButton}
                onClick={(e) => handleDelete(url, e)}
                aria-label="Delete image"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 3L3 9M3 3l6 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
