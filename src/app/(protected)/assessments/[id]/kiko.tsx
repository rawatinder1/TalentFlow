"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

async function generateAssessment(prompt: string, jobId: string) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, jobId }),
  });

  if (!res.ok) throw new Error("Failed to generate assessment");
  return res.json();
}

const Kiko = ({ setFormData }: { setFormData: (data: any) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const data = await generateAssessment(
        "Give me a React + HR + Aptitude assessment 10 questions per section",
        "123"
      );
      setFormData(data); // boom, UI updates
    } catch (err) {
      console.error("Failed to generate assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={loading}
      variant="default"
      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
    >
      {loading ? "Generating..." : "✨ Generate with AI"}
    </Button>
  );
};

export default Kiko;

