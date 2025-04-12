import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Cookies from "js-cookie"; // Import js-cookie
import supabase from "@/lib/supabaseClient"; // Import the supabase client

interface PokemonReview {
  id: number;
  user_id: number;
  name: string;
  imageUrl: string;
  uploadDate: string;
  review: {
    content: string;
    rating: number;
  } | null;
}

interface AddPokemonReviewProps {
  isOpen: boolean;
  onClose: () => void;
  addPokemonReview: (newReview: PokemonReview) => void;
  userId: string;
  pokemonReviewToEdit?: PokemonReview;
}

export default function AddPokemonReview({
  isOpen,
  onClose,
  addPokemonReview,
  pokemonReviewToEdit,
}: AddPokemonReviewProps) {
  const [name, setName] = useState(pokemonReviewToEdit?.name || "");
  const [uploadDate, setUploadDate] = useState(
    pokemonReviewToEdit?.uploadDate || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [reviewContent, setReviewContent] = useState(
    pokemonReviewToEdit?.review?.content || ""
  );
  const [reviewRating, setReviewRating] = useState<number>(
    pokemonReviewToEdit?.review?.rating || 5
  );
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = Cookies.get("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    if (pokemonReviewToEdit) {
      setName(pokemonReviewToEdit.name);
      setUploadDate(pokemonReviewToEdit.uploadDate);
      setReviewContent(pokemonReviewToEdit.review?.content || "");
      setReviewRating(pokemonReviewToEdit.review?.rating || 5);
    }
  }, [pokemonReviewToEdit]);

  const handleSubmit = async () => {
    if (!name || !uploadDate || !file) return;

    setIsUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User not authenticated.");
        setIsUploading(false);
        return;
      }

      // Ensure the user is authorized to upload a review
      if (user.id !== userId) {
        console.error("User does not have permission to submit review.");
        setIsUploading(false);
        return;
      }

      // Define the file path based on the user's ID
      const filePath = `7psvue_${user.id}/${file.name}`;
      let fileUrl = "";
      const { error: uploadError } = await supabase.storage
        .from("foodreview")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        if (uploadError.message === "The resource already exists") {
          const { data: existingUrlData } = await supabase.storage
            .from("foodreview")
            .getPublicUrl(filePath);

          if (!existingUrlData?.publicUrl) {
            console.error("Failed to get existing file URL.");
            setIsUploading(false);
            return;
          }

          fileUrl = existingUrlData.publicUrl;
        } else {
          console.error("Failed to upload file:", uploadError.message);
          setIsUploading(false);
          return;
        }
      } else {
        const { data: publicUrlData } = await supabase.storage
          .from("foodreview")
          .getPublicUrl(filePath);

        if (!publicUrlData?.publicUrl) {
          console.error("Failed to get public URL.");
          setIsUploading(false);
          return;
        }

        fileUrl = publicUrlData.publicUrl;
      }

      const { data: insertedData, error: insertError } = await supabase
        .from("pokemon_review")
        .insert([
          {
            user_id: user.id, // Ensure it's passed as a string
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

      const newPokemonReview = {
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

      addPokemonReview(newPokemonReview);

      setName("");
      setUploadDate("");
      setReviewContent("");
      setReviewRating(5);
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Error submitting pokemon review:", error);
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
              {pokemonReviewToEdit
                ? "Edit Pokemon Review"
                : "Add New Pokemon Review"}
            </Dialog.Title>
            <button onClick={onClose}>
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Pokemon Name"
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
                : pokemonReviewToEdit
                ? "Update Pokemon Review"
                : "Submit Pokemon Review"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
