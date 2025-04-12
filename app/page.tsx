"use client";

import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar"; // ← Import Sidebar

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* ← Render the sidebar */}
      <div className="flex-1 flex flex-col">
        <Header
          userId={userId}
          accessToken={accessToken}
          setUserId={setUserId}
          setIsLoggedIn={setIsLoggedIn}
        />
        {/* You can add routing or main content here */}
        <main className="p-4 text-gray-800">
          <h1 className="text-3xl font-semibold">Welcome to the Dashboard</h1>
          <p className="mt-2">Select a section from the sidebar to begin.</p>
        </main>
      </div>
    </div>
  );
}
