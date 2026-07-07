import {
  AudioLines,
  BadgeQuestionMark,
  BicepsFlexed,
  CircleDot,
  Ear,
  Flame,
  Footprints,
  Hand,
  HandHeart,
  Heart,
  HeartPlus,
  Laugh,
  MapPin,
  Pause,
  ScanHeart,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Waves,
  Wind
} from "lucide-react";
import type { IconKey } from "@/shared";
import type { ReactNode } from "react";

export const iconFor = (key: IconKey, className = "icon"): ReactNode => {
  const props = { className, strokeWidth: 1.7 };
  switch (key) {
    case "kiss":
    case "lips":
      return <HeartPlus {...props} />;
    case "heart":
      return <Heart {...props} />;
    case "suck":
      return <CircleDot {...props} />;
    case "massage":
      return <HandHeart {...props} />;
    case "hands":
    case "touch":
      return <Hand {...props} />;
    case "rub":
      return <Waves {...props} />;
    case "back":
    case "shoulders":
      return <BicepsFlexed {...props} />;
    case "legs":
    case "thighs":
      return <Footprints {...props} />;
    case "breasts":
    case "butt":
    case "nipple":
    case "genitals":
      return <ScanHeart {...props} />;
    case "neck":
      return <CircleDot {...props} />;
    case "ear":
      return <Ear {...props} />;
    case "whisper":
      return <AudioLines {...props} />;
    case "tickle":
      return <Laugh {...props} />;
    case "seduce":
      return <Flame {...props} />;
    case "smell":
      return <Wind {...props} />;
    case "bite":
      return <BadgeQuestionMark {...props} />;
    case "sparkle":
      return <Sparkles {...props} />;
    case "wish":
      return <WandSparkles {...props} />;
    case "anywhere":
      return <MapPin {...props} />;
    case "pause":
      return <Pause {...props} />;
    case "consent":
      return <ShieldCheck {...props} />;
    default:
      return assertNever(key);
  }
};

function assertNever(value: never): never {
  throw new Error(`Unhandled icon key: ${value}`);
}
