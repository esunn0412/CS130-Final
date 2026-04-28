import { useAuth } from "@/context/auth";
import { db } from "@/firebaseConfig";
import { UserDoc } from "@/types/db";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRScreen() {
  const { user } = useAuth();
  const [qrValue, setQrValue] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!user) {
      setQrValue("");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<UserDoc>;
        setQrValue(data.qrCode ?? "");
      } else {
        setQrValue("");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <View style={styles.screen}>
      <View style={styles.topContainer}>
        <Text style={styles.title}>Show your QR</Text>
      </View>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : !user ? (
          <Text style={{ color: "white" }}>
            Please sign in to view your QR code.
          </Text>
        ) : qrValue ? (
          <>
            <QRCode value={qrValue} size={0.65 * width} />
            <Text style={styles.caption}>Your personal check-in code</Text>
          </>
        ) : (
          <Text style={{ color: "white" }}>
            No QR code found for this account.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  caption: {
    textAlign: "center",
  },
  title: {
    color: "white",
    fontSize: 40,
  },
});
