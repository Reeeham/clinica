"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createClinicAction } from "@/lib/mutations";

export function OnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: "",
    nameEn: "",
    nameAr: "",
    taglineEn: "",
    taglineAr: "",
    phone: "",
    whatsapp: "",
    cityEn: "Cairo",
    cityAr: "القاهرة",
    areaEn: "",
    areaAr: "",
    addressEn: "",
    addressAr: "",
    ownerNameEn: "",
    ownerNameAr: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!form.slug.trim() || !form.nameEn.trim() || !form.ownerEmail.trim() || !form.ownerPassword.trim()) {
      setError("Clinic slug, name, owner email, and owner password are required");
      return;
    }

    setSaving(true);
    try {
      const result = await createClinicAction({
        slug: form.slug,
        nameEn: form.nameEn,
        nameAr: form.nameAr || form.nameEn,
        taglineEn: form.taglineEn,
        taglineAr: form.taglineAr || form.taglineEn,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        cityEn: form.cityEn,
        cityAr: form.cityAr,
        areaEn: form.areaEn,
        areaAr: form.areaAr || form.areaEn,
        addressEn: form.addressEn,
        addressAr: form.addressAr || form.addressEn,
        ownerNameEn: form.ownerNameEn,
        ownerNameAr: form.ownerNameAr || form.ownerNameEn,
        ownerEmail: form.ownerEmail,
        ownerPhone: form.ownerPhone || form.phone,
        ownerPassword: form.ownerPassword,
      });

      if (!result.ok) {
        setError(result.error ?? "Failed to create clinic");
        return;
      }

      setSuccess(`Clinic "${form.nameEn}" created successfully! The owner can now log in with ${form.ownerEmail}.`);
      setForm({
        slug: "", nameEn: "", nameAr: "", taglineEn: "", taglineAr: "",
        phone: "", whatsapp: "", cityEn: "Cairo", cityAr: "القاهرة",
        areaEn: "", areaAr: "", addressEn: "", addressAr: "",
        ownerNameEn: "", ownerNameAr: "", ownerEmail: "", ownerPhone: "", ownerPassword: "",
      });
    } catch (e: any) {
      setError(e.message ?? "Failed to create clinic");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {error ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">{success}</p>
      ) : null}

      <Card>
        <CardHeader title="Clinic Details" />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Clinic Name (English)" required>
              <Input
                value={form.nameEn}
                onChange={(e) => {
                  set("nameEn", e.target.value);
                  if (!form.slug) set("slug", generateSlug(e.target.value));
                }}
                placeholder="Glow Skin Clinic"
              />
            </Field>
            <Field label="Clinic Name (Arabic)">
              <Input value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} dir="rtl" placeholder="عيادة جلو" />
            </Field>
            <Field label="Slug" hint="Used in URLs, lowercase, hyphens only" required>
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="glow-skin-clinic" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0223030404" />
            </Field>
            <Field label="Tagline (English)">
              <Input value={form.taglineEn} onChange={(e) => set("taglineEn", e.target.value)} placeholder="Your skin, our passion" />
            </Field>
            <Field label="Tagline (Arabic)">
              <Input value={form.taglineAr} onChange={(e) => set("taglineAr", e.target.value)} dir="rtl" />
            </Field>
            <Field label="City (English)">
              <Input value={form.cityEn} onChange={(e) => set("cityEn", e.target.value)} />
            </Field>
            <Field label="City (Arabic)">
              <Input value={form.cityAr} onChange={(e) => set("cityAr", e.target.value)} dir="rtl" />
            </Field>
            <Field label="Area (English)">
              <Input value={form.areaEn} onChange={(e) => set("areaEn", e.target.value)} placeholder="Zamalek" />
            </Field>
            <Field label="Area (Arabic)">
              <Input value={form.areaAr} onChange={(e) => set("areaAr", e.target.value)} dir="rtl" placeholder="الزمالك" />
            </Field>
            <Field label="Address (English)" className="sm:col-span-2">
              <Input value={form.addressEn} onChange={(e) => set("addressEn", e.target.value)} placeholder="26th of July St, Zamalek" />
            </Field>
            <Field label="Address (Arabic)" className="sm:col-span-2">
              <Input value={form.addressAr} onChange={(e) => set("addressAr", e.target.value)} dir="rtl" />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Owner Account" hint="This person will be the clinic owner and can log in to the dashboard." />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Owner Name (English)" required>
              <Input value={form.ownerNameEn} onChange={(e) => set("ownerNameEn", e.target.value)} placeholder="Dr. Laila Farouk" />
            </Field>
            <Field label="Owner Name (Arabic)">
              <Input value={form.ownerNameAr} onChange={(e) => set("ownerNameAr", e.target.value)} dir="rtl" />
            </Field>
            <Field label="Owner Email" required>
              <Input type="email" value={form.ownerEmail} onChange={(e) => set("ownerEmail", e.target.value)} placeholder="owner@clinic.com" />
            </Field>
            <Field label="Owner Phone">
              <Input value={form.ownerPhone} onChange={(e) => set("ownerPhone", e.target.value)} placeholder="0100..." />
            </Field>
            <Field label="Owner Password" required hint="Minimum 6 characters">
              <Input type="password" value={form.ownerPassword} onChange={(e) => set("ownerPassword", e.target.value)} placeholder="••••••••" />
            </Field>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating…" : "Create Clinic & Owner"}
        </Button>
      </div>
    </div>
  );
}
