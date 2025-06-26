"use client";

import React from "react";
import { useSession } from "next-auth/react";
import MainDahboard from "@/components/mainDahboard";

export default function Dashboard() {
  const { data: session } = useSession();
  console.log("Session data:", session);
  return (
    <div className="">
      <MainDahboard />
    </div>
  );
}
