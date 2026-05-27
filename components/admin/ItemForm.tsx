"use client";
// ItemForm — shared form for adding and editing menu items in the admin panel.
// Handles photo upload to Supabase Storage, all dietary toggles, price input.
// DB writes go through server actions (service role) — NOT the anon client.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createMenuItem, updateMenuItem } from "@/lib/actions/menuActions";
import type { Category, MenuItem } from "@/types";

interface ItemFormProps {
  /** Categories list for the dropdown */
  categories: Category[];
  /** Pre-filled values when editing an existing item */
  defaultValues?: MenuItem;
}

/**
 * Add / Edit menu item form.
 * Submits via a Server Action (upsert to menu_items).
 * Photo uploaded directly to Supabase Storage from the browser.
 */
export default function ItemForm({ categories, defaultValues }: ItemFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues;

  // ── Form state ───────────────────────────────────────────────────────────
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [categoryId, setCategoryId] = useState(defaultValues?.category_id ?? categories[0]?.id ?? "");
  // Price shown in rupees to admin; stored as paise in DB
  const [priceRupees, setPriceRupees] = useState(
    defaultValues ? String(defaultValues.price_cents / 100) : ""
  );
  const [isVeg, setIsVeg] = useState(defaultValues?.is_veg ?? false);
  const [isVegan, setIsVegan] = useState(defaultValues?.is_vegan ?? false);
  const [isGf, setIsGf] = useState(defaultValues?.is_gf ?? false);
  const [isAvailable, setIsAvailable] = useState(defaultValues?.is_available ?? true);
  const [isSpecial, setIsSpecial] = useState(defaultValues?.is_special ?? false);
  const [specialNote, setSpecialNote] = useState(defaultValues?.special_note ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaultValues?.photo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Photo upload ─────────────────────────────────────────────────────────
  /** Upload photo to Supabase Storage and set the public URL */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      // Generate a unique filename using timestamp + original name
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-photos")
        .upload(filename, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded photo
      const { data } = supabase.storage.from("menu-photos").getPublicUrl(filename);
      setPhotoUrl(data.publicUrl);
    } catch (err) {
      console.error("[ItemForm] Photo upload error:", err);
      setError("Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) { setError("Name is required."); return; }
    const price = parseFloat(priceRupees);
    if (!priceRupees || isNaN(price) || price <= 0) {
      setError("Price must be greater than 0."); return;
    }

    setSaving(true);
    try {
      // Convert rupees → paise (multiply by 100, round to avoid float issues)
      const priceCents = Math.round(price * 100);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category_id: categoryId,
        price_cents: priceCents,
        photo_url: photoUrl,
        is_veg: isVeg,
        is_vegan: isVegan,
        is_gf: isGf,
        is_available: isAvailable,
        is_special: isSpecial,
        special_note: specialNote.trim() || null,
      };

      // Use server actions (service role) — anon client cannot write to menu_items
      const errMsg = isEdit && defaultValues
        ? await updateMenuItem(defaultValues.id, payload)
        : await createMenuItem(payload);

      if (errMsg) { setError(errMsg); return; }

      // Redirect back to menu list on success
      router.push("/admin/menu");
      router.refresh();
    } catch (err) {
      console.error("[ItemForm] Save error:", err);
      setError("Failed to save item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-brand-rust/10 border border-brand-rust/40 text-brand-rust
                        font-hind text-sm rounded-lg px-4 py-3" role="alert">
          {error}
        </div>
      )}

      {/* ── Name ──────────────────────────────────────────────────────── */}
      <Field label="Dish Name *">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dal Makhani"
          required
          className={inputClass}
        />
      </Field>

      {/* ── Description ───────────────────────────────────────────────── */}
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short appetising description..."
          rows={3}
          className={inputClass}
        />
      </Field>

      {/* ── Category + Price row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category *">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Price (₹) *">
          <input
            type="number"
            value={priceRupees}
            onChange={(e) => setPriceRupees(e.target.value)}
            placeholder="e.g. 320"
            min="1"
            step="0.01"
            required
            className={inputClass}
          />
        </Field>
      </div>

      {/* ── Photo upload ──────────────────────────────────────────────── */}
      <Field label="Photo">
        <div className="flex items-center gap-4">
          {/* Preview thumbnail */}
          {photoUrl && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-brand-wood/30 shrink-0">
              <Image src={photoUrl} alt="Preview" fill className="object-cover" sizes="80px" />
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              id="photo-upload"
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer font-hind text-sm bg-brand-wood/10 hover:bg-brand-wood/20
                         border border-brand-wood/30 text-brand-wood px-4 py-2 rounded-lg
                         transition-colors inline-block"
            >
              {uploading ? "Uploading…" : photoUrl ? "Change Photo" : "Upload Photo"}
            </label>
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="ml-2 font-hind text-xs text-brand-muted hover:text-brand-rust"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Field>

      {/* ── Dietary toggles ───────────────────────────────────────────── */}
      <div>
        <p className="font-hind text-sm font-medium text-brand-body mb-3">Dietary Tags</p>
        <div className="flex flex-wrap gap-3">
          <Toggle label="🟢 Veg" checked={isVeg} onChange={setIsVeg} />
          <Toggle label="🌿 Vegan" checked={isVegan} onChange={setIsVegan} />
          <Toggle label="GF Gluten-Free" checked={isGf} onChange={setIsGf} />
        </div>
      </div>

      {/* ── Availability + Special toggles ───────────────────────────── */}
      <div>
        <p className="font-hind text-sm font-medium text-brand-body mb-3">Visibility</p>
        <div className="flex flex-wrap gap-3">
          <Toggle label="✅ Available" checked={isAvailable} onChange={setIsAvailable} />
          <Toggle label="✨ Today's Special" checked={isSpecial} onChange={setIsSpecial} />
        </div>
      </div>

      {/* ── Special note (shown when is_special = true) ───────────────── */}
      {isSpecial && (
        <Field label="Special Note (short story / origin of dish)">
          <textarea
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder="e.g. Simmered overnight — just like home"
            rows={2}
            className={inputClass}
          />
        </Field>
      )}

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-brand-wood hover:bg-brand-rust text-white font-hind font-semibold
                     px-8 py-2.5 rounded-full shadow-sm transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
        </button>
        <a
          href="/admin/menu"
          className="font-hind text-sm text-brand-muted hover:text-brand-rust underline
                     underline-offset-4 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

// ── Small reusable sub-components ─────────────────────────────────────────────

const inputClass =
  "w-full border border-brand-wood/30 rounded-lg px-4 py-2.5 font-hind text-sm " +
  "text-brand-body bg-white placeholder:text-brand-muted " +
  "focus:outline-none focus:ring-2 focus:ring-brand-wood/40";

/** Labelled form field wrapper */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-hind text-sm font-medium text-brand-body mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Pill-style checkbox toggle */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`font-hind text-sm px-4 py-1.5 rounded-full border transition-colors
                  ${checked
                    ? "bg-brand-wood text-white border-brand-wood"
                    : "bg-brand-card text-brand-body border-brand-wood/30 hover:border-brand-wood"
                  }`}
    >
      {label}
    </button>
  );
}

