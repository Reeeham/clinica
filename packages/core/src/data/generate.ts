import type {
  Booking,
  BookingChannel,
  BookingStatus,
  Customer,
  CustomerSource,
  Entitlement,
  Order,
  OrderLine,
  Package,
  Payment,
  PaymentMethod,
  Payout,
  Review,
  Service,
  SessionRecord,
  SkinType,
} from "../types";
import { egp, platformFee as feeOf } from "../money";
import {
  addDays,
  addMinutes,
  parseISO,
  startOfDay,
  startOfWeek,
  toISODate,
  toISODateTime,
  today,
} from "../time";
import { ACTIVE_CLINIC_ID, clinics, rooms } from "./clinics";
import { offers, packages, services } from "./catalog";
import { employees, providers } from "./staff";
import {
  ALLERGIES,
  AVATAR_COLORS,
  CONDITIONS,
  CUSTOMER_TAGS,
  FEMALE_FIRST_NAMES,
  LAST_NAMES,
  MALE_FIRST_NAMES,
  TREATMENT_AREAS,
  createRandom,
} from "./seed";

const rng = createRandom(20260825);
const clinicId = ACTIVE_CLINIC_ID;

const TODAY = today();
const NOW_HOUR = new Date().getHours();

const pad = (n: number, width = 4) => String(n).padStart(width, "0");

/* ---------------------------------------------------------------- customers */

const CUSTOMER_COUNT = 68;
const SOURCES: CustomerSource[] = ["app", "app", "app", "walk_in", "instagram", "referral", "phone"];
const SKIN_TYPES: SkinType[] = ["II", "III", "III", "IV", "IV", "V"];

function buildCustomers(): Customer[] {
  const usedPhones = new Set<string>();
  const list: Customer[] = [];

  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const isMale = rng.chance(0.12);
    const [firstEn, firstAr] = isMale ? rng.pick(MALE_FIRST_NAMES) : rng.pick(FEMALE_FIRST_NAMES);
    const [lastEn, lastAr] = rng.pick(LAST_NAMES);

    let phone = "";
    do {
      phone = `01${rng.pick(["0", "1", "2", "5"])}${rng.int(10_000_000, 99_999_999)}`;
    } while (usedPhones.has(phone));
    usedPhones.add(phone);

    const createdAt = toISODate(addDays(TODAY, -rng.int(4, 640)));
    const tags = rng.shuffle(CUSTOMER_TAGS).slice(0, rng.int(0, 2));
    if (i < 6) tags.unshift("VIP");

    list.push({
      id: `cu_${pad(i + 1, 3)}`,
      clinicId,
      name: { en: `${firstEn} ${lastEn}`, ar: `${firstAr} ${lastAr}` },
      phone,
      email: rng.chance(0.62)
        ? `${firstEn.toLowerCase()}.${lastEn.toLowerCase().replace(/\s+/g, "")}@gmail.com`
        : null,
      gender: isMale ? "male" : "female",
      birthDate: rng.chance(0.85)
        ? `19${rng.int(78, 99)}-${pad(rng.int(1, 12), 2)}-${pad(rng.int(1, 28), 2)}`
        : null,
      skinType: rng.chance(0.9) ? rng.pick(SKIN_TYPES) : null,
      allergies: rng.chance(0.22) ? rng.shuffle(ALLERGIES).slice(0, 1) : [],
      conditions: rng.chance(0.3) ? rng.shuffle(CONDITIONS).slice(0, rng.int(1, 2)) : [],
      notes: rng.chance(0.3)
        ? rng.pick([
            "Prefers appointments after 6 PM.",
            "Sensitive to cold — skip the chiller on legs.",
            "Pays in instalments, invoice split in two.",
            "Always brings her sister — book adjacent slots.",
            "Asked to be reminded on WhatsApp only.",
          ])
        : null,
      tags,
      source: rng.pick(SOURCES),
      createdAt,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      initials: `${firstEn[0]}${lastEn.replace(/^El\s?/, "")[0]}`.toUpperCase(),
      marketingOptIn: rng.chance(0.74),
    });
  }
  return list;
}

export const customers = buildCustomers();

/** Bias bookings towards a loyal core of clients. */
const customerPool = rng.shuffle(customers);

/* -------------------------------------------------------------- entitlements */

