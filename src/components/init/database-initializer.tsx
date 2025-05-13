"use client";

import { useEffect, useState } from "react";
import { createTablesIfNotExist } from "@/lib/mock-data";

export function DatabaseInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Only run this once
        if (initialized) return;
        
        console.log("Initializing database...");
        await createTablesIfNotExist();
        setInitialized(true);
        console.log("Database initialization complete");
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };

    initializeDatabase();
  }, [initialized]);

  // This component doesn't render anything
  return null;
}
