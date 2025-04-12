// app/layout.tsx
"use client";

import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full">
        {/* Header should be at the top */}
        <Header
          userId={userId}
          accessToken={accessToken}
          setUserId={setUserId}
          setIsLoggedIn={setIsLoggedIn}
        />
        {/* Main content area */}
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
