import Conversation from "@/components/Messaging/Conversation";
import React from "react";

export default function MessageriePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-noir-700 via-noir-500 to-noir-700 pt-20 sm:pt-22 px-2 sm:px-20">
      <Conversation />
    </div>
  );
}
