"use client";

import React from "react";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  console.log("Session data:", session);
  return <div></div>;
}
