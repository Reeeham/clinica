export const colors = {
  primary: "#7A2F5F",
  primaryLight: "#9D4F84",
  primaryDark: "#5A1F44",
  accent: "#D4A574",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textSecondary: "#6B6B80",
  textTertiary: "#A0A0B0",
  border: "#E8E8ED",
  danger: "#DC2626",
  success: "#16A34A",
  warning: "#F59E0B",
  info: "#2563EB",
};

export function formatPrice(piastres: number): string {
  const egp = piastres / 100;
  return `EGP ${egp.toLocaleString("en-EG", { maximumFractionDigits: 0 })}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function bookingStatusColor(status: string): string {
  switch (status) {
    case "Confirmed": return colors.success;
    case "Pending": return colors.warning;
    case "Completed": return colors.info;
    case "Cancelled": return colors.danger;
    case "NoShow": return colors.danger;
    case "CheckedIn": return colors.info;
    case "InProgress": return colors.info;
    default: return colors.textSecondary;
  }
}
