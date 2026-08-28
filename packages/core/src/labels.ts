import type {
  BookingChannel,
  BookingStatus,
  EmployeeRole,
  EmployeeStatus,
  EntitlementStatus,
  Localized,
  OrderStatus,
  PaymentMethod,
  ServiceCategory,
} from "./types";

export const bookingStatusLabel: Record<BookingStatus, Localized> = {
  pending: { en: "Pending", ar: "بانتظار التأكيد" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  checked_in: { en: "Checked in", ar: "وصل" },
  in_progress: { en: "In session", ar: "في الجلسة" },
  completed: { en: "Completed", ar: "مكتمل" },
  no_show: { en: "No-show", ar: "لم يحضر" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
};

export const bookingChannelLabel: Record<BookingChannel, Localized> = {
  app: { en: "Mobile app", ar: "التطبيق" },
  walk_in: { en: "Walk-in", ar: "بدون موعد" },
  phone: { en: "Phone", ar: "هاتف" },
  instagram: { en: "Instagram", ar: "إنستجرام" },
};

export const employeeRoleLabel: Record<EmployeeRole, Localized> = {
  owner: { en: "Owner", ar: "المالك" },
  manager: { en: "Manager", ar: "مدير" },
  receptionist: { en: "Receptionist", ar: "استقبال" },
  doctor: { en: "Doctor", ar: "طبيب" },
  therapist: { en: "Therapist", ar: "أخصائي" },
};

export const employeeStatusLabel: Record<EmployeeStatus, Localized> = {
  active: { en: "Active", ar: "على رأس العمل" },
  on_leave: { en: "On leave", ar: "في إجازة" },
  inactive: { en: "Inactive", ar: "غير نشط" },
};

export const serviceCategoryLabel: Record<ServiceCategory, Localized> = {
  laser: { en: "Laser", ar: "ليزر" },
  skin: { en: "Skin", ar: "بشرة" },
  injectables: { en: "Injectables", ar: "حقن تجميلي" },
  body: { en: "Body", ar: "الجسم" },
  hair: { en: "Hair", ar: "الشعر" },
  nails: { en: "Nails", ar: "الأظافر" },
  consultation: { en: "Consultation", ar: "استشارة" },
};

export const paymentMethodLabel: Record<PaymentMethod, Localized> = {
  cash: { en: "Cash", ar: "نقدي" },
  card: { en: "Card (POS)", ar: "بطاقة" },
  instapay: { en: "InstaPay", ar: "إنستا باي" },
  wallet: { en: "Mobile wallet", ar: "محفظة إلكترونية" },
  app_online: { en: "App (online)", ar: "التطبيق (أونلاين)" },
};

export const orderStatusLabel: Record<OrderStatus, Localized> = {
  open: { en: "Unpaid", ar: "غير مدفوع" },
  partially_paid: { en: "Part paid", ar: "مدفوع جزئيًا" },
  paid: { en: "Paid", ar: "مدفوع" },
  refunded: { en: "Refunded", ar: "مسترد" },
  void: { en: "Void", ar: "ملغي" },
};

export const entitlementStatusLabel: Record<EntitlementStatus, Localized> = {
  active: { en: "Active", ar: "نشط" },
  completed: { en: "Finished", ar: "مكتمل" },
  expired: { en: "Expired", ar: "منتهي" },
  frozen: { en: "Frozen", ar: "موقوف" },
};

export const skinTypeLabel: Record<string, Localized> = {
  I: { en: "Fitzpatrick I", ar: "فيتزباتريك ١" },
  II: { en: "Fitzpatrick II", ar: "فيتزباتريك ٢" },
  III: { en: "Fitzpatrick III", ar: "فيتزباتريك ٣" },
  IV: { en: "Fitzpatrick IV", ar: "فيتزباتريك ٤" },
  V: { en: "Fitzpatrick V", ar: "فيتزباتريك ٥" },
  VI: { en: "Fitzpatrick VI", ar: "فيتزباتريك ٦" },
};

export const customerSourceLabel: Record<string, Localized> = {
  app: { en: "Mobile app", ar: "التطبيق" },
  walk_in: { en: "Walk-in", ar: "زيارة مباشرة" },
  instagram: { en: "Instagram", ar: "إنستجرام" },
  referral: { en: "Referral", ar: "توصية" },
  phone: { en: "Phone", ar: "هاتف" },
};

export const reactionLabel: Record<string, Localized> = {
  none: { en: "No reaction", ar: "بدون رد فعل" },
  mild_erythema: { en: "Mild erythema", ar: "احمرار بسيط" },
  swelling: { en: "Swelling", ar: "تورم" },
  other: { en: "Other", ar: "أخرى" },
};

export const payoutStatusLabel: Record<string, Localized> = {
  scheduled: { en: "Scheduled", ar: "مجدول" },
  processing: { en: "Processing", ar: "قيد التحويل" },
  paid: { en: "Transferred", ar: "تم التحويل" },
};
