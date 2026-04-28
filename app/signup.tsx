import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";

import { FirebaseError } from "firebase/app";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function signUpHandler() {
    if (!email || !password || !name) {
      setError("please enter your name, email and password");
      return;
    }

    signUp(name.trim(), email.trim(), password)
      .then(() => {
        console.log("signed Up");
        router.push("/");
        return;
      })
      .catch((e: FirebaseError) => {
        console.log(e);
        setError(formatError(e.code));
        return;
      });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Sign up to Emory Hacks</Text>
        <TextInput
          placeholder="name"
          placeholderTextColor="#9BA1A6"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="email"
          placeholderTextColor="#9BA1A6"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="password"
          placeholderTextColor="#9BA1A6"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={signUpHandler}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.linkRow}>
          <Text onPress={() => router.push("/login")} style={styles.link}>
            Already have an account?{" "}
            <Text style={styles.linkBold}>Sign In</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatError(code: string) {
  switch (code) {
    case "auth/email-already-in-use":
      return "User with this email already exists";
    case "auth/invalid-email":
      return "Please enter a valid email address";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    default:
      return "Something went wrong, try again";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  card: {
    width: "80%",
    gap: 12,
  },
  text: {
    color: Colors.light.text,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.light.tint,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: "#F9F9F9",
  },
  error: { color: "#D32F2F", fontSize: 14, textAlign: "center" },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  linkRow: { alignItems: "center", marginTop: 8 },
  link: { color: Colors.light.tabIconDefault, fontSize: 14 },
  linkBold: { color: Colors.light.tint, fontWeight: "600" },
});
