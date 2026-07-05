import { ShieldCheck } from "lucide-react";

// @ts-expect-error
import desktopAvif from "@/assets/big-hero-dice-desktop.png?w=720;1280;1600;1920&format=avif&quality=55&as=srcset";
// @ts-expect-error
import desktopWebp from "@/assets/big-hero-dice-desktop.png?w=720;1280;1600;1920&format=webp&quality=78&as=srcset";
// @ts-expect-error
import desktopFallback from "@/assets/big-hero-dice-desktop.png?w=1600&format=png";

// @ts-expect-error
import mobileAvif from "@/assets/big-hero-dice-mobile.png?w=720;1280;1600;1920&format=avif&quality=55&as=srcset";
// @ts-expect-error
import mobileWebp from "@/assets/big-hero-dice-mobile.png?w=720;1280;1600;1920&format=webp&quality=78&as=srcset";
// @ts-expect-error
import mobileFallback from "@/assets/big-hero-dice-mobile.png?w=1600&format=png";

interface ConsentPageProps {
  onConsentClick: () => void;
}

export function ConsentPage({ onConsentClick }: ConsentPageProps) {
  return (
    <main className="consent-screen">
      <section className="hero">
        <picture className="hero-asset" aria-hidden="true">
          <source media="(max-width: 720px)" type="image/avif" srcSet={mobileAvif} sizes="100vw" />
          <source media="(max-width: 720px)" type="image/webp" srcSet={mobileWebp} sizes="100vw" />
          <source media="(max-width: 720px)" srcSet={mobileFallback} sizes="100vw" />
          <source
            type="image/avif"
            srcSet={desktopAvif}
            sizes="(min-width: 1440px) 1440px, 100vw"
          />
          <source
            type="image/webp"
            srcSet={desktopWebp}
            sizes="(min-width: 1440px) 1440px, 100vw"
          />

          <img
            data-testid="consent-hero-image"
            src={desktopFallback}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div className="hero-content">
          <p className="eyebrow">Würfel & Wünsche</p>
          <h1>Lust auf Würfel?</h1>
          <p className="lead">
            Drei Stimmungen, zwei Würfel und klare Zustimmung für intime Paarmomente.
          </p>
          <button data-testid="consent-accept" className="primary" onClick={onConsentClick}>
            <ShieldCheck size={20} /> Volljährigkeit und Zustimmung bestätigen
          </button>
        </div>
      </section>
    </main>
  );
}
