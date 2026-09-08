import {
  type LucideIcon,
  Box,
  CircleHelp,
  Drama,
  Fingerprint,
  MapPin,
  PawPrint,
  Shuffle,
  Timer,
  Trophy,
  Utensils,
  Lightbulb,
  Vote,
  Zap,
} from "lucide-react";
import type { PartyGame } from "@/lib/party";
const games = {
  impostor: Fingerprint,
  likely: Vote,
  challenge: Zap,
  heads: CircleHelp,
  mime: Drama,
  five: Timer,
};
export function GameIcon({
  game,
  size = 28,
}: {
  game: PartyGame | "impostor";
  size?: number;
}) {
  const Icon = games[game];
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}
const categoryIcons: Record<string, LucideIcon> = {
  Misturado: Shuffle,
  Comidas: Utensils,
  Lugares: MapPin,
  Objetos: Box,
  Animais: PawPrint,
  "Lazer e esportes": Trophy,
  "Desafio extra": Lightbulb,
};
export function CategoryIcon({ category }: { category: string }) {
  const Icon = categoryIcons[category] ?? Box;
  return <Icon size={20} strokeWidth={1.8} aria-hidden="true" />;
}
