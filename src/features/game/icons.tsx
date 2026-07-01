import {
  BadgeQuestionMark,
  Ear,
  Flame,
  Hand,
  Heart,
  LockKeyhole,
  MessageCircle,
  Pause,
  Smile,
  Sparkles,
  Stars,
  Wind
} from "lucide-react";
import type { IconKey } from "@/shared";
import type { ReactNode } from "react";

export const iconFor = (key: IconKey, className = "icon"): ReactNode => {
  const props = { className, strokeWidth: 1.7 };
  switch (key) {
    case "kiss":
    case "lips":
    case "heart":
    case "suck":
      return <Heart {...props} />;
    case "massage":
    case "hands":
    case "rub":
    case "back":
    case "shoulders":
    case "legs":
    case "thighs":
    case "breasts":
    case "butt":
      return <Hand {...props} />;
    case "touch":
    case "neck":
    case "nipple":
    case "genitals":
      return <Hand {...props} />;
    case "ear":
      return <Ear {...props} />;
    case "whisper":
      return <MessageCircle {...props} />;
    case "tickle":
      return <Smile {...props} />;
    case "seduce":
      return <Flame {...props} />;
    case "smell":
      return <Wind {...props} />;
    case "bite":
      return <BadgeQuestionMark {...props} />;
    case "sparkle":
    case "wish":
    case "anywhere":
      return <Sparkles {...props} />;
    case "pause":
      return <Pause {...props} />;
    case "consent":
      return <LockKeyhole {...props} />;
    default:
      return assertNever(key);
  }
};

function assertNever(value: never): never {
  throw new Error(`Unhandled icon key: ${value}`);
}
