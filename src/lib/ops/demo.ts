/**
 * Demo fixtures for the ops dashboard.
 *
 * Dates are relative to the shop's "today" so the Today board always has
 * something on it, whatever day you open the demo. Numbers go through the
 * real pricing helpers so totals match what the website would quote.
 */

import {
  businessDatePlus,
  businessToday,
  weekdayOf,
  type PickupWindowId,
} from "@/lib/business";
import { calculateEstimate, type AddOnId, type TurnaroundTierId } from "@/lib/pricing";
import type { OpsCustomer, OpsOrder, OpsStatus, OpsWaitlistLead } from "./types";

function windowFor(isoDate: string, prefer: "day" | "night" = "day"): PickupWindowId {
  const day = weekdayOf(isoDate) ?? 1;
  const weekend = day === 0 || day === 6;
  if (weekend) return "weekend-day";
  return prefer === "night" ? "weekday-night" : "weekday-day";
}

/** Nearest weekday on or after an offset, so subscription Tuesday stays honest. */
function weekdayOffset(startOffset: number, targetWeekday: number): string {
  for (let i = 0; i < 8; i += 1) {
    const iso = businessDatePlus(startOffset + i);
    if (weekdayOf(iso) === targetWeekday) return iso;
  }
  return businessDatePlus(startOffset);
}

