import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/auth";
import { db } from "@/firebaseConfig";

import { collection, onSnapshot } from "firebase/firestore";

export type ScheduleItem = {
  id: string;
  done: boolean;
  location: string;
  time: string;
  title: string;
  order: number;
};

type ScheduleContextType = {
  events: ScheduleItem[];
  loading: boolean;
  error: string | null;
};

const ScheduleContext = createContext<ScheduleContextType | null>(null);

function parseTimeValue(data: Record<string, unknown>): string {
  if (typeof data.time === "string") return data.time;

  const startsAt = data.startsAt as { toDate?: () => Date } | undefined;
  if (startsAt && typeof startsAt.toDate === "function") {
    return startsAt.toDate().toLocaleString([], {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return "TBD";
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      collection(db, "schedule"),
      (snap) => {
        const nextEvents = snap.docs
          .map((docSnap) => {
            const data = docSnap.data() as Record<string, unknown>;
            return {
              id: docSnap.id,
              done: Boolean(data.done),
              location:
                typeof data.location === "string"
                  ? data.location
                  : "Location TBD",
              time: parseTimeValue(data),
              title:
                typeof data.title === "string" ? data.title : "Untitled Event",
              order:
                typeof data.order === "number"
                  ? data.order
                  : Number.MAX_SAFE_INTEGER,
            };
          })
          .sort((a, b) => {
            return compareDates(a.time, b.time);
          });

        setEvents(nextEvents);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user, authLoading]);

  return (
    <ScheduleContext.Provider value={{ events, loading, error }}>
      {children}
    </ScheduleContext.Provider>
  );
}

const getHour = (date: string) => {
  let hour = 0;
  if (date.charAt(1) === ":") {
    hour = parseInt(date.charAt(0));
  } else {
    hour = parseInt(date.substring(0, 2));
  }
  for (const lettr of date) {
    if (lettr === "P") {
      hour += 12;
    }
  }
  return hour;
};

const compareDates = (date1: string, date2: string) => {
  let hour1 = getHour(date1);
  let hour2 = getHour(date2);
  return hour1 - hour2;
};

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context)
    throw new Error("useSchedule must be used within ScheduleProvider");
  return context;
}
