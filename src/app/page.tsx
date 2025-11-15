"use client";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";

export default function Home() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return null; // The AuthProvider will show a global loader
  }

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
