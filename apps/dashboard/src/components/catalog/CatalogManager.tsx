"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package as PackageIcon, Tag, Zap, Stethoscope } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select, Switch } from "@/components/ui/Field";
import { Button, buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import {
  createServiceAction, updateServiceAction, deleteServiceAction,
  createPackageAction, updatePackageAction, deletePackageAction,
  createOfferAction, updateOfferAction, deleteOfferAction,
} from "@/lib/mutations";
import type { ServiceData, PackageData, OfferData } from "@/lib/api";

const CATEGORIES = ["Laser", "Skin", "Injectables", "Body", "Hair", "Nails", "Consultation"];
const OFFER_KINDS = ["Percent", "Amount", "FreeSession"];

export function CatalogManager({
  tab,
  locale,
  services,
  packages,
  offers,
}: {
  tab: string;
  locale: string;
  services: ServiceData[];
  packages: PackageData[];
  offers: OfferData[];
}) {
  if (tab === "services") return <ServicesManager locale={locale} services={services} />;
  if (tab === "packages") return <PackagesManager locale={locale} packages={packages} services={services} />;
  if (tab === "offers") return <OffersManager locale={locale} offers={offers} />;
  return null;
}

// ─── Services ───

function ServicesManager({ locale, services: initialServices }: { locale: string; services: ServiceData[] }) {
  const [items, setItems] = useState<ServiceData[]>(initialServices);
  const [editing, setEditing] = useState<ServiceData | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setItems(initialServices); }, [initialServices]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    const result = await deleteServiceAction(id);
    if (!result.ok) { alert(result.error); return; }
    setItems(items.filter(s => s.id !== id));
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="md" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> New Service
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((service) => (
          <Card key={service.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.875rem] font-semibold text-ink">
                    {locale === "ar" ? service.nameAr : service.nameEn}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-3">
                    {locale === "ar" ? service.descriptionAr : service.descriptionEn}
                  </p>
                </div>
                <Badge tone="brand" size="sm">{service.category}</Badge>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold tabular-nums text-ink">
                    EGP {service.price.toLocaleString()}
                  </p>
                  <p className="text-2xs text-ink-4">{service.durationMin} min · per session</p>
                </div>
                <div className="flex items-center gap-2">
                  {service.requiresDoctor ? (
                    <Badge tone="gold" size="sm"><Stethoscope className="h-3 w-3" /> Doctor</Badge>
                  ) : null}
                  <Badge tone={service.published ? "success" : "muted"} size="sm">
                    {service.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                <span className="text-2xs text-ink-4">Demand: <span className="font-semibold text-ink-3">{service.demand30d}</span></span>
                <div className="flex gap-1">
                  <button className={buttonClass({ variant: "ghost", size: "xs", icon: true })} onClick={() => { setEditing(service); setShowForm(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button className={buttonClass({ variant: "ghost", size: "xs", icon: true })} onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {items.length === 0 ? (
        <Card><CardBody><EmptyState icon={<Zap className="h-5 w-5" />} title="No services yet" /></CardBody></Card>
      ) : null}
      <ServiceFormModal open={showForm} onClose={() => setShowForm(false)} editing={editing} />
    </>
  );
}

function ServiceFormModal({ open, onClose, editing }: {
  open: boolean; onClose: () => void; editing: ServiceData | null;
}) {
  const [form, setForm] = useState({
    nameEn: "", nameAr: "", category: "Laser", descriptionEn: "", descriptionAr: "",
    durationMin: 30, price: 0, recommendedSessions: 1, device: "", requiresDoctor: false,
    aftercareEn: "", aftercareAr: "", published: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        nameEn: editing.nameEn, nameAr: editing.nameAr, category: editing.category,
        descriptionEn: editing.descriptionEn, descriptionAr: editing.descriptionAr,
        durationMin: editing.durationMin, price: editing.price,
        recommendedSessions: editing.recommendedSessions, device: editing.device ?? "",
        requiresDoctor: editing.requiresDoctor, aftercareEn: "", aftercareAr: "",
        published: editing.published,
      });
    } else {
      setForm({
        nameEn: "", nameAr: "", category: "Laser", descriptionEn: "", descriptionAr: "",
        durationMin: 30, price: 0, recommendedSessions: 1, device: "", requiresDoctor: false,
        aftercareEn: "", aftercareAr: "", published: true,
      });
    }
    setError(null);
  }, [editing, open]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      let result: { ok: boolean; error?: string };
      if (editing) {
        result = await updateServiceAction(editing.id, {
          nameEn: form.nameEn, nameAr: form.nameAr,
          price: form.price, durationMin: form.durationMin, published: form.published,
        });
      } else {
        result = await createServiceAction({
          nameEn: form.nameEn, nameAr: form.nameAr, category: form.category,
          descriptionEn: form.descriptionEn, descriptionAr: form.descriptionAr,
          durationMin: form.durationMin, price: form.price,
          recommendedSessions: form.recommendedSessions, device: form.device || null,
          requiresDoctor: form.requiresDoctor,
          aftercareEn: form.aftercareEn || null, aftercareAr: form.aftercareAr || null,
        });
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
    <Modal open={open} onClose={onClose} title={editing ? "Edit Service" : "New Service"} size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></>}>
      {error ? <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (English)" required><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} /></Field>
        <Field label="Name (Arabic)"><Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} dir="rtl" /></Field>
        <Field label="Category" required>
          <Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Duration (minutes)" required><Input type="number" value={form.durationMin} onChange={e => setForm({ ...form, durationMin: +e.target.value })} /></Field>
        <Field label="Price (EGP)" required><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></Field>
        <Field label="Recommended Sessions"><Input type="number" value={form.recommendedSessions} onChange={e => setForm({ ...form, recommendedSessions: +e.target.value })} /></Field>
        <Field label="Device"><Input value={form.device} onChange={e => setForm({ ...form, device: e.target.value })} placeholder="e.g. Candela GentleMax" /></Field>
        <Field label="Requires Doctor">
          <div className="flex items-center gap-2 pt-2">
            <Switch checked={form.requiresDoctor} onChange={v => setForm({ ...form, requiresDoctor: v })} />
            <span className="text-sm text-ink-3">{form.requiresDoctor ? "Yes" : "No"}</span>
          </div>
        </Field>
        <Field label="Description (English)" className="sm:col-span-2"><Textarea value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} /></Field>
        <Field label="Description (Arabic)" className="sm:col-span-2"><Textarea value={form.descriptionAr} onChange={e => setForm({ ...form, descriptionAr: e.target.value })} dir="rtl" /></Field>
        <Field label="Published">
          <div className="flex items-center gap-2 pt-2">
            <Switch checked={form.published} onChange={v => setForm({ ...form, published: v })} />
            <span className="text-sm text-ink-3">{form.published ? "Published" : "Draft"}</span>
          </div>
        </Field>
      </div>
    </Modal>
  );
}

// ─── Packages ───

function PackagesManager({ locale, packages: initialPackages, services }: { locale: string; packages: PackageData[]; services: ServiceData[] }) {
  const [items, setItems] = useState<PackageData[]>(initialPackages);
  const [editing, setEditing] = useState<PackageData | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setItems(initialPackages); }, [initialPackages]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    const result = await deletePackageAction(id);
    if (!result.ok) { alert(result.error); return; }
    setItems(items.filter(p => p.id !== id));
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="md" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> New Package
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((pkg) => {
          const savings = pkg.listPrice - pkg.price;
          return (
            <Card key={pkg.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.875rem] font-semibold text-ink">{locale === "ar" ? pkg.nameAr : pkg.nameEn}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-3">{locale === "ar" ? pkg.descriptionAr : pkg.descriptionEn}</p>
                  </div>
                  {pkg.featured ? <Badge tone="gold" size="sm"><PackageIcon className="h-3 w-3" /> Featured</Badge> : null}
                </div>
                <div className="mt-4 space-y-1.5">
                  {pkg.items.map((item, i) => {
                    const svc = services.find(s => s.id === item.serviceId);
                    return (
                      <div key={i} className="flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-ink-2">{svc ? (locale === "ar" ? svc.nameAr : svc.nameEn) : item.serviceId}</span>
                        <span className="shrink-0 font-medium tabular-nums text-ink-3">{item.sessions} sessions</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3">
                  <div>
                    <p className="font-display text-lg font-semibold tabular-nums text-ink">EGP {pkg.price.toLocaleString()}</p>
                    {savings > 0 ? <p className="text-2xs text-success">Save EGP {savings.toLocaleString()}</p> : null}
                  </div>
                  <Badge tone={pkg.published ? "success" : "muted"} size="sm">{pkg.published ? "Published" : "Draft"}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="text-2xs text-ink-4">Sold: {pkg.soldCount} · Validity: {pkg.validityDays}d</span>
                  <div className="flex gap-1">
                    <button className={buttonClass({ variant: "ghost", size: "xs", icon: true })} onClick={() => { setEditing(pkg); setShowForm(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button className={buttonClass({ variant: "ghost", size: "xs", icon: true })} onClick={() => handleDelete(pkg.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
      {items.length === 0 ? <Card><CardBody><EmptyState icon={<PackageIcon className="h-5 w-5" />} title="No packages yet" /></CardBody></Card> : null}
      <PackageFormModal open={showForm} onClose={() => setShowForm(false)} editing={editing} services={services} />
    </>
  );
}

function PackageFormModal({ open, onClose, editing, services }: {
  open: boolean; onClose: () => void; editing: PackageData | null; services: ServiceData[];
}) {
  const [form, setForm] = useState({
    nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
    price: 0, listPrice: 0, validityDays: 90, published: true, featured: false,
  });
  const [items, setItems] = useState<{ serviceId: string; sessions: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        nameEn: editing.nameEn, nameAr: editing.nameAr,
        descriptionEn: editing.descriptionEn, descriptionAr: editing.descriptionAr,
        price: editing.price, listPrice: editing.listPrice,
        validityDays: editing.validityDays, published: editing.published, featured: editing.featured,
      });
      setItems(editing.items);
    } else {
      setForm({ nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "", price: 0, listPrice: 0, validityDays: 90, published: true, featured: false });
      setItems([]);
    }
    setError(null);
  }, [editing, open]);

  const addItem = () => setItems([...items, { serviceId: services[0]?.id ?? "", sessions: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: "serviceId" | "sessions", value: string | number) =>
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = { ...form, items };
      let result: { ok: boolean; error?: string };
      if (editing) {
        result = await updatePackageAction(editing.id, body);
      } else {
        result = await createPackageAction(body);
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
    <Modal open={open} onClose={onClose} title={editing ? "Edit Package" : "New Package"} size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></>}>
      {error ? <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (English)" required><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} /></Field>
        <Field label="Name (Arabic)"><Input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} dir="rtl" /></Field>
        <Field label="Price (EGP)" required><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></Field>
        <Field label="List Price (EGP)"><Input type="number" value={form.listPrice} onChange={e => setForm({ ...form, listPrice: +e.target.value })} /></Field>
        <Field label="Validity (days)"><Input type="number" value={form.validityDays} onChange={e => setForm({ ...form, validityDays: +e.target.value })} /></Field>
        <Field label="Featured">
          <div className="flex items-center gap-2 pt-2"><Switch checked={form.featured} onChange={v => setForm({ ...form, featured: v })} /><span className="text-sm text-ink-3">{form.featured ? "Yes" : "No"}</span></div>
        </Field>
        <Field label="Description (English)" className="sm:col-span-2"><Textarea value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} /></Field>
        <Field label="Description (Arabic)" className="sm:col-span-2"><Textarea value={form.descriptionAr} onChange={e => setForm({ ...form, descriptionAr: e.target.value })} dir="rtl" /></Field>
        <Field label="Published">
          <div className="flex items-center gap-2 pt-2"><Switch checked={form.published} onChange={v => setForm({ ...form, published: v })} /><span className="text-sm text-ink-3">{form.published ? "Published" : "Draft"}</span></div>
        </Field>
      </div>
      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Package Items</h3>
          <Button variant="soft" size="xs" onClick={addItem}><Plus className="h-3 w-3" /> Add Item</Button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <Select value={item.serviceId} onChange={e => updateItem(i, "serviceId", e.target.value)} className="flex-1">
              {services.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
            </Select>
            <Input type="number" value={item.sessions} onChange={e => updateItem(i, "sessions", +e.target.value)} className="w-24" min={1} />
            <button className={buttonClass({ variant: "ghost", size: "sm", icon: true })} onClick={() => removeItem(i)}><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {items.length === 0 ? <p className="text-xs text-ink-4">No items added yet.</p> : null}
      </div>
    </Modal>
  );
}

// ─── Offers ───

function OffersManager({ locale, offers: initialOffers }: { locale: string; offers: OfferData[] }) {
  const [items, setItems] = useState<OfferData[]>(initialOffers);
  const [editing, setEditing] = useState<OfferData | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setItems(initialOffers); }, [initialOffers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    const result = await deleteOfferAction(id);
    if (!result.ok) { alert(result.error); return; }
    setItems(items.filter(o => o.id !== id));
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" size="md" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> New Offer
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((offer) => {
          const ended = new Date(offer.endsAt) < new Date();
          return (
            <Card key={offer.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.875rem] font-semibold text-ink">{locale === "ar" ? offer.titleAr : offer.titleEn}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-3">{locale === "ar" ? offer.descriptionAr : offer.descriptionEn}</p>
                  </div>
                  <Badge tone={ended ? "muted" : "brand"} size="sm">
                    <Tag className="h-3 w-3" />
                    {offer.kind === "Percent" ? `${offer.value}%` : offer.kind === "Amount" ? `EGP ${offer.value.toLocaleString()}` : `${offer.value} free`}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 border-t border-line pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xs text-ink-4">Code</span>
                    <code className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-xs font-semibold text-ink-2">{offer.code}</code>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xs text-ink-4">Status</span>
                    <span className={cn("text-xs font-medium", ended ? "text-ink-4" : "text-success")}>
                      {ended ? "Ended" : `${new Date(offer.startsAt).toLocaleDateString()} → ${new Date(offer.endsAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xs text-ink-4">Usage</span>
                    <span className="text-xs font-medium text-ink-2">
                      {offer.usageLimit ? `${offer.usedCount}/${offer.usageLimit}` : `${offer.usedCount} (unlimited)`}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
                  <button className={buttonClass({ variant: "ghost", size: "xs", icon: true })} onClick={() => { setEditing(offer); setShowForm(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button className={buttonClass({ variant: "ghost", size: "xs", icon: true })} onClick={() => handleDelete(offer.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
      {items.length === 0 ? <Card><CardBody><EmptyState icon={<Tag className="h-5 w-5" />} title="No offers yet" /></CardBody></Card> : null}
      <OfferFormModal open={showForm} onClose={() => setShowForm(false)} editing={editing} />
    </>
  );
}

function OfferFormModal({ open, onClose, editing }: {
  open: boolean; onClose: () => void; editing: OfferData | null;
}) {
  const [form, setForm] = useState({
    titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "",
    kind: "Percent", value: 10, code: "", scopeKind: "all",
    startsAt: new Date().toISOString().slice(0, 10),
    endsAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    usageLimit: 0, published: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        titleEn: editing.titleEn, titleAr: editing.titleAr,
        descriptionEn: editing.descriptionEn, descriptionAr: editing.descriptionAr,
        kind: editing.kind, value: editing.value, code: editing.code,
        scopeKind: editing.scopeKind,
        startsAt: editing.startsAt.slice(0, 10), endsAt: editing.endsAt.slice(0, 10),
        usageLimit: editing.usageLimit ?? 0, published: editing.published,
      });
    } else {
      setForm({
        titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "",
        kind: "Percent", value: 10, code: "", scopeKind: "all",
        startsAt: new Date().toISOString().slice(0, 10),
        endsAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        usageLimit: 0, published: true,
      });
    }
    setError(null);
  }, [editing, open]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        titleEn: form.titleEn, titleAr: form.titleAr,
        descriptionEn: form.descriptionEn, descriptionAr: form.descriptionAr,
        kind: form.kind, value: form.value, code: form.code,
        scopeKind: form.scopeKind, scopeIds: [],
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        usageLimit: form.usageLimit > 0 ? form.usageLimit : null,
        published: form.published,
      };
      let result: { ok: boolean; error?: string };
      if (editing) {
        result = await updateOfferAction(editing.id, body);
      } else {
        result = await createOfferAction(body);
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
    <Modal open={open} onClose={onClose} title={editing ? "Edit Offer" : "New Offer"} size="lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></>}>
      {error ? <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title (English)" required><Input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} /></Field>
        <Field label="Title (Arabic)"><Input value={form.titleAr} onChange={e => setForm({ ...form, titleAr: e.target.value })} dir="rtl" /></Field>
        <Field label="Kind" required>
          <Select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })}>
            {OFFER_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
          </Select>
        </Field>
        <Field label="Value" required><Input type="number" value={form.value} onChange={e => setForm({ ...form, value: +e.target.value })} /></Field>
        <Field label="Code" required><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="SUMMER25" /></Field>
        <Field label="Usage Limit (0 = unlimited)"><Input type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: +e.target.value })} /></Field>
        <Field label="Start Date" required><Input type="date" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} /></Field>
        <Field label="End Date" required><Input type="date" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} /></Field>
        <Field label="Description (English)" className="sm:col-span-2"><Textarea value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} /></Field>
        <Field label="Description (Arabic)" className="sm:col-span-2"><Textarea value={form.descriptionAr} onChange={e => setForm({ ...form, descriptionAr: e.target.value })} dir="rtl" /></Field>
        <Field label="Published">
          <div className="flex items-center gap-2 pt-2"><Switch checked={form.published} onChange={v => setForm({ ...form, published: v })} /><span className="text-sm text-ink-3">{form.published ? "Published" : "Draft"}</span></div>
        </Field>
      </div>
    </Modal>
  );
}
