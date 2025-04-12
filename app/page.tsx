"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js 13+ app router

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/foodreview");
  }, [router]);

  return null;
}
