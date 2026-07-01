import {
  Hand,
  Heart,
  LockKeyhole,
  MessageCircle,
  Pause,
  Sparkles,
  Stars
} from "lucide-react";
import type { ReactNode } from "react";

export const iconFor = (key: string, className = "icon"): ReactNode => {
  const props = { className, strokeWidth: 1.7 };
  switch (key) {
    case "kiss":
    case "lips":
      return <Heart {...props} />;
    case "massage":
    case "hands":
      return <Hand {...props} />;
    case "touch":
    case "neck":
      return <Hand {...props} />;
    case "whisper":
      return <MessageCircle {...props} />;
    case "sparkle":
    case "wish":
    case "anywhere":
      return <Sparkles {...props} />;
    case "pause":
      return <Pause {...props} />;
    case "consent":
      return <LockKeyhole {...props} />;
    default:
      return <Stars {...props} />;
  }
};