function buildEntitlements(): Entitlement[] {
  const publishedPackages = packages.filter((p) => p.published);
  const list: Entitlement[] = [];
  let n = 0;

  for (const customer of customers) {
    if (!rng.chance(0.46)) continue;
    const pkg = rng.pickWeighted(publishedPackages);
    const purchasedAt = toISODate(
      addDays(parseISO(customer.createdAt), rng.int(0, 40)),
    );
    const expiresAt = toISODate(addDays(parseISO(purchasedAt), pkg.validityDays));
    n += 1;
    list.push({
      id: `ent_${pad(n, 3)}`,
      clinicId,
      customerId: customer.id,
      packageId: pkg.id,
      purchasedAt,
      expiresAt,
      status: "active",
      balance: pkg.items.map((item) => ({
        serviceId: item.serviceId,
        total: item.sessions,
        used: 0,
      })),
    });
  }
  return list;
}

export const entitlements = buildEntitlements();

const entitlementsByCustomer = new Map<string, Entitlement[]>();
for (const ent of entitlements) {
  const bucket = entitlementsByCustomer.get(ent.customerId) ?? [];
  bucket.push(ent);
  entitlementsByCustomer.set(ent.customerId, bucket);
}

/* ----------------------------------------------------------------- bookings */

const serviceById = new Map(services.map((s) => [s.id, s]));
const packageById = new Map(packages.map((p) => [p.id, p]));

/** Weighted pool: services appear proportionally to their real demand. */
function poolFor(specialties: string[]): Service[] {
  const pool: Service[] = [];
  for (const service of services) {
    if (!service.published) continue;
    if (!specialties.includes(service.category)) continue;
    const weight = Math.max(1, Math.round(service.demand30d / 12));
    for (let i = 0; i < weight; i++) pool.push(service);
  }
  return pool;
}

const providerPools = new Map(providers.map((p) => [p.id, poolFor(p.specialties)]));

