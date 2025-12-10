"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/shared/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import MainHeader from "@/components/Header";
import TrackSidebar from "@/components/TrackSidebar";

export default function InstallationMaterialClient() {
  const router = useRouter();

  // 🔹 ID from ?id=... in the URL (client-only)
  const [id, setId] = useState<string | null>(null);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ⭐ editing toggle (read-only by default)
  const [editing, setEditing] = useState(false);

  // Installation-Editable Fields
  const [depotEntryDate, setDepotEntryDate] = useState("");
  const [tmsTrackId, setTmsTrackId] = useState("");
  const [gpsLocation, setGpsLocation] = useState("");
  const [installationStatus, setInstallationStatus] = useState("Not Installed");

  // Jio Tag Photo
  const [jioTagPhoto, setJioTagPhoto] = useState<File | null>(null);
  const [jioTagPreview, setJioTagPreview] = useState("");

  // ------------------------------------
  // Get id from query & load material
  // ------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const materialId = params.get("id");

    if (!materialId) {
      setLoading(false);
      return;
    }

    setId(materialId);
    loadMaterial(materialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // LOAD FIRESTORE MATERIAL DATA
  // -----------------------------
  async function loadMaterial(materialId: string) {
    try {
      const snap = await getDoc(doc(db, "materials", materialId));

      if (!snap.exists()) {
        alert("Material not found");
        router.push("/track/installation");
        return;
      }

      const d = snap.data();
      setData(d);

      // Prefill editable fields
      setDepotEntryDate(d.depotEntryDate || "");
      setTmsTrackId(d.tmsTrackId || "");
      setGpsLocation(d.gpsLocation || "");
      setInstallationStatus(d.installationStatus || "Not Installed");

      // Show existing Jio tag image if present
      if (d.jioTagPhotoUrl) {
        setJioTagPreview(d.jioTagPhotoUrl);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load material details.");
      router.push("/track/installation");
    }
  }

  // -----------------------------
  // Handle Jio Tag Photo
  // -----------------------------
  function handleJioTagPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing) return; // guard
    const file = e.target.files?.[0];
    if (file) {
      setJioTagPhoto(file);
      setJioTagPreview(URL.createObjectURL(file));
    }
  }

  // -----------------------------
  // GPS AUTO DETECT
  // -----------------------------
  function detectLocation() {
    if (!editing) return; // guard
    if (!navigator.geolocation) {
      alert("GPS not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude.toFixed(
          6
        )}, ${pos.coords.longitude.toFixed(6)}`;
        setGpsLocation(loc);
      },
      () => alert("GPS permission denied or unavailable")
    );
  }

  // -----------------------------
  // SAVE INSTALLATION UPDATES
  // -----------------------------
  async function saveUpdates() {
    if (!id) return;

    setSaving(true);

    try {
      // Upload Jio Tag Photo if changed
      let jioPhotoUrl = data?.jioTagPhotoUrl || "";

      if (jioTagPhoto) {
        const storageRef = ref(storage, `jio-tag-photos/${id}.jpg`);
        await uploadBytes(storageRef, jioTagPhoto);
        jioPhotoUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "materials", id), {
        depotEntryDate,
        tmsTrackId,
        gpsLocation,
        installationStatus,
        jioTagPhotoUrl: jioPhotoUrl,
      });

      alert("Installation details updated successfully");
      setEditing(false); // back to read-only
    } catch (err) {
      console.error(err);
      alert("Failed to save installation details.");
    } finally {
      setSaving(false);
    }
  }

  // footer button handler: either enter edit mode or save
  function handlePrimaryButton() {
    if (!editing) {
      setEditing(true);
    } else {
      saveUpdates();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7E8FF] via-[#FDFBFF] to-[#E4D4FF]">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg px-6 py-4 flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-[#A259FF] animate-pulse" />
          <p className="text-sm font-medium text-gray-700">
            Loading material details…
          </p>
        </div>
      </div>
    );
  }

  // If load failed or no id
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7E8FF] via-[#FDFBFF] to-[#E4D4FF] px-4">
        <div className="bg-white/90 shadow-md px-5 py-4 rounded-2xl text-center">
          <p className="text-sm font-medium text-red-600">
            Material details not available.
          </p>
          <button
            onClick={() => router.push("/track/installation")}
            className="mt-3 text-xs text-[#A259FF] hover:underline"
          >
            ← Back to Installation Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    // 🔽 everything below is same as your current render
    // (I’m leaving it exactly as you wrote)
    <>
      {/* ... your JSX from <div className="min-h-screen ..."> downwards ... */}
    </>
  );
}

/* Small helper components (same as you wrote) */
function ReadOnlyField({ label, value, type }: { label: string; value: any; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-gray-600">{label}</label>
      <input
        type={type ?? "text"}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-xs"
        readOnly
        value={value ?? ""}
      />
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  disabled,
  type,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-gray-700">{label}</label>
      <input
        type={type ?? "text"}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A259FF]/50 text-xs disabled:bg-gray-50"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
