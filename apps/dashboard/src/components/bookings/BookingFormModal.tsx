"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createBookingAction } from "@/lib/mutations";
import { CustomerCombobox } from "./CustomerCombobox";
import type { CustomerData, EmployeeData, ServiceData, ClinicData } from "@/lib/api";

const CHANNELS: { value: string; label: string }[] = [
  { value: "WalkIn", label: "Walk-in" },
  { value: "Phone", label: "Phone" },
  { value: "App", label: "App" },
  { value: "Instagram", label: "Instagram" },
];

export function BookingFormModal({
  customers,
  employees,
  services,
  rooms,
}: {
  customers: CustomerData[];
  employees: EmployeeData[];
  services: ServiceData[];
  rooms: ClinicData["rooms"];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const open = searchParams.get("new") === "1";

  const [form, setForm] = useState({
    customerId: "",
    employeeId: "",
    serviceId: "",
    roomId: "",
    startsAt: "",
    channel: "WalkIn",
    notes: "",
    useEntitlement: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      // datetime-local expects local time in yyyy-MM-ddTHH:mm format (no timezone)
      const localStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:00`;
      setForm({
        customerId: customers[0]?.id ?? "",
        employeeId: employees[0]?.id ?? "",
        serviceId: services[0]?.id ?? "",
        roomId: rooms[0]?.id ?? "",
        startsAt: localStr,
        channel: "WalkIn",
        notes: "",
        useEntitlement: false,
      });
      setError(null);
    }
  }, [open, customers, employees, services, rooms]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new");
    const qs = params.toString();
    router.push(qs ? `/bookings?${qs}` : "/bookings");
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.customerId || !form.employeeId || !form.serviceId || !form.roomId || !form.startsAt) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    try {
      const result = await createBookingAction({
        customerId: form.customerId,
        employeeId: form.employeeId,
        serviceId: form.serviceId,
        roomId: form.roomId,
        startsAt: new Date(form.startsAt).toISOString(),
        channel: form.channel,
        notes: form.notes || null,
        useEntitlement: form.useEntitlement,
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to create booking");
        return;
      }
      router.refresh();
      handleClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Booking"
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
        <Field label="Client" required>
          <CustomerCombobox
            value={form.customerId}
            onChange={id => setForm({ ...form, customerId: id })}
            initialCustomers={customers.slice(0, 10)}
          />
        </Field>
        <Field label="Service" required>
          <Select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })}>
            {services.length === 0 ? <option value="">No services available</option> : null}
            {services.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
          </Select>
        </Field>
        <Field label="Staff" required>
          <Select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
            {employees.length === 0 ? <option value="">No staff available</option> : null}
            {employees.map(e => <option key={e.id} value={e.id}>{e.nameEn}</option>)}
          </Select>
        </Field>
        <Field label="Room" required>
          <Select value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
            {rooms.length === 0 ? <option value="">No rooms available</option> : null}
            {rooms.map(r => <option key={r.id} value={r.id}>{r.nameEn}</option>)}
          </Select>
        </Field>
        <Field label="Start Time" required>
          <Input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} />
        </Field>
        <Field label="Channel" required>
          <Select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>
            {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Use Package Entitlement" className="sm:col-span-2">
          <label className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={form.useEntitlement}
              onChange={e => setForm({ ...form, useEntitlement: e.target.checked })}
              className="h-4 w-4 rounded border-line-strong"
            />
            <span className="text-sm text-ink-3">Deduct from a pre-paid package (price = 0)</span>
          </label>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