function roomFor(category: string, index: number): string {
  const candidates = rooms.filter((r) => r.supports.includes(category as never));
  if (candidates.length === 0) return rooms[0].id;
  return candidates[index % candidates.length].id;
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const CHANNELS: BookingChannel[] = [
  "app",
  "app",
  "app",
  "app",
  "phone",
  "phone",
  "phone",
  "walk_in",
  "walk_in",
  "instagram",
];

const PAST_DAYS = 78;
const FUTURE_DAYS = 21;

interface Draft {
  booking: Booking;
  entitlement: Entitlement | null;
}

function buildBookings(): { bookings: Booking[]; sessions: SessionRecord[] } {
  const bookings: Booking[] = [];
  const sessions: SessionRecord[] = [];
  let bookingSeq = 1041;
  let sessionSeq = 0;
  let roomCursor = 0;

  for (let offset = -PAST_DAYS; offset <= FUTURE_DAYS; offset++) {
    const date = addDays(TODAY, offset);
    if (date.getDay() === 5) continue; // Friday — closed

    for (const provider of providers) {
      const shift = provider.shifts.find((s) => s.day === date.getDay());
      if (!shift) continue;
      if (provider.status !== "active") continue;

      const pool = providerPools.get(provider.id) ?? [];
      if (pool.length === 0) continue;

      let cursor = minutesOf(shift.from);
      const end = minutesOf(shift.to);
      const load = offset > 7 ? 0.34 : offset > 0 ? 0.55 : 0.68;

      while (cursor + 20 <= end) {
        if (!rng.chance(load)) {
          cursor += 15;
          continue;
        }

        const customer = rng.pickWeighted(customerPool);
        const bookedAfterJoin = parseISO(customer.createdAt) <= date;
        if (!bookedAfterJoin) {
          cursor += 15;
          continue;
        }

        // Prefer drawing down a package the customer already paid for.
        let service: Service | null = null;
        let entitlement: Entitlement | null = null;
        const owned = entitlementsByCustomer.get(customer.id) ?? [];
        for (const ent of owned) {
          if (parseISO(ent.purchasedAt) > date) continue;
          if (parseISO(ent.expiresAt) < date) continue;
          const line = ent.balance.find(
            (b) =>
              b.used < b.total &&
              provider.specialties.includes(
                (serviceById.get(b.serviceId)?.category ?? "skin") as never,
              ),
          );
          if (line && rng.chance(0.72)) {
            service = serviceById.get(line.serviceId) ?? null;
            entitlement = ent;
            break;
          }
        }
        if (!service) service = rng.pick(pool);
        if (!service) break;
        if (service.requiresDoctor && !["owner", "doctor"].includes(provider.role)) {
          service = rng.pick(pool.filter((s) => !s.requiresDoctor) ?? pool) ?? service;
          entitlement = null;
        }
        if (cursor + service.durationMin > end) {
          cursor += 15;
          continue;
        }

        const startsAt = toISODateTime(addMinutes(startOfDay(date), cursor));
        const endsAt = toISODateTime(addMinutes(startOfDay(date), cursor + service.durationMin));

        let status: BookingStatus;
        if (offset < 0) {
          const roll = rng.next();
          status = roll < 0.85 ? "completed" : roll < 0.92 ? "cancelled" : "no_show";
        } else if (offset === 0) {
          const startHour = Math.floor(cursor / 60);
          const endHour = Math.floor((cursor + service.durationMin) / 60);
          if (endHour < NOW_HOUR) status = rng.chance(0.94) ? "completed" : "no_show";
          else if (startHour <= NOW_HOUR) status = "in_progress";
          else if (startHour <= NOW_HOUR + 1) status = rng.chance(0.5) ? "checked_in" : "confirmed";
          else status = rng.chance(0.85) ? "confirmed" : "pending";
        } else {
          status = rng.chance(0.79) ? "confirmed" : "pending";
        }

        let sessionNumber: number | null = null;
        let sessionTotal: number | null = null;
        if (entitlement && status !== "cancelled") {
          const line = entitlement.balance.find((b) => b.serviceId === service!.id)!;
          line.used += 1;
          sessionNumber = line.used;
          sessionTotal = line.total;
        }

        bookingSeq += 1;
        const channel = rng.pick(CHANNELS);
        const booking: Booking = {
          id: `bk_${pad(bookingSeq)}`,
          ref: `NA-${bookingSeq}`,
          clinicId,
          customerId: customer.id,
          employeeId: provider.id,
          roomId: roomFor(service.category, roomCursor++),
          serviceId: service.id,
          entitlementId: entitlement?.id ?? null,
          startsAt,
          endsAt,
          status,
          channel,
          price: entitlement ? 0 : service.price,
          notes: rng.chance(0.14)
            ? rng.pick([
                "Requested the same technician as last time.",
                "Bringing a friend for a consultation right after.",
                "Reminder sent on WhatsApp.",
                "Rescheduled once from an earlier slot.",
              ])
            : null,
          createdAt: toISODateTime(
            addMinutes(parseISO(startsAt), -rng.int(60, 60 * 24 * 12)),
          ),
          sessionNumber,
          sessionTotal,
        };
        bookings.push(booking);

        if (status === "completed") {
          sessionSeq += 1;
          const areas = rng
            .shuffle(TREATMENT_AREAS[service.category] ?? ["Full face"])
            .slice(0, rng.int(1, 3));
          sessions.push({
            id: `sr_${pad(sessionSeq)}`,
            clinicId,
            bookingId: booking.id,
            customerId: customer.id,
            serviceId: service.id,
            employeeId: provider.id,
            performedAt: endsAt,
            areas,
            parameters: buildParameters(service),
            outcome: rng.pick([
              { en: "Tolerated well, visible improvement since last visit.", ar: "تحمّلت الجلسة جيدًا مع تحسن واضح عن آخر زيارة." },
              { en: "Good response, hair density noticeably reduced.", ar: "استجابة جيدة وكثافة الشعر أقل بشكل ملحوظ." },
              { en: "Mild sensitivity during the session, settled quickly.", ar: "حساسية بسيطة أثناء الجلسة هدأت سريعًا." },
              { en: "Skin texture smoother, pigmentation lighter.", ar: "ملمس البشرة أنعم والتصبغات أفتح." },
            ]),
            reaction: rng.chance(0.7) ? "none" : rng.chance(0.7) ? "mild_erythema" : "swelling",
            satisfaction: rng.chance(0.8) ? (rng.pick([4, 5, 5, 5, 3]) as 3 | 4 | 5) : null,
            nextDueAt:
              service.recommendedSessions > 1
                ? toISODate(addDays(parseISO(endsAt), rng.int(21, 42)))
                : null,
            notes: rng.chance(0.25)
              ? rng.pick([
                  "Advised to increase SPF use before the next session.",
                  "Reduce fluence by 1 J next time on the neck.",
                  "Recommended adding a hydrating booster next visit.",
                ])
              : null,
          });
        }

        cursor += service.durationMin + rng.int(0, 4) * 5;
      }
    }
  }

  for (const ent of entitlements) {
    const exhausted = ent.balance.every((b) => b.used >= b.total);
    if (exhausted) ent.status = "completed";
    else if (parseISO(ent.expiresAt) < TODAY) ent.status = "expired";
  }

  return { bookings, sessions };
}

function buildParameters(service: Service): Record<string, string> {
  switch (service.category) {
    case "laser":
      return {
        Fluence: `${rng.int(10, 18)} J/cm²`,
        Pulse: `${rng.int(10, 40)} ms`,
        "Spot size": `${rng.pick(["12", "15", "18"])} mm`,
        Cooling: rng.pick(["Contact 5 °C", "Contact 4 °C", "Air + contact"]),
      };
    case "skin":
      return {
        Tip: rng.pick(["Blue", "Teal", "Clear"]),
        Suction: `${rng.int(6, 14)} kPa`,
        Booster: rng.pick(["Britenol", "Dermabuilder", "Growth factor"]),
      };
    case "injectables":
      return {
        Product: rng.pick(["Botox 100 U", "Juvéderm Volift", "Restylane Kysse", "Profhilo"]),
        Units: rng.pick(["24 U", "32 U", "1.0 ml", "2.0 ml"]),
        Technique: rng.pick(["Cannula", "Needle", "Micro-bolus"]),
      };
    case "body":
      return {
        Applicators: rng.pick(["2", "4"]),
        Temperature: `${rng.int(38, 42)} °C`,
        Duration: `${rng.int(30, 60)} min`,
      };
    case "hair":
      return {
        Volume: `${rng.pick(["3", "4", "6"])} ml`,
        Depth: `${rng.int(2, 5)} mm`,
      };
    default:
      return {};
  }
}

const generated = buildBookings();
export const bookings = generated.bookings.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
export const sessionRecords = generated.sessions;

/* --------------------------------------------------------- orders & payments */

const CASH_METHODS: PaymentMethod[] = ["cash", "cash", "card", "card", "instapay", "wallet"];

function buildLedger(): { orders: Order[]; payments: Payment[] } {
  const orders: Order[] = [];
  const payments: Payment[] = [];
  let orderSeq = 0;
  let paymentSeq = 0;

  const staffIds = employees.filter((e) => e.canLogin).map((e) => e.id);

  const pushPayment = (
    order: Order,
    amount: number,
    method: PaymentMethod,
    paidAt: string,
  ) => {
    paymentSeq += 1;
    const fee = method === "app_online" ? feeOf(amount) : 0;
    payments.push({
      id: `pm_${pad(paymentSeq)}`,
      ref: `PAY-${pad(paymentSeq, 5)}`,
      clinicId,
      orderId: order.id,
      customerId: order.customerId,
      amount,
      method,
      status: "succeeded",
      platformFee: fee,
      netToClinic: amount - fee,
      paidAt,
      gatewayRef:
        method === "app_online"
          ? `pmb_${rng.int(100000, 999999)}`
          : method === "card"
            ? `pos_${rng.int(10000, 99999)}`
            : null,
      payoutId: null,
    });
  };

  // 1. Package purchases.
  for (const ent of entitlements) {
    const pkg = packageById.get(ent.packageId) as Package;
    orderSeq += 1;
    const offer = offers.find(
      (o) => o.scope.kind === "packages" && o.scope.ids.includes(pkg.id),
    );
    const useOffer = Boolean(offer) && rng.chance(0.35);
    const discount = useOffer && offer?.kind === "amount" ? offer.value : 0;
    const order: Order = {
      id: `or_${pad(orderSeq)}`,
      ref: `INV-${pad(orderSeq, 5)}`,
      clinicId,
      customerId: ent.customerId,
      bookingId: null,
      lines: [
        {
          id: `ol_${pad(orderSeq)}_1`,
          kind: "package",
          refId: pkg.id,
          name: pkg.name,
          qty: 1,
          unitPrice: pkg.price,
        },
      ],
      discount,
      offerCode: useOffer ? (offer?.code ?? null) : null,
      status: "paid",
      createdAt: `${ent.purchasedAt}T${pad(rng.int(12, 19), 2)}:${rng.pick(["00", "15", "30", "45"])}`,
      createdBy: rng.pick(staffIds),
    };
    const total = pkg.price - discount;
    const viaApp = rng.chance(0.3);
    if (!viaApp && total > egp(9000) && rng.chance(0.55)) {
      // Instalments — two payments a month apart.
      const half = Math.round(total / 2);
      order.status = "partially_paid";
      pushPayment(order, half, rng.pick(CASH_METHODS), order.createdAt);
      const second = toISODateTime(addDays(parseISO(order.createdAt), 30));
      if (parseISO(second) <= TODAY) {
        pushPayment(order, total - half, rng.pick(CASH_METHODS), second);
        order.status = "paid";
      }
    } else {
      pushPayment(order, total, viaApp ? "app_online" : rng.pick(CASH_METHODS), order.createdAt);
    }
    orders.push(order);
  }

  // 2. Single sessions that are not covered by a package.
  for (const booking of bookings) {
    if (booking.entitlementId) continue;
    const service = serviceById.get(booking.serviceId) as Service;
    const isPast = booking.status === "completed";
    const prepaid = booking.channel === "app" && ["confirmed", "checked_in", "in_progress"].includes(booking.status);
    if (!isPast && !prepaid) continue;

    orderSeq += 1;
    const laserOffer = offers.find(
      (o) => o.scope.kind === "services" && o.scope.ids.includes(service.id) && o.published,
    );
    const useOffer = Boolean(laserOffer) && booking.channel === "app" && rng.chance(0.45);
    let discount = 0;
    if (useOffer && laserOffer) {
      discount =
        laserOffer.kind === "percent"
          ? Math.round((service.price * laserOffer.value) / 100)
          : Math.min(laserOffer.value, service.price);
    }

    const lines: OrderLine[] = [
      {
        id: `ol_${pad(orderSeq)}_1`,
        kind: "service",
        refId: service.id,
        name: service.name,
        qty: 1,
        unitPrice: service.price,
      },
    ];
    // Retail add-on: aftercare products.
    if (rng.chance(0.18)) {
      lines.push({
        id: `ol_${pad(orderSeq)}_2`,
        kind: "product",
        refId: "pr_spf",
        name: { en: "Medical SPF 50", ar: "واقي شمس طبي ٥٠" },
        qty: 1,
        unitPrice: egp(850),
      });
    }

    const total = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0) - discount;
    const order: Order = {
      id: `or_${pad(orderSeq)}`,
      ref: `INV-${pad(orderSeq, 5)}`,
      clinicId,
      customerId: booking.customerId,
      bookingId: booking.id,
      lines,
      discount,
      offerCode: useOffer ? (laserOffer?.code ?? null) : null,
      status: "paid",
      createdAt: booking.startsAt,
      createdBy: rng.pick(staffIds),
    };

    if (booking.status === "completed" && rng.chance(0.05)) {
      order.status = "open"; // Outstanding balance — chased by the front desk.
      orders.push(order);
      continue;
    }

    pushPayment(
      order,
      total,
      booking.channel === "app" ? "app_online" : rng.pick(CASH_METHODS),
      booking.channel === "app" ? booking.createdAt : booking.endsAt,
    );
    orders.push(order);
  }

  return {
    orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    payments: payments.sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
  };
}

