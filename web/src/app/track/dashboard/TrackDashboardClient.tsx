// src/app/track/dashboard/TrackDashboardClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // optional but nicer
import { db } from "@/shared/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AppLoader from "@/components/AppLoader";

type Role = "installation" | "maintenance" | "engineer";

type Material = {
  materialId: string;
  manufacturerId: string;
  manufacturerName: string;
  fittingType: string;
  drawingNumber: string;
  materialSpec: string;
  weightKg: string;
  boardGauge: string;
  manufacturingDate: string;
  expectedLifeYears: string;
  purchaseOrderNumber: string;
  batchNumber: string;
  depotCode: string;
  depotEntryDate: string;
  udmLotNumber: string;
  inspectionOfficer: string;
  tmsTrackId: string;
  gpsLocation: string;
  installationStatus: string;
  dispatchDate: string;
  warrantyExpiry: string;
  failureCount: string;
  lastMaintenanceDate: string;
  druvaStatus?: string;
  druvaDamageNotes?: string;
  componentStatus?: string;
  failureType?: string;
  failureLocation?: string;
  failureNotes?: string;
  engineerVerified?: boolean;
  engineerNotes?: string;
  engineerPhotoUrl?: string;
};

export default function TrackDashboardClient() {
  const params = useSearchParams();
  const idFromQuery = params.get("id");

  const [id, setId] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("installation");
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Material>>({});
  const [qrUrl, setQrUrl] = useState<string>("");

  // useSearchParams only available client-side, so sync into state
  useEffect(() => {
    if (!idFromQuery) {
      setMsg("Material ID not provided in URL.");
      setMaterial(null);
      setLoading(false);
      return;
    }
    setId(idFromQuery);
  }, [idFromQuery]);

  // load firestore once id is known
  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "materials", id));
        if (!snap.exists()) {
          setMsg("Material not found.");
          setMaterial(null);
        } else {
          const data = snap.data() as Material;
          setMaterial(data);
          setForm(data);
        }
      } catch (err) {
        console.error(err);
        setMsg("Failed to load material.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // Build QR URL only on client to avoid hydration mismatch
  useEffect(() => {
    if (!id) return;
    if (typeof window === "undefined") return;
    setQrUrl(`${window.location.origin}/material/${id}`);
  }, [id]);

  function updateField<K extends keyof Material>(field: K, value: Material[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function fillGps(field: keyof Material) {
    if (!navigator.geolocation) {
      alert("Geolocation not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = `${pos.coords.latitude.toFixed(
          6
        )}, ${pos.coords.longitude.toFixed(6)}`;
        updateField(field, coords as any);
      },
      err => {
        console.error(err);
        alert("Unable to fetch GPS location.");
      }
    );
  }

  async function handleSave() {
    if (!id || !material) return;

    setSaving(true);
    setMsg(null);

    try {
      const ref = doc(db, "materials", id);
      const payload: Partial<Material> = {};

      if (role === "installation") {
        payload.depotEntryDate = (form.depotEntryDate ?? "") as string;
        payload.tmsTrackId = (form.tmsTrackId ?? "") as string;
        payload.gpsLocation = (form.gpsLocation ?? "") as string;
        payload.installationStatus = (form.installationStatus ?? "") as string;
      }

      if (role === "maintenance") {
        payload.druvaStatus = form.druvaStatus ?? "";
        payload.druvaDamageNotes = form.druvaDamageNotes ?? "";
        payload.componentStatus = form.componentStatus ?? "";
        payload.failureType = form.failureType ?? "";
        payload.failureLocation = form.failureLocation ?? "";
        payload.failureNotes = form.failureNotes ?? "";
        payload.failureCount = (form.failureCount ??
          material.failureCount ??
          "0") as string;
      }

      if (role === "engineer") {
        payload.lastMaintenanceDate = (form.lastMaintenanceDate ?? "") as string;
        payload.engineerNotes = form.engineerNotes ?? "";
        payload.engineerPhotoUrl = form.engineerPhotoUrl ?? "";
        payload.engineerVerified = true;
      }

      await updateDoc(ref, payload);
      setMsg("Updates saved successfully.");
      setMaterial(prev =>
        prev ? ({ ...prev, ...payload } as Material) : prev
      );
    } catch (err) {
      console.error(err);
      setMsg("Failed to save updates.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AppLoader />;

  if (!material) {
    return (
      <div className="min-h-screen bg-[#F7E8FF] flex items-center justify-center px-4">
        <p className="text-sm text-red-600 text-center">
          {msg || "Material not found."}
        </p>
      </div>
    );
  }

  // ⬇️ keep all your JSX exactly as you already have it (header, sections, InputRow, etc.)
  // I’m not repeating it again to save space – just paste your existing JSX + subcomponents here.
  // The only change is the wrapper component name (TrackDashboardClient) and the id handling above.
}
