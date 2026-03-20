"use client";

import { CsvUploader } from "./CsvUploader";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export function UploadModal({
  open,
  onClose,
  onUploadComplete,
}: UploadModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-lg rounded-lg bg-background p-4 shadow-lg">
        <CsvUploader
          onUploadComplete={() => {
            onUploadComplete?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
