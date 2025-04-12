import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import EditReview from "./modal/EditReview";
import supabase from "@/lib/supabaseClient"; // adjust path as needed

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

interface ReviewSectionProps {
  selectedPokemonId: number;
  pokemons: PokemonReview[];
  setPokemons: React.Dispatch<React.SetStateAction<PokemonReview[]>>;
}

const ReviewSection = ({
  selectedPokemonId,
  pokemons,
  setPokemons,
}: ReviewSectionProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const selectedReview = pokemons.find(
    (review) => review.id === selectedPokemonId
  );

  if (!selectedReview) return <div>No review selected</div>;

  const handleAddOrEditReview = async (content: string, rating: number) => {
    console.log("Updating review with:");
    console.log("Content:", content);
    console.log("Rating:", rating);
    console.log("Pokemon ID:", selectedPokemonId);
    const { data, error } = await supabase
      .from("pokemon_review")
      .update({
        review_content: content,
        review_rating: rating,
      })
      .eq("id", selectedPokemonId)
      .select(); // <- returns the updated row

    if (error) {
      console.error("Error updating review:", error.message);
      return;
    }

    console.log("Updated row:", data);

    console.log(true);
    // Update local state after DB update
    const updatedPokemons = pokemons.map((review) => {
      if (review.id === selectedPokemonId) {
        return {
          ...review,
          review: {
            content,
            rating,
          },
        };
      }
      return review;
    });

    setPokemons(updatedPokemons);
    setIsEditing(false);
  };

  return (
    <div className="mt-4">
      {selectedReview.review ? (
        <div className="mt-4 flex justify-between items-center border-t pt-4">
          <div>
            <p className="font-semibold">Anonymous</p>
            <p>{selectedReview.review.content}</p>
            <p className="text-sm text-yellow-600">
              Rating: {selectedReview.review.rating} ⭐
            </p>
          </div>
          <button onClick={() => setIsEditing(true)} className="text-blue-500">
            <FaEdit />
          </button>
        </div>
      ) : (
        <div>No review yet</div>
      )}

      {isEditing && selectedReview && (
        <EditReview
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          pokemonId={selectedReview.id}
          pokemonReview={selectedReview.review}
          onSave={handleAddOrEditReview}
        />
      )}
    </div>
  );
};

export default ReviewSection;
