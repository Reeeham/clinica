"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { purchasePackageAction } from "@/lib/mutations";

interface PackageOption {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  validityDays: number;
}

export function SellPackageModal({ customerId, packages }: { customerId: string; packages: PackageOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedPackage) {
      setError("Please select a package");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await purchasePackageAction(customerId, selectedPackage);
      if (!result.ok) {
        setError(result.error ?? "Failed to sell package");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Failed to sell package");
    } finally {
      setSaving(false);
    }
  };

  if (packages.length === 0) return null;

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        Sell Package
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Sell Package to Customer"
        hint="Select a package to assign to this customer."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Selling…" : "Sell Package"}
            </Button>
          </>
        }
      >
        {error ? (
          <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</p>
        ) : null}
        <Field label="Package" required>
          <Select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)}>
            <option value="">Select a package…</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.nameEn} — EGP {(pkg.price / 100).toFixed(0)} ({pkg.validityDays} days)
              </option>
            ))}
          </Select>
        </Field>
      </Modal>
    </>
  );
}
