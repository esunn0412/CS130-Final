import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

export default function HomeScreen() {
  const color = useColorScheme();
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[color ?? "light"].background }}
      edges={["top"]}
    >
      <TouchableOpacity style={styles.signOutRow}>
        <Text style={styles.signOutText}>sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 14, flexGrow: 1 },

  // Profile card
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  profileTop: { flexDirection: "row", gap: 12 },
  emailText: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  scoreBox: { flexDirection: "row", alignItems: "baseline" },
  scoreNum: { fontSize: 28, fontWeight: "800" },
  scorePts: { fontSize: 13, fontWeight: "500" },
  signOutRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  signOutText: { fontSize: 13 },

  // Section
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },

  // Announcements card
  announcementCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  announcementItem: { padding: 16, gap: 8 },
  announcementHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  announcementTitle: { flex: 1, fontSize: 15, fontWeight: "600" },
  announcementDate: { fontSize: 12, flexShrink: 0 },
  announcementBody: { fontSize: 14, lineHeight: 20 },
  separator: { height: 1, marginHorizontal: 16 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
