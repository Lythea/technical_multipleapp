// components/pages/pokemonreview/modal/EditReview.tsx
import { useState, useEffect } from "react";

interface EditReviewProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonId: number | null;
  pokemonReview: { content: string; rating: number } | null;
  onSave: (content: string, rating: number) => void;
}

const EditReview = ({
  isOpen,
  onClose,
  pokemonId,
  pokemonReview,
  onSave,
}: EditReviewProps) => {
  const [newReview, setNewReview] = useState<string>("");
  const [newReviewRating, setNewReviewRating] = useState<number>(1);

  useEffect(() => {
    if (pokemonReview) {
      setNewReview(pokemonReview.content);
      setNewReviewRating(pokemonReview.rating);
    }
  }, [pokemonReview]);

  const handleSave = () => {
    onSave(newReview, newReviewRating);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Pokémon Review</h2>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write your review here..."
          className="w-full p-2 border rounded mb-2"
        />
        <div className="mb-2">
          <label className="mr-2">Rating:</label>
          <select
            value={newReviewRating}
            onChange={(e) => setNewReviewRating(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditReview;
