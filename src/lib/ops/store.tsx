"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { calculateEstimate } from "@/lib/pricing";
import { customersFromOrders, createDemoSnapshot } from "./demo";
import type { OpsAction, OpsOrder, OpsStatus, OpsWaitlistLead } from "./types";
import { OPS_STATUS_NEXT } from "./types";

interface OpsState {
  orders: OpsOrder[];
  waitlist: OpsWaitlistLead[];
}

function withCharge(order: OpsOrder, weightLbs: number): OpsOrder {
  const estimate = calculateEstimate({
    weightLbs,
    distanceMiles: order.distanceMiles,
    tierId: order.service.tierId,
    addOnIds: order.service.addOnIds,
  });
  return {
    ...order,
    actualWeightLbs: weightLbs,
    billableWeightLbs: estimate.billableLbs,
    minimumApplied: estimate.minimumApplied,
    laundryTotal: estimate.laundryTotal,
    addOnTotal: estimate.lines
      .filter((line) => line.id !== estimate.tier.id)
      .reduce((sum, line) => sum + line.amount, 0),
    deliveryFee: estimate.deliveryFee,
    total: estimate.total,
    chargeAmount: estimate.total,
    paymentStatus: order.paymentStatus === "paid" ? "paid" : "ready",
  };
}

function reducer(state: OpsState, action: OpsAction): OpsState {
  switch (action.type) {
    case "reset": {
      const snap = createDemoSnapshot();
      return { orders: snap.orders, waitlist: snap.waitlist };
    }
    case "set-status": {
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.reference !== action.reference) return order;
          if (!OPS_STATUS_NEXT[order.status].includes(action.status)) {
            return order;
          }
          const next: OpsOrder = {
            ...order,
            status: action.status,
            statusHistory: [
              ...order.statusHistory,
              { status: action.status, at: new Date().toISOString() },
            ],
          };
          if (action.status === "collected" && next.actualWeightLbs == null) {
            return withCharge(next, next.service.estimatedWeightLbs);
          }
          if (action.status === "no-show") {
            return {
              ...next,
              paymentStatus: "cancelled-fee",
              chargeAmount: 15,
            };
          }
          return next;
        }),
      };
    }
    case "set-actual-weight": {
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.reference !== action.reference) return order;
          return withCharge(order, action.lbs);
        }),
      };
    }
    case "charge": {
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.reference !== action.reference) return order;
          if (order.paymentStatus !== "ready" && order.paymentStatus !== "cancelled-fee") {
            return order;
          }
          return { ...order, paymentStatus: "paid" };
        }),
      };
    }
    default:
      return state;
  }
}

interface OpsStoreValue {
  orders: OpsOrder[];
  waitlist: OpsWaitlistLead[];
  customers: ReturnType<typeof customersFromOrders>;
  setStatus: (reference: string, status: OpsStatus) => void;
  setActualWeight: (reference: string, lbs: number) => void;
  charge: (reference: string) => void;
  reset: () => void;
  getOrder: (reference: string) => OpsOrder | undefined;
}

const OpsStoreContext = createContext<OpsStoreValue | null>(null);

export function OpsStoreProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => createDemoSnapshot(), []);
  const [state, dispatch] = useReducer(reducer, {
    orders: seed.orders,
    waitlist: seed.waitlist,
  });

  const customers = useMemo(
    () => customersFromOrders(state.orders),
    [state.orders]
  );

  const setStatus = useCallback((reference: string, status: OpsStatus) => {
    dispatch({ type: "set-status", reference, status });
  }, []);

  const setActualWeight = useCallback((reference: string, lbs: number) => {
    dispatch({ type: "set-actual-weight", reference, lbs });
  }, []);

  const charge = useCallback((reference: string) => {
    dispatch({ type: "charge", reference });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const getOrder = useCallback(
    (reference: string) => state.orders.find((o) => o.reference === reference),
    [state.orders]
  );

  const value = useMemo(
    () => ({
      orders: state.orders,
      waitlist: state.waitlist,
      customers,
      setStatus,
      setActualWeight,
      charge,
      reset,
      getOrder,
    }),
    [
      state.orders,
      state.waitlist,
      customers,
      setStatus,
      setActualWeight,
      charge,
      reset,
      getOrder,
    ]
  );

  return (
    <OpsStoreContext.Provider value={value}>{children}</OpsStoreContext.Provider>
  );
}

export function useOpsStore(): OpsStoreValue {
  const ctx = useContext(OpsStoreContext);
  if (!ctx) {
    throw new Error("useOpsStore must be used inside OpsStoreProvider");
  }
  return ctx;
}
