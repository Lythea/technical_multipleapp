// components/pages/markdown/modal/EditNotes.tsx
import { useState } from "react";

type EditNotesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  editingId: number | null;
  existingContent: string;
  onSave: (id: number, content: string) => void;
};

const EditNotesModal = ({
  isOpen,
  onClose,
  userId,
  editingId,
  existingContent,
  onSave,
}: EditNotesModalProps) => {
  const [noteContent, setNoteContent] = useState(existingContent);

  const handleSave = () => {
    if (editingId !== null && noteContent.trim() !== "") {
      onSave(editingId, noteContent); // Call onSave with the note content
      onClose(); // Close the modal after saving
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Edit Note</h2>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="w-full h-40 p-2 border rounded mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-1 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default EditNotesModal;
