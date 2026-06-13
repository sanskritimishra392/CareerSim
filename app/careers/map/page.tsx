"use client";

import { useState } from "react";
import CareerMap from "@/app/components/CareerMap";
import { getStoredXp } from "@/lib/leveling";

export default function CareerMapPage() {
  const [totalXp] = useState(getStoredXp());

  const handleSelectNode = (node: { title: string }) => {
    alert(`Selected: ${node.title}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <CareerMap totalXp={totalXp} onSelectNode={handleSelectNode} />
    </div>
  );
}