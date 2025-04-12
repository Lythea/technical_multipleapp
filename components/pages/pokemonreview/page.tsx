"use client"; // Ensure this is a client component
import { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import Cookies from "js-cookie";
import supabase from "@/lib/supabaseClient"; // Import Supabase client
import ReviewSection from "./reviews"; // Import the ReviewSection component
import AddPokemon from "./modal/AddPokemon";
import EditPokemon from "./modal/EditPokemon";

// Define the PokemonReview interface
interface PokemonReview {
  id: number;
  name: string; // Changed from pokemonName to name
  imageUrl: string;
  uploadDate: string;
  review: {
    content: string;
    rating: number;
  } | null; // allow null if there's no review yet
}

export default function PokemonReviewPage() {
  const [reviews, setReviews] = useState<PokemonReview[]>([]); // Initialize as empty
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [editingReview, setEditingReview] = useState<PokemonReview | null>(
    null
  );

  // Retrieve userId from cookies
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      const storedUserId = Cookies.get("userId");
      if (storedUserId) {
        setUserId(storedUserId); // Set userId if it exists in cookies
      }
    }
  }, []);

  // Fetch the pokemon reviews from Supabase when the component mounts or userId changes
  useEffect(() => {
    if (userId) {
      const fetchReviews = async () => {
        try {
          const { data, error } = await supabase
            .from("pokemon_review")
            .select(
              "id, name, image_url, upload_date, review_content, review_rating"
            )
            .eq("user_id", userId); // Filter by user_id

          if (error) {
            throw error;
          }

          const formattedReviews =
            data?.map((review: any) => ({
              id: review.id,
              name: review.name, // Changed from pokemon_name to name
              imageUrl: review.image_url,
              uploadDate: review.upload_date,
              review: {
                content: review.review_content,
                rating: review.review_rating,
              },
            })) || [];

          setReviews(formattedReviews);
        } catch (error) {
          console.error("Error fetching pokemon reviews:", error);
        }
      };

      fetchReviews();
    }
  }, [userId]);

  useEffect(() => {
    const sortedReviews = [...reviews].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name); // Changed from pokemonName to name
      }
      return (
        new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
      );
    });
    setReviews(sortedReviews);
  }, [sortBy]);

  const filteredReviews = reviews.filter(
    (review) => review.name.toLowerCase().includes(searchQuery.toLowerCase()) // Changed from pokemonName to name
  );

  const handleAddPokemon = (newReview: PokemonReview) => {
    setReviews((prevReviews) => [...prevReviews, newReview]);
  };

  const handleEditPokemon = (review: PokemonReview) => {
    setEditingReview(review);
  };

  const handleUpdatePokemon = (updatedReview: PokemonReview) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === updatedReview.id ? updatedReview : review
      )
    );
    setEditingReview(null);
  };

  const handleDeletePokemon = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this pokemon review?"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("pokemon_review")
        .delete()
        .eq("id", id);
      if (error) {
        throw error;
      }

      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== id)
      );
    } catch (error) {
      console.error("Error deleting pokemon review:", error);
      alert("Failed to delete pokemon review. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Pokemon Review</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add New Pokemon Review
          </button>
        </div>

        <div className="flex justify-between items-center mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Pokemon name"
            className="p-2 border rounded"
          />
          <div>
            <button
              onClick={() => setSortBy("name")}
              className="bg-gray-200 px-4 py-2 rounded mr-2"
            >
              Sort by Name
            </button>
            <button
              onClick={() => setSortBy("date")}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Sort by Upload Date
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="border rounded-xl shadow-md p-4 flex flex-col justify-between bg-white"
          >
            <div>
              <img
                src={review.imageUrl}
                alt={review.name} // Changed from pokemonName to name
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                {review.name} {/* Changed from pokemonName to name */}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                Uploaded: {review.uploadDate}
              </p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() =>
                  setSelectedReview((prev) =>
                    prev === review.id ? null : review.id
                  )
                }
                className="text-sm text-blue-600 hover:underline"
              >
                {selectedReview === review.id ? "Hide Reviews" : "View Reviews"}
              </button>

              <div className="flex space-x-3 text-xl">
                <button
                  onClick={() => handleEditPokemon(review)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeletePokemon(review.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div
              className={`transition-all duration-300 ease-in-out mt-4 ${
                selectedReview === review.id
                  ? "max-h-full"
                  : "max-h-0 overflow-hidden"
              }`}
            >
              {selectedReview === review.id && (
                <ReviewSection
                  selectedPokemonId={selectedReview} // Pass selectedReview as selectedPokemonId
                  pokemons={reviews} // Pass reviews as pokemons
                  setPokemons={setReviews} // Pass setReviews to update the list
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <AddPokemon
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addPokemonReview={handleAddPokemon}
        userId={userId!}
      />
      {editingReview && (
        <EditPokemon
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          onUpdate={handleUpdatePokemon}
          review={editingReview}
          userId={userId!}
        />
      )}
    </div>
  );
}
