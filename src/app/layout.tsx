import type { Metadata } from "next";
import { ScenarioProvider } from "@/context/ScenarioContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robo Rides Hypertuner",
  description: "Revenue optimization tool for autonomous vehicle fleets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ScenarioProvider>{children}</ScenarioProvider>
      </body>
    </html>
  );
}
