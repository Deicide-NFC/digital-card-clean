import type { Metadata } from "next";
import CardOrderBuilder from "./CardOrderBuilder";

export const metadata: Metadata = {
  title: "Design Your NFC Card | NFC Digital Card",
  description: "Customize and order a personal or business NFC digital card.",
  robots: { index: false, follow: false },
};

export default function OrderPage() {
  return <CardOrderBuilder />;
}
