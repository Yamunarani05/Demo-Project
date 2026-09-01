import { useEffect, useRef, useState } from "react";
import { QuotationPublicAPI } from "../../api/quotationPublic.api";

interface Props {
  token: string;
  onClose: () => void;
}

const RaiseIssueModal = ({ token, onClose }: Props) => {
  const [issueTitle, setIssueTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  /* ===== Lock scroll + ESC close ===== */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  /* ===== Click outside ===== */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  /* ===== Submit ===== */
  const submit = async () => {
    if (!issueTitle.trim()) {
      setError("Issue title is required");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await QuotationPublicAPI.raiseIssue(token, {
        issueTitle: issueTitle.trim(),
        description: description.trim(),
      });

      setSuccess(true);
    } catch {
      setError("Failed to submit issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ===== Success UI ===== */
  if (success) {
    return (
      <Modal onBackdropClick={handleBackdropClick}>
        <div ref={modalRef}>
          <h2 className="text-lg font-semibold mb-2 text-green-700">
            Issue Submitted
          </h2>
          <p className="text-sm text-gray-600">
            Your issue has been sent to our team. We’ll get back to you shortly.
          </p>

          <button
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-xl font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  /* ===== Form UI ===== */
  return (
    <Modal onBackdropClick={handleBackdropClick}>
      <div ref={modalRef}>
        <h2 className="text-lg font-semibold mb-4">Raise an Issue</h2>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <input
          className="border rounded-xl px-3 py-2 w-full mb-2"
          placeholder="Issue title *"
          value={issueTitle}
          onChange={(e) => setIssueTitle(e.target.value)}
          disabled={loading}
        />

        <textarea
          className="border rounded-xl px-3 py-2 w-full mb-4 min-h-[90px]"
          placeholder="Describe your issue (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border py-2 rounded-xl"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RaiseIssueModal;

/* ================= Modal Wrapper ================= */

const Modal = ({
  children,
  onBackdropClick,
}: {
  children: React.ReactNode;
  onBackdropClick: (e: React.MouseEvent) => void;
}) => (
  <div
    onClick={onBackdropClick}
    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-3"
  >
    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg animate-fadeIn">
      {children}
    </div>
  </div>
);
