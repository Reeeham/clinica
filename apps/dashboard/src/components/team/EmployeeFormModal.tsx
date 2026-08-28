"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createEmployeeAction } from "@/lib/mutations";

const ROLES = ["owner", "manager", "doctor", "therapist", "receptionist"];
const ROLE_TO_API: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  doctor: "Doctor",
  therapist: "Therapist",
  receptionist: "Receptionist",
};

export function EmployeeFormModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const open = searchParams.get("new") === "1";

  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    role: "therapist",
    titleEn: "",
    titleAr: "",
    phone: "",
    email: "",
    salary: 0,
    commissionRate: 0,
    canLogin: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        nameEn: "", nameAr: "", role: "therapist",
        titleEn: "", titleAr: "", phone: "", email: "",
        salary: 0, commissionRate: 0, canLogin: false,
      });
      setError(null);
    }
  }, [open]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    router.push(`/team?${params.toString()}`);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.nameEn.trim() || !form.phone.trim()) {
      setError("Name (English) and phone are required");
      return;
    }
    setSaving(true);
    try {
      const result = await createEmployeeAction({
        nameEn: form.nameEn,
        nameAr: form.nameAr || form.nameEn,
        role: ROLE_TO_API[form.role] ?? "Therapist",
        titleEn: form.titleEn,
        titleAr: form.titleAr || form.titleEn,
        phone: form.phone,
        email: form.email,
        salary: form.salary,
        commissionRate: form.commissionRate,
        specialties: [],
        canLogin: form.canLogin,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to create staff member");
        return;
      }
      router.refresh();
      handleClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to create staff member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Staff Member"
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
        <Field label="Role" required>
          <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Phone" required>
          <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+20..." />
        </Field>
        <Field label="Title (English)">
          <Input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} />
        </Field>
        <Field label="Title (Arabic)">
          <Input value={form.titleAr} onChange={e => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Salary (EGP)">
          <Input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: +e.target.value })} />
        </Field>
        <Field label="Commission Rate (%)">
          <Input type="number" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: +e.target.value })} />
        </Field>
        <Field label="Can Login">
          <label className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={form.canLogin}
              onChange={e => setForm({ ...form, canLogin: e.target.checked })}
              className="h-4 w-4 rounded border-line-strong"
            />
            <span className="text-sm text-ink-3">Allow dashboard access</span>
          </label>
        </Field>
      </div>
    </Modal>
  );
}
