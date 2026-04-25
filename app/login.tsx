import { useAuth } from "@/context/auth";
import { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/theme";
import { FirebaseError } from "firebase/app";

export default function Login() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function signInHandler() {
    if (!email || !password) {
      setError("please enter your email and password");
      return;
    }

    signIn(email.trim(), password)
      .then(() => {
        console.log(user);
        router.push('/'); 
      })
      .catch((error: FirebaseError) => {
        console.log(error);
        console.log('logging error');
        setError(formatError(error.code));
      });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Log in to Emory Hacks</Text>
          <TextInput
            placeholder="email"
            placeholderTextColor='#9BA1A6'
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="password"
            placeholderTextColor='#9BA1A6'
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={signInHandler}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.linkRow}>
            <Text onPress={() => router.push('/signup')} style={styles.link}>New to Emory Hacks? <Text style={styles.linkBold}>Create an account</Text></Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

function formatError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email";
    case "auth/invalid-credential":
      return "Incorrect email or password"
    default:
      return "something went wrong, please try again";
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
    color: Colors.light.icon,
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
  linkRow: { alignItems: 'center', marginTop: 8 },
  link: { color: Colors.light.icon, fontSize: 14 },
  linkBold: { color: Colors.light.tint, fontWeight: '600' },
});
