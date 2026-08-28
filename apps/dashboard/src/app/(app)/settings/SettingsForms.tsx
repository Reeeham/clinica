"use client";

import { useState } from "react";
import {
  formatPhone,
  type ServiceCategory,
} from "@clinica/core";
import { Star, MapPin, BadgeCheck, Globe } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Textarea, Switch } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/domain/StatusBadge";
import { type Translator } from "@/lib/i18n";
import {
  updateSettingsProfile,
  updateSettingsHours,
  createRoom,
  deleteRoom,
} from "@/lib/api";
import type { ClinicData } from "@/lib/data";

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

interface SettingsFormsProps {
  tab: string;
  clinic: ClinicData;
  locale: "en" | "ar";
  t: Translator;
}

export function SettingsForms({ tab, clinic, locale, t }: SettingsFormsProps) {
  if (tab === "profile") return <ProfileForm clinic={clinic} t={t} />;
  if (tab === "hours") return <HoursForm clinic={clinic} locale={locale} t={t} />;
  if (tab === "rooms") return <RoomsManager clinic={clinic} locale={locale} t={t} />;
  if (tab === "app") return <AppPreview clinic={clinic} locale={locale} t={t} />;
  if (tab === "plan") return <PlanInfo clinic={clinic} t={t} />;
  return null;
}

// ─── Profile Form ───

function ProfileForm({ clinic, t }: { clinic: ClinicData; t: SettingsFormsProps["t"] }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData(e.currentTarget);
      const body = {
        nameEn: formData.get("nameEn"),
        nameAr: formData.get("nameAr"),
        taglineEn: formData.get("taglineEn"),
        taglineAr: formData.get("taglineAr"),
        aboutEn: formData.get("aboutEn"),
        aboutAr: formData.get("aboutAr"),
        addressEn: formData.get("addressEn"),
        addressAr: formData.get("addressAr"),
        areaEn: formData.get("areaEn"),
        areaAr: formData.get("areaAr"),
        cityEn: formData.get("cityEn"),
        cityAr: formData.get("cityAr"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp"),
      };
      await updateSettingsProfile(body);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title={t("settings.english")} dense />
        <CardBody dense className="space-y-4">
          <Field label={t("settings.name")}>
            <Input name="nameEn" defaultValue={clinic.nameEn} />
          </Field>
          <Field label={t("settings.tagline")}>
            <Input name="taglineEn" defaultValue={clinic.taglineEn} />
          </Field>
          <Field label={t("settings.about")}>
            <Textarea name="aboutEn" rows={4} defaultValue={clinic.aboutEn} />
          </Field>
          <Field label={t("settings.address")}>
            <Input name="addressEn" defaultValue={clinic.addressEn} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("settings.area")}>
              <Input name="areaEn" defaultValue={clinic.areaEn} />
            </Field>
            <Field label={t("settings.city")}>
              <Input name="cityEn" defaultValue={clinic.cityEn} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settings.arabic")} dense />
        <CardBody dense className="space-y-4">
          <Field label={t("settings.name")}>
            <Input dir="rtl" name="nameAr" defaultValue={clinic.nameAr} />
          </Field>
          <Field label={t("settings.tagline")}>
            <Input dir="rtl" name="taglineAr" defaultValue={clinic.taglineAr} />
          </Field>
          <Field label={t("settings.about")}>
            <Textarea dir="rtl" name="aboutAr" rows={4} defaultValue={clinic.aboutAr} />
          </Field>
          <Field label={t("settings.address")}>
            <Input dir="rtl" name="addressAr" defaultValue={clinic.addressAr} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("settings.area")}>
              <Input dir="rtl" name="areaAr" defaultValue={clinic.areaAr} />
            </Field>
            <Field label={t("settings.city")}>
              <Input dir="rtl" name="cityAr" defaultValue={clinic.cityAr} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Contact" dense />
        <CardBody dense className="grid gap-4 sm:grid-cols-2">
          <Field label={t("common.phone")}>
            <Input name="phone" defaultValue={formatPhone(clinic.phone)} />
          </Field>
          <Field label="WhatsApp">
            <Input name="whatsapp" defaultValue={formatPhone(clinic.whatsapp)} />
          </Field>
        </CardBody>
      </Card>

      <div className="lg:col-span-2 flex items-center justify-end gap-3">
        {error && <span className="text-xs font-medium text-danger">{error}</span>}
        {saved && <span className="text-xs font-medium text-success">Saved!</span>}
        <Button variant="primary" size="md" type="submit" disabled={saving}>
          {saving ? "…" : t("action.saveChanges")}
        </Button>
      </div>
    </form>
  );
}