const ledger = buildLedger();
export const orders = ledger.orders;
export const payments = ledger.payments;

/* ------------------------------------------------------------------ payouts */

function buildPayouts(): Payout[] {
  const buckets = new Map<string, Payment[]>();
  for (const payment of payments) {
    if (payment.method !== "app_online") continue;
    const key = toISODate(startOfWeek(parseISO(payment.paidAt)));
    const bucket = buckets.get(key) ?? [];
    bucket.push(payment);
    buckets.set(key, bucket);
  }

  const list: Payout[] = [];
  const keys = [...buckets.keys()].sort().reverse();
  keys.forEach((key, index) => {
    const bucket = buckets.get(key)!;
    const gross = bucket.reduce((a, p) => a + p.amount, 0);
    const fees = bucket.reduce((a, p) => a + p.platformFee, 0);
    const periodEnd = toISODate(addDays(parseISO(key), 6));
    const expectedAt = toISODate(addDays(parseISO(key), 9));
    const status: Payout["status"] = index === 0 ? "scheduled" : index === 1 ? "processing" : "paid";
    const payout: Payout = {
      id: `po_${pad(list.length + 1, 3)}`,
      clinicId,
      periodStart: key,
      periodEnd,
      gross,
      fees,
      net: gross - fees,
      status,
      expectedAt,
    };
    if (status === "paid") bucket.forEach((p) => (p.payoutId = payout.id));
    list.push(payout);
  });

  return list.slice(0, 10);
}

