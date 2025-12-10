// src/app/track/dashboard/page.tsx
import { Suspense } from "react";
import TrackDashboardClient from "./TrackDashboardClient";

export default function TrackDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7E8FF] px-4">
          <div className="p-5 sm:p-6 bg-white shadow rounded-2xl flex gap-3 items-center">
            <div className="h-7 w-7 sm:h-8 sm:w-8 border-4 border-[#A259FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm text-gray-700">
              Loading track dashboard…
            </p>
          </div>
        </div>
      }
    >
      <TrackDashboardClient />
    </Suspense>
  );
}
