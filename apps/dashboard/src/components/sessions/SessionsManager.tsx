"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ClipboardCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { createSessionAction, updateSessionAction, deleteSessionAction } from "@/lib/mutations";
import type { SessionRecordData, CustomerData, EmployeeData, ServiceData } from "@/lib/api";

const REACTIONS = ["none", "positive", "neutral", "sensitive", "adverse"];

export function SessionsManager({
  sessions: initialSessions,
  customers,
  employees,
  services,
}: {
  sessions: SessionRecordData[];
  customers: CustomerData[];
  employees: EmployeeData[];
  services: ServiceData[];
}) {
  const [items, setItems] = useState<SessionRecordData[]>(initialSessions);
  const [editing, setEditing] = useState<SessionRecordData | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setItems(initialSessions); }, [initialSessions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session record?")) return;
    const result = await deleteSessionAction(id);
    if (!result.ok) { alert(result.error); return; }
    setItems(items.filter(s => s.id !== id));
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Session Records</h1>
        <Button variant="primary" size="md" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> New Session
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((session) => (
          <Card key={session.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={session.customer.initials} color={session.customer.color} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{session.customer.nameEn}</p>
                    <p className="text-xs text-ink-3">
                      {session.service.nameEn} · {session.employee.nameEn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={session.reaction === "adverse" ? "danger" : session.reaction === "positive" ? "success" : "muted"} size="sm">
                    {session.reaction}
                  </Badge>
                  {session.satisfaction ? (
                    <Badge tone="brand" size="sm">{session.satisfaction}/5</Badge>
                  ) : null}
                  <span className="text-xs text-ink-4">{new Date(session.performedAt).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    <button className={buttonClass({ variant: "ghost", size: "xs", icon: true })} onClick={() => { setEditing(session); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button className={buttonClass({ variant: "ghost", size: "xs", icon: true })} onClick={() => handleDelete(session.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-line pt-3">
                <p className="text-xs leading-relaxed text-ink-2">
                  <span className="font-medium text-ink">Outcome:</span> {session.outcomeEn}
                </p>
                {session.areas.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {session.areas.map((area, i) => (
                      <Badge key={i} tone="neutral" size="sm">{area}</Badge>
                    ))}
                  </div>
                ) : null}
                {session.notes ? (
                  <p className="mt-2 text-xs text-ink-3"><span className="font-medium text-ink-2">Notes:</span> {session.notes}</p>
                ) : null}
                {session.nextDueAt ? (
                  <p className="mt-2 text-xs text-success">
                    Next due: {new Date(session.nextDueAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <Card><CardBody><EmptyState icon={<ClipboardCheck className="h-5 w-5" />} title="No session records yet" /></CardBody></Card>
      ) : null}

      <SessionFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        editing={editing}
        customers={customers}
        employees={employees}
        services={services}
      />
    </>
  );
}

function SessionFormModal({ open, onClose, editing, customers, employees, services }: {
  open: boolean; onClose: () => void; editing: SessionRecordData | null;
  customers: CustomerData[]; employees: EmployeeData[]; services: ServiceData[];
}) {
  const [form, setForm] = useState({
    customerId: "", employeeId: "", serviceId: "", bookingId: "",
    performedAt: new Date().toISOString().slice(0, 16),
    areas: "", outcomeEn: "", outcomeAr: "", reaction: "none",
    satisfaction: 0, nextDueAt: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        customerId: editing.customerId, employeeId: editing.employeeId,
        serviceId: editing.serviceId, bookingId: editing.bookingId,
        performedAt: editing.performedAt.slice(0, 16),
        areas: editing.areas.join(", "),
        outcomeEn: editing.outcomeEn, outcomeAr: editing.outcomeAr,
        reaction: editing.reaction,
        satisfaction: editing.satisfaction ?? 0,
        nextDueAt: editing.nextDueAt ? editing.nextDueAt.slice(0, 10) : "",
        notes: editing.notes ?? "",
      });
    } else {
      setForm({
        customerId: customers[0]?.id ?? "", employeeId: employees[0]?.id ?? "",
        serviceId: services[0]?.id ?? "", bookingId: "",
        performedAt: new Date().toISOString().slice(0, 16),
        areas: "", outcomeEn: "", outcomeAr: "", reaction: "none",
        satisfaction: 0, nextDueAt: "", notes: "",
      });
    }
    setError(null);
  }, [editing, open, customers, employees, services]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        bookingId: form.bookingId || crypto.randomUUID(),
        customerId: form.customerId,
        serviceId: form.serviceId,
        employeeId: form.employeeId,
        performedAt: new Date(form.performedAt).toISOString(),
        areas: form.areas.split(",").map(a => a.trim()).filter(Boolean),
        outcomeEn: form.outcomeEn,
        outcomeAr: form.outcomeAr || form.outcomeEn,
        reaction: form.reaction,
        satisfaction: form.satisfaction > 0 ? form.satisfaction : null,
        nextDueAt: form.nextDueAt ? new Date(form.nextDueAt).toISOString() : null,
        notes: form.notes || null,
      };
      let result: { ok: boolean; error?: string };
      if (editing) {
        result = await updateSessionAction(editing.id, body);
      } else {
        result = await createSessionAction(body);
      }
      if (!result.ok) { setError(result.error ?? "Failed to save"); return; }
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Session" : "New Session"} size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></>}>
      {error ? <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer" required>
          <Select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
            {customers.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
          </Select>
        </Field>
        <Field label="Employee" required>
          <Select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
            {employees.map(e => <option key={e.id} value={e.id}>{e.nameEn}</option>)}
          </Select>
        </Field>
        <Field label="Service" required>
          <Select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })}>
            {services.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
          </Select>
        </Field>
        <Field label="Performed At" required>
          <Input type="datetime-local" value={form.performedAt} onChange={e => setForm({ ...form, performedAt: e.target.value })} />
        </Field>
        <Field label="Reaction">
          <Select value={form.reaction} onChange={e => setForm({ ...form, reaction: e.target.value })}>
            {REACTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Satisfaction (1-5, 0 = none)">
          <Input type="number" min={0} max={5} value={form.satisfaction} onChange={e => setForm({ ...form, satisfaction: +e.target.value })} />
        </Field>
        <Field label="Areas (comma-separated)" className="sm:col-span-2">
          <Input value={form.areas} onChange={e => setForm({ ...form, areas: e.target.value })} placeholder="e.g. underarms, bikini line" />
        </Field>
        <Field label="Outcome (English)" required className="sm:col-span-2">
          <Textarea value={form.outcomeEn} onChange={e => setForm({ ...form, outcomeEn: e.target.value })} />
        </Field>
        <Field label="Outcome (Arabic)" className="sm:col-span-2">
          <Textarea value={form.outcomeAr} onChange={e => setForm({ ...form, outcomeAr: e.target.value })} dir="rtl" />
        </Field>
        <Field label="Next Due Date">
          <Input type="date" value={form.nextDueAt} onChange={e => setForm({ ...form, nextDueAt: e.target.value })} />
        </Field>
        <Field label="Notes">
          <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