export const payouts = buildPayouts();

/* ------------------------------------------------------------------ reviews */

function buildReviews(): Review[] {
  const list: Review[] = [];
  const pool = bookings.filter((b) => b.status === "completed" && b.channel === "app");
  let n = 0;
  for (const booking of rng.shuffle(pool).slice(0, 46)) {
    n += 1;
    const rating = rng.pick([5, 5, 5, 4, 4, 3]);
    list.push({
      id: `rv_${pad(n, 3)}`,
      clinicId,
      customerId: booking.customerId,
      serviceId: booking.serviceId,
      rating,
      body:
        rating >= 5
          ? rng.pick([
              { en: "Spotless clinic and the technician explained every step. Results after three sessions are amazing.", ar: "العيادة نظيفة جدًا والفنية شرحت كل خطوة. النتيجة بعد ثلاث جلسات رائعة." },
              { en: "Booked from the app in a minute and they were ready exactly on time.", ar: "حجزت من التطبيق في دقيقة وكانوا جاهزين في الموعد بالظبط." },
            ])
          : rating === 4
            ? rng.pick([
                { en: "Great session, only waited ten minutes past my slot.", ar: "جلسة ممتازة، انتظرت عشر دقائق فقط بعد موعدي." },
                { en: "Very professional. Parking is a bit tight in the evening.", ar: "احترافية عالية، لكن الجراج ضيق بالليل." },
              ])
            : rng.pick([
                { en: "Results are fine but the reception was busy and I had to wait.", ar: "النتيجة جيدة لكن الاستقبال كان مزدحم واضطررت للانتظار." },
              ]),
      createdAt: toISODate(addDays(parseISO(booking.endsAt), rng.int(1, 6))),
      reply: rng.chance(0.5)
        ? { en: "Thank you for the kind words — see you at your next session!", ar: "شكرًا لكلماتك الطيبة — نراك في الجلسة القادمة!" }
        : null,
    });
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const reviews = buildReviews();

/* ------------------------------------- lightweight catalogs for other clinics */

function buildMarketplaceCatalog(): { services: Service[]; packages: Package[] } {
  const extraServices: Service[] = [];
  const extraPackages: Package[] = [];

  for (const clinic of clinics.slice(1)) {
    const base = services.filter(
      (s) => s.published && clinic.specialties.includes(s.category),
    );
    const chosen = rng.shuffle(base).slice(0, Math.max(4, Math.min(7, base.length)));
    const localIds: string[] = [];

    chosen.forEach((service, index) => {
      const jitter = 0.78 + rng.next() * 0.5;
      const id = `sv_${clinic.id.replace("cl_", "")}_${index + 1}`;
      localIds.push(id);
      extraServices.push({
        ...service,
        id,
        clinicId: clinic.id,
        price: Math.round((service.price * jitter) / 5000) * 5000,
        demand30d: rng.int(8, 90),
      });
    });

    for (let i = 0; i < 2; i++) {
      const picks = rng.shuffle(localIds).slice(0, rng.int(1, 2));
      const items = picks.map((serviceId) => ({ serviceId, sessions: rng.pick([4, 6, 6, 8]) }));
      const listPrice = items.reduce((total, item) => {
        const svc = extraServices.find((s) => s.id === item.serviceId)!;
        return total + svc.price * item.sessions;
      }, 0);
      extraPackages.push({
        id: `pk_${clinic.id.replace("cl_", "")}_${i + 1}`,
        clinicId: clinic.id,
        name:
          i === 0
            ? { en: "Course Bundle", ar: "باكدج الكورس" }
            : { en: "Value Bundle", ar: "باكدج التوفير" },
        description: {
          en: "Multi-session course bundled at a lower per-session price.",
          ar: "كورس متعدد الجلسات بسعر أقل للجلسة.",
        },
        items,
        price: Math.round((listPrice * 0.82) / 5000) * 5000,
        listPrice,
        validityDays: 300,
        published: true,
        featured: i === 0,
        soldCount: rng.int(5, 120),
      });
    }
  }

  return { services: extraServices, packages: extraPackages };
}

const marketplace = buildMarketplaceCatalog();

/** Every clinic's published services — used by the client mobile app. */
export const allServices: Service[] = [...services, ...marketplace.services];
export const allPackages: Package[] = [...packages, ...marketplace.packages];
