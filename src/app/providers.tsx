"use client";

import { useEffect, useState } from "react";
import { seedDatabase } from "@/db/seed";

export function Providers({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window === "undefined") return;

      try {
        // First, start MSW
        const { worker } = await import("@/mockApis/browser");
        await worker.start({ onUnhandledRequest: "bypass" });
        console.log("[MSW] Worker started ");

        // Then seed the database
        console.log("[INIT] Starting database seed...");
        await seedDatabase();
        console.log("[INIT] Database seed completed");

        setIsInitialized(true);
      } catch (error) {
        console.error("[INIT] Initialization failed:", error);
        // Still set initialized to true so the app doesn't hang
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Optional: Show loading state while initializing
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}>
        Initializing app...
      </div>
    );
  }

  return <>{children}</>;
}