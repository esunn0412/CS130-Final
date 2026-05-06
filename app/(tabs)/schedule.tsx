import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Redirect } from "expo-router";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useSchedule } from "@/context/info";
import { useColorScheme } from "@/hooks/use-color-scheme.web";

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? "light"];
  const { user, loading: authLoading } = useAuth();
  const { events, loading, error } = useSchedule();

  if (authLoading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.heading, { color: c.text }]}>Event Schedule</Text>
        <Text style={[styles.subheading, { color: c.muted }]}>
          Scroll to see what is done and what is next.
        </Text>

        {loading && (
          <View
            style={[
              styles.card,
              { backgroundColor: c.cardBg, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[styles.location, { color: c.muted }]}>
              Loading schedule...
            </Text>
          </View>
        )}

        {!loading && error && (
          <View
            style={[
              styles.card,
              { backgroundColor: c.cardBg, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[styles.location, { color: "#D32F2F" }]}>
              {`Unable to load schedule: ${error}`}
            </Text>
          </View>
        )}

        {!loading && !error && events.length === 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: c.cardBg, borderColor: c.cardBorder },
            ]}
          >
            <Text style={[styles.location, { color: c.muted }]}>
              No schedule events yet.
            </Text>
          </View>
        )}

        {!loading &&
          !error &&
          events.map((event) => (
            <View
              key={event.id}
              style={[
                styles.card,
                {
                  backgroundColor: c.cardBg,
                  borderColor: c.cardBorder,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={[styles.time, { color: c.tabIconDefault }]}>
                  {event.time}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: event.done ? "#D1FAE5" : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: event.done ? "#065F46" : "#92400E",
                      },
                    ]}
                  >
                    {event.done ? "Done" : "To Do"}
                  </Text>
                </View>
              </View>

              <Text style={[styles.title, { color: c.text }]}>
                {event.title}
              </Text>
              <Text style={[styles.location, { color: c.muted }]}>
                {event.location}
              </Text>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
  },
  subheading: {
    fontSize: 13,
    marginBottom: 6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  time: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  location: {
    fontSize: 13,
    fontWeight: "500",
  },
});
