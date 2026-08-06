import type { Metadata } from "next";
import { TierEditor } from "./TierEditor";

export const metadata: Metadata = {
  title: "Persona Music Archive — Tier List",
  description: "Um editor de tier list feito para classificar as 887 músicas mainline de Persona.",
};

export default function Home() {
  return <TierEditor />;
}
