import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { CameraView, useCameraPermissions } from "expo-camera";
import { Redirect } from "expo-router";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { db } from "@/firebaseConfig";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { UserDoc } from "@/types/db";
import { useIsFocused } from "@react-navigation/native";

import { doc, getDoc, increment, updateDoc } from "firebase/firestore";

type ScannedUser = UserDoc & { uid: string };
type State = "scanning" | "loading" | "error" | "result";

function AdminScreen({ c }: { c: (typeof Colors)["dark"] }) {
  const [permissions, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>("scanning");
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [scoreUpdating, setScoreUpdating] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const isFocused = useIsFocused();

  function handleScan({ data }: { data: string }) {
    if (state !== "scanning") return;
    setState("loading");

    getDoc(doc(db, "users", data))
      .then((snap) => {
        if (!snap.exists()) return;

        const scannedUserDoc = snap.data() as UserDoc;
        setScannedUser({ uid: data, ...scannedUserDoc });
        setState("result");
      })
      .catch((e) => {
        console.log(e);
        setState("error");
        setErrMsg(e.message);
      });
    return;
  }

  function reset() {
    setState("scanning");
    setScannedUser(null);
    setErrMsg("");
    return;
  }

  function checkIn() {
    if (!scannedUser) return;
    updateDoc(doc(db, "users", scannedUser.uid), { checkedIn: true }).then(
      () => {
        setScannedUser({ ...scannedUser, checkedIn: true });
      },
    );
  }

  function updateScore(delta: number) {
    if (!scannedUser) return;
    setScoreUpdating(true);

    updateDoc(doc(db, "users", scannedUser.uid), {
      score: increment(delta),
    }).then(() => {
      // console.log(`updated score to ${newScore}`);
      setScannedUser({ ...scannedUser, score: scannedUser.score + delta });
      setScoreUpdating(false);
    });
  }

  if (!permissions) return null;

  if (!permissions.granted) {
    return (
      <View style={[styles.center, { gap: 16, padding: 32 }]}>
        <Text
          style={[styles.passLabel, { textAlign: "center", color: c.text }]}
        >
          Camera access is required to scan QR codes.
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: c.text }]}
          onPress={requestPermission}
        >
          <Text style={[styles.btnText, { color: c.cardBg }]}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === "scanning" || state === "loading") {
    return (
      <View style={{ flex: 1 }}>
        {isFocused && (
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            facing="back"
            onBarcodeScanned={handleScan}
          />
        )}
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>
            {state === "scanning"
              ? "Point the camera at participant's QR code"
              : "Fetching Participant..."}
          </Text>
        </View>
      </View>
    );
  }

  if (state === "error") {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: c.background, gap: 16, padding: 32 },
        ]}
      >
        <Text style={{ color: "#D32F2F", fontSize: 16, textAlign: "center" }}>
          {errMsg}
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: c.tint }]}
          onPress={reset}
        >
          <Text style={styles.btnText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!scannedUser) return null;
  const control = [-10, -5, 5, 10];

  return (
    <View style={[styles.resultContainer, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: c.cardBg, borderColor: c.cardBorder },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: c.text, fontSize: 17, fontWeight: "700" }}>
            {`${scannedUser.name} | ${scannedUser.email}`}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: scannedUser.checkedIn ? "#D1FAE5" : "#F3F4F6",
              },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: scannedUser.checkedIn ? "#065F46" : "#6B7280",
              }}
            >
              {scannedUser.checkedIn ? "Checked In" : "Not Checked In"}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: c.cardBorder, height: 1 }} />

        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: c.tabIconDefault,
              }}
            >
              Score
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: c.text }}>
              {scannedUser.score ?? 0}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            {control.map((delta) => {
              return (
                <TouchableOpacity
                  style={[
                    styles.btn,
                    {
                      flex: 1,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: c.cardBorder,
                      backgroundColor: delta > 0 ? "#D1FAE5" : "#FEE2E2",
                    },
                  ]}
                  onPress={() => updateScore(delta)}
                  disabled={scoreUpdating}
                >
                  <Text
                    style={[
                      styles.btnText,
                      { color: delta > 0 ? "#065F46" : "#991B1B" },
                    ]}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {!scannedUser.checkedIn && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: c.text }]}
          onPress={checkIn}
        >
          <Text
            style={{ fontSize: 15, fontWeight: "500", color: c.background }}
          >
            Check In
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: c.tint }]}
        onPress={reset}
      >
        <Text style={{ fontSize: 15, fontWeight: "500", color: c.background }}>
          Scan Another
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ParticipantScreen({ c }: { c: (typeof Colors)["dark"] }) {
  const { user } = useAuth();
  return (
    <View
      style={[
        styles.center,
        { backgroundColor: c.background, gap: 16, padding: 24 },
      ]}
    >
      <Text style={[styles.passLabel, { color: c.text }]}>Your QR Code</Text>
      <View
        style={[
          styles.qrBox,
          { backgroundColor: c.cardBg, borderColor: c.cardBorder },
        ]}
      >
        {user?.uid ? (
          <QRCode
            value={user.uid}
            size={250}
            color={c.qrFg}
            backgroundColor={c.cardBg}
          />
        ) : (
          // <ActivityIndicator color={c.tint} />
          <Text>Not ready yet!</Text>
        )}
      </View>
      <Text style={{ fontSize: 14, color: c.tabIconDefault }}>
        {user?.email}
      </Text>
      <Text style={{ fontSize: 13, color: c.muted, textAlign: "center" }}>
        Show this to the Emory Hacks team to check in.
      </Text>
    </View>
  );
}

export default function QRScreen() {
  const { user, loading, role } = useAuth();
  const c = Colors[useColorScheme() ?? "light"];

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: c.background }}
      edges={["top"]}
    >
      {user && role === "participant" ? (
        <ParticipantScreen c={c} />
      ) : (
        <AdminScreen c={c} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderRadius: 16,
    borderColor: Colors.dark.text,
  },
  scanHint: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  passLabel: {
    fontSize: 20,
    fontWeight: "700",
  },
  qrBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    gap: 14,
    justifyContent: "center",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btn: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
