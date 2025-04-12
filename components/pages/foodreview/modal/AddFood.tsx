import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Cookies from "js-cookie"; // Import js-cookie
import supabase from "@/lib/supabaseClient"; // Import the supabase client

interface FoodPhoto {
  id: number;
  user_id: number;
  name: string;
  imageUrl: string;
  uploadDate: string;
  review: {
    content: string;
    rating: number;
  } | null; // Allow null if there's no review yet
}

interface AddFoodProps {
  isOpen: boolean;
  onClose: () => void;
  addFoodReview: (newFoodReview: FoodPhoto) => void;
  userId: string;
  foodPhotoToEdit?: FoodPhoto;
}

export default function AddFood({
  isOpen,
  onClose,
  addFoodReview,
  foodPhotoToEdit,
}: AddFoodProps) {
  const [name, setName] = useState(foodPhotoToEdit?.name || "");
  const [uploadDate, setUploadDate] = useState(
    foodPhotoToEdit?.uploadDate || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [reviewContent, setReviewContent] = useState(
    foodPhotoToEdit?.review?.content || ""
  );
  const [reviewRating, setReviewRating] = useState<number>(
    foodPhotoToEdit?.review?.rating || 5
  );
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Store userId here

  useEffect(() => {
    const storedUserId = Cookies.get("userId"); // Get userId from cookies
    if (storedUserId) {
      setUserId(storedUserId);
    }

    if (foodPhotoToEdit) {
      setName(foodPhotoToEdit.name);
      setUploadDate(foodPhotoToEdit.uploadDate);
      setReviewContent(foodPhotoToEdit.review?.content || "");
      setReviewRating(foodPhotoToEdit.review?.rating || 5);
    }
  }, [foodPhotoToEdit]);

  const handleSubmit = async () => {
    if (!name || !uploadDate || !file) return;

    setIsUploading(true); // UI update

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not authenticated.");
        setIsUploading(false);
        return;
      }

      const filePath = `7psvue_${user.id}/${file.name}`;
      let fileUrl = "";

      // Try uploading the file
      const { error: uploadError } = await supabase.storage
        .from("foodreview")
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message === "The resource already exists") {
          // File exists, fetch public URL instead of throwing error
          const { data: existingUrlData } = supabase.storage
            .from("foodreview")
            .getPublicUrl(filePath);

          if (!existingUrlData?.publicUrl) {
            console.error("Failed to get existing file URL.");
            setIsUploading(false);
            return;
          }

          fileUrl = existingUrlData.publicUrl;
        } else {
          // Other upload error
          console.error("Failed to upload file:", uploadError.message);
          setIsUploading(false);
          return;
        }
      } else {
        // Upload successful, get public URL
        const { data: publicUrlData } = supabase.storage
          .from("foodreview")
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          console.error("Failed to get public URL.");
          setIsUploading(false);
          return;
        }

        fileUrl = publicUrlData.publicUrl;
      }

      // Insert into table
      const { data: insertedData, error: insertError } = await supabase
        .from("food_review")
        .insert([
          {
            user_id: user.id,
            name,
            image_url: fileUrl,
            upload_date: uploadDate,
            review_content: reviewContent,
            review_rating: reviewRating,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newFoodPhoto: FoodPhoto = {
        id: insertedData.id,
        user_id: insertedData.user_id,
        name: insertedData.name,
        imageUrl: insertedData.image_url,
        uploadDate: insertedData.upload_date,
        review: {
          content: insertedData.review_content,
          rating: insertedData.review_rating,
        },
      };

      addFoodReview(newFoodPhoto);

      // Reset form
      setName("");
      setUploadDate("");
      setReviewContent("");
      setReviewRating(5);
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Error submitting food review:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {foodPhotoToEdit ? "Edit Food Review" : "Add New Food Review"}
            </Dialog.Title>
            <button onClick={onClose}>
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Food Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <div className="mt-4">
              <h2 className="font-medium mb-2">Add Review</h2>
              <div className="grid grid-cols-1 gap-2">
                <textarea
                  placeholder="Review Content"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="border px-3 py-2 rounded w-1/4"
                />
              </div>
            </div>

            <div className="mt-4">
              <input
                type="file"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                accept="image/*"
                className="border px-3 py-2 rounded"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className={`px-4 py-2 rounded text-white ${
                isUploading ? "bg-gray-400" : "bg-green-500"
              }`}
            >
              {isUploading
                ? "Uploading..."
                : foodPhotoToEdit
                ? "Update Food Review"
                : "Submit Food Review"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
