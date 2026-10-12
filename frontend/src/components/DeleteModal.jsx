import { useEffect } from "react";

export default function DeleteModal({
  isOpen,
  title = "Confirm Deletion",
  itemTitle,
  message,
  confirmText = "Delete",
  onConfirm,
  onClose,
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="delete-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-dialog-top">
          <div className="delete-dialog-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <div className="delete-dialog-heading">
            <h3 id="delete-dialog-title">{title}</h3>
            <p className="delete-dialog-desc">
              {message ? (
                message
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="delete-highlight">{itemTitle}</span>? This action cannot be undone.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="delete-dialog-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? (
              <>
                <span className="spinner-inline" />
                Deleting…
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
