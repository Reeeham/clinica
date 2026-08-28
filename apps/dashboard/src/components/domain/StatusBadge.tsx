import {
  bookingChannelLabel,
  bookingStatusLabel,
  entitlementStatusLabel,
  orderStatusLabel,
  paymentMethodLabel,
  serviceCategoryLabel,
  type BookingChannel,
  type BookingStatus,
  type EntitlementStatus,
  type Locale,
  type OrderStatus,
  type PaymentMethod,
  type ServiceCategory,
} from "@clinica/core";
import { Badge, type Tone } from "@/components/ui/Badge";
import { L } from "@/lib/i18n";

const STATUS_TONE: Record<BookingStatus, Tone> = {
  pending: "warn",
  confirmed: "info",
  checked_in: "brand",
  in_progress: "success",
  completed: "neutral",
  no_show: "danger",
  cancelled: "muted",
};

export function StatusBadge({
  status,
  locale,
  size = "md",
}: {
  status: BookingStatus;
  locale: Locale;
  size?: "sm" | "md";
}) {
  return (
    <Badge
      tone={STATUS_TONE[status]}
      dot
      size={size}
      pulse={status === "in_progress"}
    >
      {L(bookingStatusLabel[status], locale)}
    </Badge>
  );
}

const CHANNEL_TONE: Record<BookingChannel, Tone> = {
  app: "brand",
  walk_in: "neutral",
  phone: "info",
  instagram: "gold",
};

export function ChannelBadge({
  channel,
  locale,
}: {
  channel: BookingChannel;
  locale: Locale;
}) {
  return (
    <Badge tone={CHANNEL_TONE[channel]} size="sm">
      {L(bookingChannelLabel[channel], locale)}
    </Badge>
  );
}

const CATEGORY_TONE: Record<ServiceCategory, Tone> = {
  laser: "info",
  skin: "brand",
  injectables: "gold",
  body: "success",
  hair: "warn",
  nails: "neutral",
  consultation: "muted",
};

export function CategoryBadge({
  category,
  locale,
}: {
  category: ServiceCategory;
  locale: Locale;
}) {
  return (
    <Badge tone={CATEGORY_TONE[category]} size="sm">
      {L(serviceCategoryLabel[category], locale)}
    </Badge>
  );
}

const ORDER_TONE: Record<OrderStatus, Tone> = {
  open: "danger",
  partially_paid: "warn",
  paid: "success",
  refunded: "muted",
  void: "muted",
};

export function OrderStatusBadge({ status, locale }: { status: OrderStatus; locale: Locale }) {
  return (
    <Badge tone={ORDER_TONE[status]} size="sm">
      {L(orderStatusLabel[status], locale)}
    </Badge>
  );
}

const METHOD_TONE: Record<PaymentMethod, Tone> = {
  cash: "neutral",
  card: "info",
  instapay: "success",
  wallet: "warn",
  app_online: "brand",
};

export function MethodBadge({ method, locale }: { method: PaymentMethod; locale: Locale }) {
  return (
    <Badge tone={METHOD_TONE[method]} size="sm">
      {L(paymentMethodLabel[method], locale)}
    </Badge>
  );
}

const ENTITLEMENT_TONE: Record<EntitlementStatus, Tone> = {
  active: "success",
  completed: "neutral",
  expired: "danger",
  frozen: "warn",
};

export function EntitlementBadge({
  status,
  locale,
}: {
  status: EntitlementStatus;
  locale: Locale;
}) {
  return (
    <Badge tone={ENTITLEMENT_TONE[status]} size="sm">
      {L(entitlementStatusLabel[status], locale)}
    </Badge>
  );
}

export const bookingTone = STATUS_TONE;
