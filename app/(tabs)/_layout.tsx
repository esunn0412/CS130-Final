import React from "react";
import { Platform, View } from "react-native";

import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function TabBarIconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        minHeight: 40,
        minWidth: 40,
      }}
    >
      {children}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.tint,
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopWidth: 0,
          minHeight: Platform.select({ ios: 72, default: 68 }),
          paddingTop: 6,
          paddingBottom: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => (
            <TabBarIconWrapper>
              <IconSymbol size={28} name="calendar" color={color} />
            </TabBarIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabBarIconWrapper>
              <IconSymbol size={28} name="house.fill" color={color} />
            </TabBarIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: "QR Pass",
          tabBarIcon: ({ color }) => (
            <TabBarIconWrapper>
              <IconSymbol size={28} name="qrcode" color={color} />
            </TabBarIconWrapper>
          ),
        }}
      />
    </Tabs>
  );
}