function buildOrder(input: {
  reference: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  label: string;
  context: string;
  neighbourhood: string;
  lat: number;
  lon: number;
  notes: string;
  tierId: TurnaroundTierId;
  addOnIds: AddOnId[];
  estimatedWeightLbs: number;
  actualWeightLbs: number | null;
  dateOffset: number;
  preferWindow?: "day" | "night";
  fixedDate?: string;
  status: OpsStatus;
  paymentStatus: OpsOrder["paymentStatus"];
  cardLast4: string;
  instructions: string;
  receivedOffsetHours: number;
}): OpsOrder {
  const date = input.fixedDate ?? businessDatePlus(input.dateOffset);
  const distanceMiles =
    Math.round(
      Math.sqrt(
        Math.pow((input.lat - 32.7859) * 69, 2) +
          Math.pow((input.lon + 117.1272) * 54, 2)
      ) * 10
    ) / 10;

  const weightForCharge = input.actualWeightLbs ?? input.estimatedWeightLbs;
  const estimate = calculateEstimate({
    weightLbs: weightForCharge,
    distanceMiles,
    tierId: input.tierId,
    addOnIds: input.addOnIds,
  });

  const receivedAt = new Date(
    Date.now() - input.receivedOffsetHours * 60 * 60 * 1000
  ).toISOString();

  const history: { status: OpsStatus; at: string }[] = [
    { status: "booked", at: receivedAt },
  ];
  if (input.status !== "booked") {
    history.push({
      status: input.status,
      at: new Date(
        Date.now() - Math.max(1, input.receivedOffsetHours - 2) * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return {
    reference: input.reference,
    receivedAt,
    contact: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
    },
    address: {
      label: input.label,
      context: input.context,
      lat: input.lat,
      lon: input.lon,
      notes: input.notes,
    },
    service: {
      tierId: input.tierId,
      addOnIds: input.addOnIds,
      estimatedWeightLbs: input.estimatedWeightLbs,
    },
    pickup: {
      date,
      windowId: windowFor(date, input.preferWindow),
    },
    instructions: input.instructions,
    acceptedCancellationPolicy: true,
    distanceMiles,
    deliveryFee: estimate.deliveryFee,
    billableWeightLbs: estimate.billableLbs,
    minimumApplied: estimate.minimumApplied,
    laundryTotal: estimate.laundryTotal,
    addOnTotal: estimate.lines
      .filter((line) => line.id !== estimate.tier.id)
      .reduce((sum, line) => sum + line.amount, 0),
    total: estimate.total,
    status: input.status,
    actualWeightLbs: input.actualWeightLbs,
    chargeAmount: estimate.total,
    paymentStatus: input.paymentStatus,
    cardLast4: input.cardLast4,
    neighbourhood: input.neighbourhood,
    statusHistory: history,
  };
}

export function createDemoOrders(): OpsOrder[] {
  const tuesday = weekdayOffset(0, 2);

  return [
    buildOrder({
      reference: "CL-7K4M2",
      firstName: "Maya",
      lastName: "Chen",
      phone: "(619) 555-0142",
      email: "maya.chen@example.com",
      label: "8750 Costa Verde Blvd",
      context: "San Diego, CA 92122",
      neighbourhood: "UTC",
      lat: 32.8685,
      lon: -117.2109,
      notes: "Apt 312, leave by the door",
      tierId: "1-day",
      addOnIds: ["stain-treatment"],
      estimatedWeightLbs: 28,
      actualWeightLbs: null,
      dateOffset: 0,
      preferWindow: "day",
      status: "booked",
      paymentStatus: "none",
      cardLast4: "4242",
      instructions: "Grey blouse is delicate — hang dry if possible.",
      receivedOffsetHours: 6,
    }),
    buildOrder({
      reference: "CL-9P2QX",
      firstName: "Jordan",
      lastName: "Ellis",
      phone: "(619) 555-0198",
      email: "jordan.ellis@example.com",
      label: "1455 Frazee Rd",
      context: "San Diego, CA 92108",
      neighbourhood: "Mission Valley",
      lat: 32.7716,
      lon: -117.1486,
      notes: "Gate code 4412",
      tierId: "2-day",
      addOnIds: [],
      estimatedWeightLbs: 32,
      actualWeightLbs: null,
      dateOffset: 0,
      preferWindow: "day",
      status: "out-for-pickup",
      paymentStatus: "none",
      cardLast4: "1881",
      instructions: "",
      receivedOffsetHours: 18,
    }),
    buildOrder({
      reference: "CL-3H8RW",
      firstName: "Priya",
      lastName: "Shah",
      phone: "(858) 555-0110",
      email: "priya.shah@example.com",
      label: "4250 Genesee Ave",
      context: "San Diego, CA 92117",
      neighbourhood: "Clairemont",
      lat: 32.8255,
      lon: -117.1794,
      notes: "Bag by the garage",
      tierId: "express-12hr",
      addOnIds: ["fragrance"],
      estimatedWeightLbs: 18,
      actualWeightLbs: 22,
      dateOffset: 0,
      preferWindow: "night",
      status: "collected",
      paymentStatus: "ready",
      cardLast4: "5555",
      instructions: "Need it back tonight if possible.",
      receivedOffsetHours: 10,
    }),
    buildOrder({
      reference: "CL-5N1TD",
      firstName: "Marcus",
      lastName: "Torres",
      phone: "(619) 555-0177",
      email: "marcus.t@example.com",
      label: "3033 Adams Ave",
      context: "San Diego, CA 92116",
      neighbourhood: "Normal Heights",
      lat: 32.7634,
      lon: -117.1189,
      notes: "",
      tierId: "3-day",
      addOnIds: [],
      estimatedWeightLbs: 40,
      actualWeightLbs: null,
      dateOffset: 0,
      preferWindow: "night",
      status: "booked",
      paymentStatus: "none",
      cardLast4: "0015",
      instructions: "King comforter in the blue bag.",
      receivedOffsetHours: 4,
    }),
    buildOrder({
      reference: "CL-2B6VK",
      firstName: "Elena",
      lastName: "Ruiz",
      phone: "(619) 555-0133",
      email: "elena.ruiz@example.com",
      label: "2200 Plaza Blvd",
      context: "National City, CA 91950",
      neighbourhood: "National City",
      lat: 32.6781,
      lon: -117.0981,
      notes: "Buzzer 8",
      tierId: "2-day",
      addOnIds: ["stain-treatment"],
      estimatedWeightLbs: 26,
      actualWeightLbs: null,
      dateOffset: 0,
      preferWindow: "day",
      status: "no-show",
      paymentStatus: "cancelled-fee",
      cardLast4: "4444",
      instructions: "",
      receivedOffsetHours: 30,
    }),
    buildOrder({
      reference: "CL-8M4YJ",
      firstName: "Sam",
      lastName: "Okoye",
      phone: "(858) 555-0166",
      email: "sam.okoye@example.com",
      label: "1050 University Ave",
      context: "San Diego, CA 92103",
      neighbourhood: "Hillcrest",
      lat: 32.7484,
      lon: -117.1558,
      notes: "Unit B",
      tierId: "1-day",
      addOnIds: [],
      estimatedWeightLbs: 24,
      actualWeightLbs: null,
      dateOffset: 1,
      preferWindow: "day",
      status: "booked",
      paymentStatus: "none",
      cardLast4: "9012",
      instructions: "",
      receivedOffsetHours: 2,
    }),
    buildOrder({
      reference: "CL-4C9PL",
      firstName: "Hannah",
      lastName: "Brooks",
      phone: "(619) 555-0188",
      email: "hannah.b@example.com",
      label: "5500 Campanile Dr",
      context: "San Diego, CA 92182",
      neighbourhood: "College Area",
      lat: 32.7757,
      lon: -117.0719,
      notes: "Dorm front desk",
      tierId: "2-day",
      addOnIds: ["fragrance"],
      estimatedWeightLbs: 20,
      actualWeightLbs: null,
      dateOffset: 1,
      preferWindow: "night",
      status: "booked",
      paymentStatus: "none",
      cardLast4: "7733",
      instructions: "Student — flexible on return time.",
      receivedOffsetHours: 8,
    }),
    buildOrder({
      reference: "CL-6W0ZR",
      firstName: "Daniel",
      lastName: "Nguyen",
      phone: "(619) 555-0121",
      email: "dan.nguyen@example.com",
      label: "1200 Camino de la Reina",
      context: "San Diego, CA 92108",
      neighbourhood: "Mission Valley",
      lat: 32.7678,
      lon: -117.1482,
      notes: "Building C lobby",
      tierId: "subscription",
      addOnIds: [],
      estimatedWeightLbs: 30,
      actualWeightLbs: 31,
      dateOffset: 0,
      fixedDate: tuesday,
      preferWindow: "day",
      status: "washing",
      paymentStatus: "ready",
      cardLast4: "4242",
      instructions: "Weekly co-op — usual Tuesday pickup.",
      receivedOffsetHours: 48,
    }),
    buildOrder({
      reference: "CL-1Q7HS",
      firstName: "Maya",
      lastName: "Chen",
      phone: "(619) 555-0142",
      email: "maya.chen@example.com",
      label: "8750 Costa Verde Blvd",
      context: "San Diego, CA 92122",
      neighbourhood: "UTC",
      lat: 32.8685,
      lon: -117.2109,
      notes: "Apt 312",
      tierId: "2-day",
      addOnIds: [],
      estimatedWeightLbs: 25,
      actualWeightLbs: 27,
      dateOffset: -5,
      preferWindow: "day",
      status: "delivered",
      paymentStatus: "paid",
      cardLast4: "4242",
      instructions: "",
      receivedOffsetHours: 120,
    }),
    buildOrder({
      reference: "CL-0F3AB",
      firstName: "Luis",
      lastName: "Morales",
      phone: "(619) 555-0155",
      email: "luis.m@example.com",
      label: "3900 Cleveland Ave",
      context: "San Diego, CA 92103",
      neighbourhood: "Hillcrest",
      lat: 32.7492,
      lon: -117.1591,
      notes: "",
      tierId: "3-day",
      addOnIds: [],
      estimatedWeightLbs: 36,
      actualWeightLbs: 38,
      dateOffset: -3,
      preferWindow: "day",
      status: "delivered",
      paymentStatus: "paid",
      cardLast4: "2222",
      instructions: "",
      receivedOffsetHours: 90,
    }),
    buildOrder({
      reference: "CL-9T5CD",
      firstName: "Aisha",
      lastName: "Patel",
      phone: "(858) 555-0190",
      email: "aisha.patel@example.com",
      label: "6710 Miramar Rd",
      context: "San Diego, CA 92121",
      neighbourhood: "Miramar",
      lat: 32.8932,
      lon: -117.1584,
      notes: "Office suite 200",
      tierId: "1-day",
      addOnIds: ["stain-treatment", "fragrance"],
      estimatedWeightLbs: 22,
      actualWeightLbs: 24,
      dateOffset: -1,
      preferWindow: "day",
      status: "out-for-delivery",
      paymentStatus: "ready",
      cardLast4: "8888",
      instructions: "Towels for the studio.",
      receivedOffsetHours: 36,
    }),
    buildOrder({
      reference: "CL-7D2EF",
      firstName: "Chris",
      lastName: "Baker",
      phone: "(619) 555-0104",
      email: "chris.baker@example.com",
      label: "2100 El Cajon Blvd",
      context: "San Diego, CA 92104",
      neighbourhood: "North Park",
      lat: 32.7551,
      lon: -117.1289,
      notes: "Side gate",
      tierId: "2-day",
      addOnIds: [],
      estimatedWeightLbs: 29,
      actualWeightLbs: null,
      dateOffset: 2,
      preferWindow: "day",
      status: "booked",
      paymentStatus: "none",
      cardLast4: "3434",
      instructions: "",
      receivedOffsetHours: 1,
    }),
  ];
}

export function createDemoWaitlist(): OpsWaitlistLead[] {
  return [
    {
      id: "wl-1",
      receivedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      contact: {
        firstName: "Nina",
        lastName: "Volkov",
        phone: "(760) 555-0144",
        email: "nina.v@example.com",
      },
      address: {
        label: "601 Mission Ave",
        context: "Oceanside, CA 92054",
        lat: 33.1959,
        lon: -117.3795,
        notes: "",
      },
      distanceMiles: 36.6,
      neighbourhood: "Oceanside",
    },
    {
      id: "wl-2",
      receivedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      contact: {
        firstName: "Omar",
        lastName: "Hassan",
        phone: "(760) 555-0172",
        email: "omar.h@example.com",
      },
      address: {
        label: "200 E Grand Ave",
        context: "Escondido, CA 92025",
        lat: 33.1192,
        lon: -117.0864,
        notes: "",
      },
      distanceMiles: 28.4,
      neighbourhood: "Escondido",
    },
    {
      id: "wl-3",
      receivedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      contact: {
        firstName: "Grace",
        lastName: "Kim",
        phone: "(760) 555-0119",
        email: "grace.kim@example.com",
      },
      address: {
        label: "2770 Gateway Rd",
        context: "Carlsbad, CA 92009",
        lat: 33.1217,
        lon: -117.2874,
        notes: "Townhouse",
      },
      distanceMiles: 31.2,
      neighbourhood: "Carlsbad",
    },
    {
      id: "wl-4",
      receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      contact: {
        firstName: "Theo",
        lastName: "Walsh",
        phone: "(619) 555-0160",
        email: "theo.walsh@example.com",
      },
      address: {
        label: "910 Hale Ave",
        context: "Escondido, CA 92029",
        lat: 33.1011,
        lon: -117.0869,
        notes: "",
      },
      distanceMiles: 26.8,
      neighbourhood: "Escondido",
    },
  ];
}

export function customersFromOrders(orders: readonly OpsOrder[]): OpsCustomer[] {
  const map = new Map<string, OpsCustomer>();

  for (const order of orders) {
    const key = order.contact.email.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        id: key,
        firstName: order.contact.firstName,
        lastName: order.contact.lastName,
        phone: order.contact.phone,
        email: order.contact.email,
        orderCount: 1,
        lastOrderAt: order.receivedAt,
        neighbourhood: order.neighbourhood,
      });
      continue;
    }
    existing.orderCount += 1;
    if (order.receivedAt > existing.lastOrderAt) {
      existing.lastOrderAt = order.receivedAt;
      existing.neighbourhood = order.neighbourhood;
    }
  }

  return [...map.values()].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );
}

/** Seed snapshot — call once when the provider mounts. */
export function createDemoSnapshot() {
  const orders = createDemoOrders();
  return {
    generatedFor: businessToday(),
    orders,
    waitlist: createDemoWaitlist(),
    customers: customersFromOrders(orders),
  };
}
