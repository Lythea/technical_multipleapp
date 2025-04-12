"use client"; // Mark the file as a client component

import { useParams } from "next/navigation"; // Correct import for accessing params
import FoodReview from "@/components/pages/foodreview/page"; // Import the FoodReview component
import PokemonReview from "@/components/pages/pokemonreview/page"; // Import the PokemonReview component
import Markdown from "@/components/pages/markdown/page"; // Import the Markdown component
import Cookies from "js-cookie"; // Import js-cookie

export default function DynamicPage() {
  const params = useParams(); // Get the dynamic parameters
  const slug = params?.pages; // Extract the slug from params

  const userId = Cookies.get("userId"); // Get the userId from cookies

  console.log(slug, params.pages); // Debugging to check the values
  console.log("User ID from cookies:", userId); // Debugging to check the userId

  // Check if userId is not available
  if (!userId) {
    return (
      <div className="p-4 text-center">
        <h2>No user found</h2>
      </div>
    );
  }

  return (
    <div className="p-4">
      {slug === "foodreview" && <FoodReview />}
      {slug === "pokemonreview" && <PokemonReview />}
      {slug === "markdownnotes" && <Markdown />}
    </div>
  );
}
