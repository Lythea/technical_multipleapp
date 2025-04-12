import { useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import EditReview from "./modal/EditReview"; // Import the modal

interface FoodPhoto {
  id: number;
  name: string;
  imageUrl: string;
  uploadDate: string;
  review: {
    content: string;
    rating: number;
  } | null;
}

interface ReviewsProps {
  selectedPhotoId: number | null;
  photos: FoodPhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<FoodPhoto[]>>;
}

export default function Reviews({
  selectedPhotoId,
  photos,
  setPhotos,
}: ReviewsProps) {
  const [newReview, setNewReview] = useState<string>("");
  const [newReviewRating, setNewReviewRating] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId);

  if (!selectedPhoto) return <div>No photo selected</div>;

  const handleAddOrEditReview = (content: string, rating: number) => {
    const updatedPhotos = photos.map((photo) => {
      if (photo.id === selectedPhotoId) {
        return {
          ...photo,
          review: {
            content,
            rating,
          },
        };
      }
      return photo;
    });

    setPhotos(updatedPhotos);
    setNewReview("");
    setNewReviewRating(1);
    setIsEditing(false);
  };

  return (
    <div className="mt-4">
      {/* Display Existing Review */}
      {selectedPhoto.review ? (
        <div className="mt-4 flex justify-between items-center border-t pt-4">
          <div>
            <p className="font-semibold">Anonymous</p>
            <p>{selectedPhoto.review.content}</p>
            <p className="text-sm text-yellow-600">
              Rating: {selectedPhoto.review.rating} ⭐
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500"
            >
              <FaEdit />
            </button>
          </div>
        </div>
      ) : (
        <div>No review yet</div>
      )}

      {/* Edit Review Modal */}
      <EditReview
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        photoId={selectedPhotoId}
        photoReview={selectedPhoto.review}
        onSave={handleAddOrEditReview}
      />
    </div>
  );
}
