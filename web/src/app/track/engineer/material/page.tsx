import { Suspense } from "react";
import EngineerMaterialClient from "./EngineerMaterialClient";

export default function EngineerMaterialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7E8FF] via-[#FDFBFF] to-[#E4D4FF] px-4">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg px-6 py-4 flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#3A7AFF] animate-pulse" />
            <p className="text-sm font-medium text-gray-700">
              Loading material details…
            </p>
          </div>
        </div>
      }
    >
      <EngineerMaterialClient />
    </Suspense>
  );
}
