import { Suspense } from "react";
import EngineerViewClient from "./EngineerViewClient";

export default function ViewMaterialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7E8FF] via-[#FDFBFF] to-[#E4D4FF] px-4">
          <div className="flex items-center gap-3 bg-white/90 shadow-md px-4 py-2 rounded-xl">
            <span className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-gray-700 text-sm">
              Loading material details...
            </p>
          </div>
        </div>
      }
    >
      <EngineerViewClient />
    </Suspense>
  );
}
