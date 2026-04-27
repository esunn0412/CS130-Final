import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { UserDoc } from "@/types/db";

function colors(scheme: "light" | "dark") {
  const isDark = scheme === "dark";
  return {
    bg: Colors[scheme].background,
    text: Colors[scheme].text,
    icon: Colors[scheme].icon,
    tint: Colors[scheme].tint,
    muted: isDark ? "#6B7280" : "#9BA1A6",
    cardBg: isDark ? "#1E2325" : "#ffffff",
    cardBorder: isDark ? "#2C3032" : "#E8E8E8",
  };
}

export default function HomeScreen() {
  const color = useColorScheme();
  const c = colors(color ?? "light");
  const { user, role, signOut } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setUserDoc(snap.data() as UserDoc);
      }
    });

    return unsubscribe;
  }, [user]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[color ?? "light"].background }}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View
          style={[
            styles.profileCard,
            { backgroundColor: c.cardBg, borderColor: c.cardBorder },
          ]}
        >
          <View style={styles.profileTop}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.emailText, { color: c.text }]}
                numberOfLines={1}
              >
                {user?.email}
              </Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: role === "admin" ? "#DBEAFE" : "#D1FAE5",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: role === "admin" ? "#1E40AF" : "#065F46" },
                    ]}
                  >
                    {role ?? "participant"}
                  </Text>
                </View>
                {userDoc && role == "participant" && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: userDoc.checkedIn
                          ? "#D1FAE5"
                          : "#F3F4F6",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: userDoc.checkedIn ? "#065F46" : "#6B7280" },
                      ]}
                    >
                      {userDoc.checkedIn ? "Checked In" : "Not Checked In"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ alignItems: "flex-end", gap: 10 }}>
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreNum, { color: c.tint }]}>
                  {userDoc?.score ?? 0}
                </Text>
                <Text style={[styles.scorePts, { color: c.muted }]}> pts</Text>
              </View>
              <TouchableOpacity onPress={signOut} style={styles.signOutRow}>
                <Text style={[styles.signOutText, { color: c.muted }]}>
                  Sign out
                </Text>
                <IconSymbol
                  size={14}
                  name="arrow.right.square"
                  color={c.muted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 14, flexGrow: 1 },

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
});
