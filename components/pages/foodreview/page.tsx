"use client"; // Ensure this is a client component
import { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import Cookies from "js-cookie";
import supabase from "@/lib/supabaseClient"; // Import Supabase client
import ReviewSection from "./reviews"; // Import the ReviewSection component
import AddFood from "./modal/AddFood";
import EditFood from "./modal/EditFood";

// Define the FoodPhoto interface
interface FoodPhoto {
  id: number;
  name: string;
  imageUrl: string;
  uploadDate: string;
  review: {
    content: string;
    rating: number;
  } | null; // allow null if there's no review yet
}

export default function FoodReviewPage() {
  const [photos, setPhotos] = useState<FoodPhoto[]>([]); // Initialize as empty
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [editingPhoto, setEditingPhoto] = useState<FoodPhoto | null>(null);

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

  // Fetch the food reviews from Supabase when the component mounts or userId changes
  useEffect(() => {
    if (userId) {
      const fetchPhotos = async () => {
        try {
          const { data, error } = await supabase
            .from("food_review")
            .select(
              "id, name, image_url, upload_date, review_content, review_rating"
            )
            .eq("user_id", userId); // Filter by user_id

          if (error) {
            throw error;
          }

          const formattedPhotos =
            data?.map((photo: any) => ({
              id: photo.id,
              name: photo.name,
              imageUrl: photo.image_url,
              uploadDate: photo.upload_date,
              review: {
                content: photo.review_content,
                rating: photo.review_rating,
              },
            })) || [];

          setPhotos(formattedPhotos);
        } catch (error) {
          console.error("Error fetching food reviews:", error);
        }
      };

      fetchPhotos();
    }
  }, [userId]);

  useEffect(() => {
    const sortedPhotos = [...photos].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return (
        new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
      );
    });
    setPhotos(sortedPhotos);
  }, [sortBy]);

  const filteredPhotos = photos.filter((photo) =>
    photo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = (newPhoto: FoodPhoto) => {
    setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
  };

  const handleEditFood = (photo: FoodPhoto) => {
    setEditingPhoto(photo);
  };

  const handleUpdateFood = (updatedPhoto: FoodPhoto) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) =>
        photo.id === updatedPhoto.id ? updatedPhoto : photo
      )
    );
    setEditingPhoto(null);
  };

  const handleDeleteFood = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this food review?"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("food_review")
        .delete()
        .eq("id", id);
      if (error) {
        throw error;
      }

      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id));
    } catch (error) {
      console.error("Error deleting food review:", error);
      alert("Failed to delete food review. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold">Food Review</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add New Food Review
          </button>
        </div>

        <div className="flex justify-between items-center mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by photo name"
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
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="border rounded-xl shadow-md p-4 flex flex-col justify-between bg-white"
          >
            <div>
              <img
                src={photo.imageUrl}
                alt={photo.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800">
                {photo.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                Uploaded: {photo.uploadDate}
              </p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() =>
                  setSelectedPhoto((prev) =>
                    prev === photo.id ? null : photo.id
                  )
                }
                className="text-sm text-blue-600 hover:underline"
              >
                {selectedPhoto === photo.id ? "Hide Reviews" : "View Reviews"}
              </button>

              <div className="flex space-x-3 text-xl">
                <button
                  onClick={() => handleEditFood(photo)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteFood(photo.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div
              className={`transition-all duration-300 ease-in-out mt-4 ${
                selectedPhoto === photo.id
                  ? "max-h-full"
                  : "max-h-0 overflow-hidden"
              }`}
            >
              {selectedPhoto === photo.id && (
                <ReviewSection
                  selectedPhotoId={selectedPhoto}
                  setPhotos={setPhotos}
                  photos={photos}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <AddFood
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addFoodReview={handleAddFood}
        userId={userId!}
      />
      {editingPhoto && (
        <EditFood
          isOpen={!!editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onUpdate={handleUpdateFood}
          photo={editingPhoto}
          userId={userId!}
        />
      )}
    </div>
  );
}
