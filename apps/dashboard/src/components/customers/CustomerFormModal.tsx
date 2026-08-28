"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createCustomerAction } from "@/lib/mutations";

const SOURCES = ["app", "walk_in", "instagram", "referral", "phone"];
const SOURCE_TO_API: Record<string, string> = {
  app: "App",
  walk_in: "WalkIn",
  instagram: "Instagram",
  referral: "Referral",
  phone: "Phone",
};
const GENDERS = ["female", "male", "other"];

export function CustomerFormModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const open = searchParams.get("new") === "1";

  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    phone: "",
    email: "",
    gender: "female",
    birthDate: "",
    source: "walk_in",
    notes: "",
    marketingOptIn: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        nameEn: "", nameAr: "", phone: "", email: "",
        gender: "female", birthDate: "", source: "walk_in",
        notes: "", marketingOptIn: false,
      });
      setError(null);
    }
  }, [open]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    router.push(`/customers?${params.toString()}`);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.nameEn.trim() || !form.phone.trim()) {
      setError("Name (English) and phone are required");
      return;
    }
    setSaving(true);
    try {
      const result = await createCustomerAction({
        nameEn: form.nameEn,
        nameAr: form.nameAr || form.nameEn,
        phone: form.phone,
        email: form.email || null,
        gender: form.gender,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
        source: SOURCE_TO_API[form.source] ?? "WalkIn",
        notes: form.notes || null,
        tags: [],
        allergies: [],
        conditions: [],
        marketingOptIn: form.marketingOptIn,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to create customer");
        return;
      }
      router.refresh();
      handleClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Client"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      {error ? (
        <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (English)" required>
          <Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} />
        </Field>
        <Field label="Name (Arabic)">
          <Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} dir="rtl" />
        </Field>
        <Field label="Phone" required>
          <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+20..." />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Gender">
          <Select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
        </Field>
        <Field label="Birth Date">
          <Input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
        </Field>
        <Field label="Source">
          <Select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Marketing Opt-in">
          <label className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={e => setForm({ ...form, marketingOptIn: e.target.checked })}
              className="h-4 w-4 rounded border-line-strong"
            />
            <span className="text-sm text-ink-3">Consent to marketing messages</span>
          </label>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
