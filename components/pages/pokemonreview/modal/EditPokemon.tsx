"use client";
import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";

interface EditPokemonProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedReview: PokemonReview) => void;
  review: PokemonReview;
  userId: string | null;
}

interface PokemonReview {
  id: number;
  name: string;
  imageUrl: string;
  uploadDate: string;
  review: {
    content: string;
    rating: number;
  } | null;
}

export default function EditPokemon({
  isOpen,
  onClose,
  onUpdate,
  review,
  userId,
}: EditPokemonProps) {
  const [name, setName] = useState(review.name);
  const [imageUrl, setImageUrl] = useState(review.imageUrl);
  const [useNewImage, setUseNewImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reviewContent, setReviewContent] = useState(
    review.review?.content || ""
  );
  const [reviewRating, setReviewRating] = useState(review.review?.rating || 0);

  useEffect(() => {
    setName(review.name);
    setImageUrl(review.imageUrl);
    setUseNewImage(false);
    setFile(null);
    setReviewContent(review.review?.content || "");
    setReviewRating(review.review?.rating || 0);
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("User not logged in.");
      return;
    }

    setUploading(true);

    let finalImageUrl = imageUrl;

    if (useNewImage && file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `1xme1nv_${userId}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pokemonreview")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        alert("Failed to upload new image.");
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("pokemonreview")
        .getPublicUrl(fileName);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        alert("Failed to retrieve image URL.");
        setUploading(false);
        return;
      }

      finalImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("pokemon_review")
      .update({
        name,
        image_url: finalImageUrl,
        review_content: reviewContent,
        review_rating: reviewRating,
      })
      .eq("id", review.id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating pokemon review:", error);
      alert("Failed to update. Please try again.");
      setUploading(false);
      return;
    }

    const updatedReview: PokemonReview = {
      ...review,
      name,
      imageUrl: finalImageUrl,
      review: {
        content: reviewContent,
        rating: reviewRating,
      },
    };

    onUpdate(updatedReview);
    onClose();
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Edit Pokémon Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Image:</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={useNewImage}
                onChange={() => setUseNewImage(!useNewImage)}
              />
              <span className="text-sm">Change Pokémon image</span>
            </div>
            {useNewImage ? (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
                className="w-full p-2 border rounded"
              />
            ) : (
              <p className="text-sm text-gray-600 break-all">{imageUrl}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Review:</label>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Rating (0–5):</label>
            <input
              type="number"
              min={0}
              max={5}
              value={reviewRating}
              onChange={(e) => setReviewRating(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {uploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