// ─── Hours Form ───

function HoursForm({ clinic, locale, t }: { clinic: ClinicData; locale: "en" | "ar"; t: SettingsFormsProps["t"] }) {
  const [hours, setHours] = useState(clinic.hours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dayLabels = locale === "ar" ? DAYS_AR : DAYS_EN;

  const toggleDay = (day: number, enabled: boolean) => {
    setHours(hours.map((h) =>
      h.day === day
        ? enabled
          ? { ...h, open: h.open ?? "10:00", close: h.close ?? "20:00" }
          : { ...h, open: null, close: null }
        : h,
    ));
  };

  const updateTime = (day: number, field: "open" | "close", value: string) => {
    setHours(hours.map((h) => (h.day === day ? { ...h, [field]: value } : h)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateSettingsHours(hours);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title={t("settings.tab.hours")} hint={t("settings.hoursHint")} dense />
      <CardBody dense>
        <div className="space-y-2">
          {hours.map((h) => (
            <div
              key={h.day}
              className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3"
            >
              <span className="text-sm font-medium text-ink">{dayLabels[h.day]}</span>
              {h.open ? (
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={h.open}
                    onChange={(e) => updateTime(h.day, "open", e.target.value)}
                    className="rounded border border-line bg-surface px-2 py-1 text-sm tabular-nums text-ink-2"
                  />
                  <span className="text-sm text-ink-4">—</span>
                  <input
                    type="time"
                    value={h.close ?? ""}
                    onChange={(e) => updateTime(h.day, "close", e.target.value)}
                    className="rounded border border-line bg-surface px-2 py-1 text-sm tabular-nums text-ink-2"
                  />
                  <Switch checked onChange={(v) => toggleDay(h.day, v)} />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Badge tone="muted" size="sm">
                    {t("settings.closed")}
                  </Badge>
                  <Switch checked={false} onChange={(v) => toggleDay(h.day, v)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
      <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3">
        {error && <span className="text-xs font-medium text-danger">{error}</span>}
        {saved && <span className="text-xs font-medium text-success">Saved!</span>}
        <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
          {saving ? "…" : t("action.saveChanges")}
        </Button>
      </div>
    </Card>
  );
}

// ─── Rooms Manager ───

function RoomsManager({ clinic, locale, t }: { clinic: ClinicData; locale: "en" | "ar"; t: SettingsFormsProps["t"] }) {
  const [rooms, setRooms] = useState(clinic.rooms);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    try {
      await deleteRoom(id);
      setRooms(rooms.filter((r) => r.id !== id));
    } catch (e: any) {
      alert(e.message ?? "Failed to delete room");
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const body = {
        nameEn: formData.get("nameEn"),
        nameAr: formData.get("nameAr") || formData.get("nameEn"),
        supports: (formData.get("supports") as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const created = await createRoom(body);
      setRooms([...rooms, created]);
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
    } catch (e: any) {
      setError(e.message ?? "Failed to create room");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card flush>
      <CardHeader
        title={t("settings.tab.rooms")}
        dense
        action={
          <Button variant="soft" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Room"}
          </Button>
        }
      />
      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 border-b border-line px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name (English)">
              <Input name="nameEn" required />
            </Field>
            <Field label="Name (Arabic)">
              <Input name="nameAr" dir="rtl" />
            </Field>
          </div>
          <Field label="Supports (comma-separated categories)">
            <Input name="supports" placeholder="Laser, Skin, Injectables" />
          </Field>
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button variant="primary" size="sm" type="submit" disabled={saving}>
            {saving ? "…" : "Create Room"}
          </Button>
        </form>
      )}
      <div className="divide-y divide-line">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                {locale === "ar" ? room.nameAr : room.nameEn}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {room.supports.map((cat) => (
                  <CategoryBadge key={cat} category={cat as ServiceCategory} locale={locale} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="success" size="sm">Active</Badge>
              <button
                onClick={() => handleDelete(room.id)}
                className="text-xs text-danger hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-ink-3">No rooms configured.</div>
        )}
      </div>
    </Card>
  );
}

// ─── App Preview (read-only) ───

function AppPreview({ clinic, locale, t }: { clinic: ClinicData; locale: "en" | "ar"; t: SettingsFormsProps["t"] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title={t("catalog.appPreview")} hint={t("catalog.appPreviewHint")} dense />
        <CardBody dense className="space-y-4">
          <div
            className="rounded-xl p-5 text-white"
            style={{
              background: `linear-gradient(135deg, ${clinic.palette[0]}, ${clinic.palette[1]})`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">
                  {locale === "ar" ? clinic.nameAr : clinic.nameEn}
                </p>
                <p className="mt-0.5 text-sm text-white/80">
                  {locale === "ar" ? clinic.taglineAr : clinic.taglineEn}
                </p>
              </div>
              {clinic.verified ? (
                <BadgeCheck className="h-5 w-5 shrink-0 text-white/90" />
              ) : null}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current" />
                {clinic.rating.toFixed(1)}
              </span>
              <span className="text-white/70">
                {t("settings.reviews", { count: clinic.reviewCount })}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              {locale === "ar" ? clinic.areaAr : clinic.areaEn}, {locale === "ar" ? clinic.cityAr : clinic.cityEn}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-ink-3">{t("settings.amenities")}</p>
            <div className="flex flex-wrap gap-1.5">
              {clinic.specialties.map((amenity, i) => (
                <Badge key={i} tone="neutral" size="sm">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settings.language")} hint={t("settings.languageHint")} dense />
        <CardBody dense className="space-y-4">
          <Field label={t("settings.language")}>
            <div className="flex items-center gap-2">
              <Button variant="soft" size="sm">
                <Globe className="h-4 w-4" />
                English
              </Button>
              <Button variant="secondary" size="sm">
                <Globe className="h-4 w-4" />
                العربية
              </Button>
            </div>
          </Field>
          <Field label={t("common.phone")}>
            <Input defaultValue={formatPhone(clinic.phone)} readOnly />
          </Field>
          <Field label="WhatsApp">
            <Input defaultValue={formatPhone(clinic.whatsapp)} readOnly />
          </Field>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Plan Info (read-only) ───

function PlanInfo({ clinic, t }: { clinic: ClinicData; t: SettingsFormsProps["t"] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title={t("settings.plan")} hint={t("settings.planHint")} dense />
        <CardBody dense className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink">
              {clinic.plan === "growth"
                ? "Growth"
                : clinic.plan === "enterprise"
                  ? "Enterprise"
                  : "Starter"}
            </span>
            <Badge tone="brand" size="sm">
              {clinic.plan}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-xs text-ink-3">{t("settings.feeRate")}</span>
            <span className="text-sm font-semibold text-ink-2">2%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-ink-3">{t("settings.rating")}</span>
            <span className="flex items-center gap-1 text-sm font-semibold text-ink-2">
              <Star className="h-4 w-4 text-gold" />
              {clinic.rating.toFixed(1)}
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settings.tab.plan")} dense />
        <CardBody dense className="space-y-3">
          <Button variant="secondary" size="md" className="w-full">
            {t("action.copyLink")}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
