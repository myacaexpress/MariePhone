"use client";

import AppShell from "@/components/AppShell";
import { TwilioProvider } from "@/components/TwilioProvider";

export default function Home() {
  return (
    <TwilioProvider>
      <AppShell />
    </TwilioProvider>
  );
}
