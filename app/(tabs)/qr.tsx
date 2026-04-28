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

import { doc, onSnapshot } from "firebase/firestore";

type ScannedUser = UserDoc & { uid: string };
type State = "scanning" | "error" | "result";

function AdminScreen({ c }: { c: (typeof Colors)["dark"] }) {
  const [permissions, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<State>("scanning");
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const isFocused = useIsFocused();

  function handleScan({ data }: { data: string }) {
    const unsubscribe = onSnapshot(
      doc(db, "users", data),
      (snap) => {
        if (!snap.exists()) return;

        const scannedUserDoc = snap.data() as UserDoc;
        setScannedUser({ uid: data, ...scannedUserDoc });
        setState("result");
      },
      (e) => {
        console.log(e);
        setState("error");
        setErrMsg(e.message);
      },
    );

    return unsubscribe;
  }

  function reset() {
    setState("scanning");
    setScannedUser(null);
    setErrMsg("");
    return;
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

  if (state === "scanning") {
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
          <View style={[styles.scanFrame, { borderColor: c.tint }]} />
          <Text style={styles.scanHint}>
            Point the camera at participant's QR code
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

  return (
    <View style={[styles.resultContainer, { backgroundColor: c.background }]}>
      {scannedUser?.email}
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
      {user && role === "admin" ? (
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
