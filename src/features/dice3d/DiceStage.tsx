import { Canvas } from "@react-three/fiber";
import type { DiceAction, IconKey, RollFace, Zone } from "@/shared";
import { useMediaQuery } from "@/hook/useMediaQuery";
import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Euler,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  MeshStandardMaterial,
  SRGBColorSpace
} from "three";
import type { Mesh } from "three";

// BoxGeometry material order: right, left, top, bottom, front, back.
// The selected result is rotated to the front face so users can read it directly.
const frontRotations: [number, number, number][] = [
  [0, -Math.PI / 2, 0],
  [0, Math.PI / 2, 0],
  [Math.PI / 2, 0, 0],
  [-Math.PI / 2, 0, 0],
  [0, 0, 0],
  [0, Math.PI, 0]
];
const diceSceneConfig = {
  camera: {
    position: [0, 2.25, 6.25] as [number, number, number],
    fov: 41
  },
  dice: {
    size: 1.82,
    xOffset: 1.62,
    y: 0.25,
    actionPosition: [-1.62, 0.25, 0] as [number, number, number],
    zonePosition: [1.62, 0.25, 0] as [number, number, number],
    compactActionPosition: [-1.38, 0.25, 0] as [number, number, number],
    tinyActionPosition: [-1.06, 0.2, 0] as [number, number, number],
    compactZonePosition: [1.38, 0.25, 0] as [number, number, number],
    tinyZonePosition: [1.06, 0.2, 0] as [number, number, number],
    rollLift: 0.7,
    tinySize: 1.46,
    tinyRollLift: 0.5,
    focusScale: 1.18,
    tinyFocusScale: 1.08,
    focusPosition: [0, 0.12, 0.38] as [number, number, number],
    material: {
      roughness: 0.52,
      metalness: 0.04
    }
  },
  face: {
    backgroundStops: ["#435066", "#2d384d", "#20283a"],
    edgeStrokeOpacity: "f0",
    innerStroke: "rgba(255, 255, 255, 0.2)",
    maxLabelWidth: 438,
    maxLabelLines: 2,
    maxLabelFontSize: 92,
    minLabelFontSize: 30,
    labelBaselineY: 362,
    iconY: 166
  },
  table: {
    radius: 2.96,
    scale: [1.42, 0.62, 1] as [number, number, number],
    position: [0, -0.88, 0] as [number, number, number]
  }
} as const;

const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.28);
  ctx.bezierCurveTo(x - size, y - size * 0.35, x - size * 0.42, y - size, x, y - size * 0.45);
  ctx.bezierCurveTo(x + size * 0.42, y - size, x + size, y - size * 0.35, x, y + size * 0.28);
  ctx.fill();
};

const drawHand = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - 54, y + 28);
  ctx.lineTo(x - 10, y + 70);
  ctx.lineTo(x + 58, y + 28);
  ctx.lineTo(x + 62, y - 36);
  ctx.moveTo(x + 30, y + 34);
  ctx.lineTo(x + 28, y - 78);
  ctx.moveTo(x - 2, y + 44);
  ctx.lineTo(x - 4, y - 92);
  ctx.moveTo(x - 34, y + 40);
  ctx.lineTo(x - 34, y - 66);
  ctx.stroke();
};

const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.24, y - size * 0.24);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.24, y + size * 0.24);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.24, y + size * 0.24);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x - size * 0.24, y - size * 0.24);
  ctx.closePath();
  ctx.fill();
};

const drawLips = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.rotate(-0.18);
  ctx.beginPath();
  ctx.moveTo(-104, 0);
  ctx.bezierCurveTo(-68, -52, -28, -52, 0, -14);
  ctx.bezierCurveTo(28, -52, 68, -52, 104, 0);
  ctx.bezierCurveTo(60, 30, 24, 34, 0, 18);
  ctx.bezierCurveTo(-24, 34, -60, 30, -104, 0);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.moveTo(-84, 3);
  ctx.bezierCurveTo(-36, 15, 36, 15, 84, 3);
  ctx.bezierCurveTo(36, 42, -36, 42, -84, 3);
  ctx.fill();
  ctx.restore();
};

const drawPursedLips = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.ellipse(0, 0, 48, 78, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 36, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const drawTwinCircles = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.lineWidth = 16;
  [-48, 48].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, 0, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, 0, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

const drawPeach = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 92);
  ctx.bezierCurveTo(-92, 64, -112, -28, -50, -78);
  ctx.bezierCurveTo(-24, -98, -6, -72, 0, -42);
  ctx.bezierCurveTo(6, -72, 24, -98, 50, -78);
  ctx.bezierCurveTo(112, -28, 92, 64, 0, 92);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.bezierCurveTo(-4, -4, -4, 42, 0, 78);
  ctx.stroke();
  ctx.restore();
};

const drawGenderSymbol = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.arc(-16, -8, 48, 0, Math.PI * 2);
  ctx.moveTo(18, -42);
  ctx.lineTo(82, -106);
  ctx.moveTo(82, -106);
  ctx.lineTo(82, -62);
  ctx.moveTo(82, -106);
  ctx.lineTo(38, -106);
  ctx.moveTo(-16, 40);
  ctx.lineTo(-16, 112);
  ctx.moveTo(-54, 78);
  ctx.lineTo(22, 78);
  ctx.stroke();
  ctx.restore();
};

const diceLabelFont = (size: number) => `700 ${size}px Inter, Arial`;

const fullTurn = Math.PI * 2;

const rotationTargetWithTurns = (current: number, target: number, minimumTurns: number) => {
  const minimumDistance = minimumTurns * fullTurn;
  const turns = Math.ceil((current + minimumDistance - target) / fullTurn);
  return target + Math.max(turns, minimumTurns) * fullTurn;
};

const ellipsizeToWidth = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let trimmed = text.trim();
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}...`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1).trimEnd();
  }
  return trimmed.length > 0 ? `${trimmed}...` : "...";
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  for (const word of words) {
    if (lines.length === 0) {
      lines.push(word);
      continue;
    }

    const nextLine = `${lines[lines.length - 1]} ${word}`;
    if (ctx.measureText(nextLine).width <= maxWidth) {
      lines[lines.length - 1] = nextLine;
    } else {
      lines.push(word);
    }
  }

  return lines.length > 0 ? lines : [""];
};

const labelLinesFit = (ctx: CanvasRenderingContext2D, lines: string[], maxWidth: number) =>
  lines.every((line) => ctx.measureText(line).width <= maxWidth);

const fitLabelLines = (
  ctx: CanvasRenderingContext2D,
  label: string,
  maxWidth: number,
  maxLines: number,
  maxFontSize: number,
  minFontSize: number
) => {
  const cleanLabel = label.trim() || " ";

  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
    ctx.font = diceLabelFont(fontSize);
    const lines = wrapText(ctx, cleanLabel, maxWidth);
    if (lines.length <= maxLines && labelLinesFit(ctx, lines, maxWidth)) return { lines, fontSize };
  }

  ctx.font = diceLabelFont(minFontSize);
  const lines = wrapText(ctx, cleanLabel, maxWidth);
  const visibleLines = lines.slice(0, maxLines);
  visibleLines[maxLines - 1] = ellipsizeToWidth(ctx, lines.slice(maxLines - 1).join(" "), maxWidth);
  return { lines: visibleLines, fontSize: minFontSize };
};

const drawLabel = (ctx: CanvasRenderingContext2D, label: string, color: string) => {
  const maxWidth = diceSceneConfig.face.maxLabelWidth;
  const { lines, fontSize } = fitLabelLines(
    ctx,
    label,
    maxWidth,
    diceSceneConfig.face.maxLabelLines,
    diceSceneConfig.face.maxLabelFontSize,
    diceSceneConfig.face.minLabelFontSize
  );
  const lineHeight = Math.round(fontSize * 1.15);
  const blockHeight = lineHeight * lines.length;
  const firstBaseline = diceSceneConfig.face.labelBaselineY - blockHeight / 2 + lineHeight / 2;

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = diceLabelFont(fontSize);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, index) => {
    ctx.fillText(line, 256, firstBaseline + index * lineHeight, maxWidth);
  });
  ctx.restore();
};

const drawIcon = (ctx: CanvasRenderingContext2D, iconKey: IconKey, color: string) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.translate(256, diceSceneConfig.face.iconY);

  switch (iconKey) {
    case "kiss":
      drawHeart(ctx, 0, 0, 92);
      break;
    case "lips":
      drawLips(ctx);
      break;
    case "heart":
      drawHeart(ctx, 0, 0, 92);
      break;
    case "suck":
      drawPursedLips(ctx);
      break;
    case "massage":
      drawHand(ctx, 0, 0);
      break;
    case "hands":
      drawHand(ctx, 0, 0);
      break;
    case "touch":
      drawHand(ctx, 0, 0);
      break;
    case "rub":
      drawHand(ctx, 0, 0);
      break;
    case "breasts":
      drawTwinCircles(ctx);
      break;
    case "butt":
      drawPeach(ctx);
      break;
    case "nipple":
      drawTwinCircles(ctx);
      break;
    case "genitals":
      drawGenderSymbol(ctx);
      break;
    case "whisper":
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(-24, -10, 52, 0.35, Math.PI * 1.72);
      ctx.lineTo(-60, 56);
      ctx.moveTo(40, -18);
      ctx.quadraticCurveTo(84, -6, 92, 34);
      ctx.moveTo(44, 28);
      ctx.quadraticCurveTo(76, 42, 82, 76);
      ctx.stroke();
      break;
    case "neck":
      drawBodyTop(ctx);
      break;
    case "shoulders":
      drawBodyTop(ctx);
      break;
    case "back":
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -92);
      ctx.quadraticCurveTo(-36, -34, -22, 88);
      ctx.moveTo(0, -92);
      ctx.quadraticCurveTo(36, -34, 22, 88);
      ctx.moveTo(0, -80);
      ctx.lineTo(0, 90);
      ctx.stroke();
      break;
    case "legs":
      drawLegs(ctx);
      break;
    case "thighs":
      drawLegs(ctx);
      break;
    case "ear":
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, -4, 58, Math.PI * 0.55, Math.PI * 1.45);
      ctx.quadraticCurveTo(-22, 58, 12, 84);
      ctx.moveTo(8, -40);
      ctx.quadraticCurveTo(-24, -6, 4, 30);
      ctx.stroke();
      break;
    case "pause":
      ctx.fillRect(-52, -80, 34, 160);
      ctx.fillRect(18, -80, 34, 160);
      break;
    case "consent":
      ctx.lineWidth = 16;
      ctx.strokeRect(-64, -8, 128, 92);
      ctx.beginPath();
      ctx.arc(0, -10, 42, Math.PI, Math.PI * 2);
      ctx.stroke();
      break;
    case "bite":
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, 76, 0.18, Math.PI - 0.18);
      ctx.moveTo(-48, 18);
      ctx.lineTo(-24, 54);
      ctx.lineTo(0, 18);
      ctx.lineTo(24, 54);
      ctx.lineTo(48, 18);
      ctx.stroke();
      break;
    case "tickle":
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, 74, 0, Math.PI * 2);
      ctx.moveTo(-34, -16);
      ctx.lineTo(-34, -15);
      ctx.moveTo(34, -16);
      ctx.lineTo(34, -15);
      ctx.moveTo(-36, 30);
      ctx.quadraticCurveTo(0, 62, 36, 30);
      ctx.stroke();
      break;
    case "seduce":
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -92);
      ctx.bezierCurveTo(68, -12, 42, 62, 0, 92);
      ctx.bezierCurveTo(-42, 62, -68, -12, 0, -92);
      ctx.stroke();
      break;
    case "smell":
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-70, -42);
      ctx.quadraticCurveTo(-12, -82, 46, -42);
      ctx.moveTo(-46, 2);
      ctx.quadraticCurveTo(8, -30, 70, 8);
      ctx.moveTo(-70, 52);
      ctx.quadraticCurveTo(-6, 26, 44, 66);
      ctx.stroke();
      break;
    case "sparkle":
      drawSparkle(ctx, 0, 0, 90);
      drawSparkle(ctx, 82, -66, 28);
      break;
    case "wish":
      drawSparkle(ctx, 0, 0, 90);
      drawSparkle(ctx, 82, -66, 28);
      break;
    case "anywhere":
      drawSparkle(ctx, 0, 0, 90);
      drawSparkle(ctx, 82, -66, 28);
      break;
    default:
      assertNever(iconKey);
  }

  ctx.restore();
};

const drawBodyTop = (ctx: CanvasRenderingContext2D) => {
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, -58, 42, 0, Math.PI * 2);
  ctx.moveTo(-32, -12);
  ctx.quadraticCurveTo(-26, 38, -84, 78);
  ctx.moveTo(32, -12);
  ctx.quadraticCurveTo(26, 38, 84, 78);
  ctx.stroke();
};

const drawLegs = (ctx: CanvasRenderingContext2D) => {
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-34, -78);
  ctx.lineTo(-20, 24);
  ctx.lineTo(-48, 86);
  ctx.moveTo(34, -78);
  ctx.lineTo(20, 24);
  ctx.lineTo(50, 86);
  ctx.stroke();
};

const assertNever = (value: never): never => {
  throw new Error(`Unhandled icon key: ${value}`);
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const drawFaceBackground = (ctx: CanvasRenderingContext2D, color: string) => {
  const baseGradient = ctx.createLinearGradient(0, 0, 512, 512);
  baseGradient.addColorStop(0, diceSceneConfig.face.backgroundStops[0]);
  baseGradient.addColorStop(0.46, diceSceneConfig.face.backgroundStops[1]);
  baseGradient.addColorStop(1, diceSceneConfig.face.backgroundStops[2]);
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, 512, 512);

  const focusGradient = ctx.createRadialGradient(222, 156, 24, 222, 156, 330);
  focusGradient.addColorStop(0, `${color}38`);
  focusGradient.addColorStop(0.46, "rgba(255, 255, 255, 0.07)");
  focusGradient.addColorStop(1, "rgba(8, 10, 16, 0)");
  ctx.fillStyle = focusGradient;
  ctx.fillRect(0, 0, 512, 512);

  ctx.save();
  drawRoundedRect(ctx, 28, 28, 456, 456, 42);
  ctx.strokeStyle = `${color}${diceSceneConfig.face.edgeStrokeOpacity}`;
  ctx.lineWidth = 14;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  drawRoundedRect(ctx, 48, 48, 416, 416, 30);
  ctx.strokeStyle = diceSceneConfig.face.innerStroke;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
};

const makeTexture = (label: string, iconKey: IconKey, color: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  drawFaceBackground(ctx, color);

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  drawIcon(ctx, iconKey, color);
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  drawLabel(ctx, label, color);
  ctx.restore();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const makeTableTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  const base = ctx.createRadialGradient(512, 420, 80, 512, 512, 620);
  base.addColorStop(0, "#30384b");
  base.addColorStop(0.5, "#202637");
  base.addColorStop(1, "#111622");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.globalAlpha = 0.16;
  for (let y = -1024; y < 1024; y += 26) {
    ctx.strokeStyle = y % 52 === 0 ? "#677088" : "#090c13";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y + 1024);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.12;
  for (let x = 0; x < 1024; x += 34) {
    ctx.strokeStyle = x % 68 === 0 ? "#5b657c" : "#0b0e16";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 420, 1024);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const vignette = ctx.createRadialGradient(512, 500, 260, 512, 520, 620);
  vignette.addColorStop(0, "rgba(255, 255, 255, 0.03)");
  vignette.addColorStop(0.68, "rgba(0, 0, 0, 0.08)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.42)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1024, 1024);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
};

function Die({
  faces,
  resultFace,
  color,
  position,
  rollingKey,
  size,
  rollLift
}: {
  faces: RollFace<DiceAction | Zone>[];
  resultFace?: RollFace<DiceAction | Zone>;
  color: string;
  position: [number, number, number];
  rollingKey: number;
  size: number;
  rollLift: number;
}) {
  const ref = useRef<Mesh>(null);
  const animationRef = useRef<number | null>(null);
  const materials = useMemo(
    () =>
      faces.map(
        (face) =>
          new MeshStandardMaterial({
            map: makeTexture(face.label, face.iconKey, color),
            roughness: diceSceneConfig.dice.material.roughness,
            metalness: diceSceneConfig.dice.material.metalness
          })
      ),
    [color, faces]
  );

  useEffect(() => {
    if (!ref.current || !resultFace) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const target = frontRotations[resultFace.faceIndex] ?? frontRotations[4];
    const start = performance.now();
    const duration = 2450;
    const initial = ref.current.rotation.clone();
    const spin = new Euler(
      rotationTargetWithTurns(initial.x, target[0], 4),
      rotationTargetWithTurns(initial.y, target[1], 5),
      rotationTargetWithTurns(initial.z, target[2], 4)
    );

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      ref.current!.rotation.x = MathUtils.lerp(initial.x, spin.x, ease);
      ref.current!.rotation.y = MathUtils.lerp(initial.y, spin.y, ease);
      ref.current!.rotation.z = MathUtils.lerp(initial.z, spin.z, ease);
      ref.current!.position.y = position[1] + Math.sin(progress * Math.PI) * rollLift;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        ref.current!.rotation.set(spin.x, spin.y, spin.z);
        ref.current!.position.y = position[1];
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [position, resultFace, rollLift, rollingKey]);

  return (
    <mesh ref={ref} position={position} castShadow>
      <boxGeometry args={[size, size, size, 6, 6, 6]} />
      {materials.map((material, index) => (
        <primitive key={index} object={material} attach={`material-${index}`} />
      ))}
    </mesh>
  );
}

export function DiceStage({
  actionFaces,
  zoneFaces,
  actionResult,
  zoneResult,
  rollingKey,
  focusResult = false
}: {
  actionFaces: RollFace<DiceAction>[];
  zoneFaces: RollFace<Zone>[];
  actionResult?: RollFace<DiceAction>;
  zoneResult?: RollFace<Zone>;
  rollingKey: number;
  focusResult?: boolean;
}) {
  const tableTexture = useMemo(() => makeTableTexture(), []);
  const isTinyViewport = useMediaQuery("(max-width: 450px)");
  const canFocusResult = useMediaQuery("(max-width: 449px)");
  const isNarrowViewport = useMediaQuery("(max-width: 420px)");
  const isMobileViewport = useMediaQuery("(max-width: 860px)");
  const actionPosition = isTinyViewport
    ? diceSceneConfig.dice.tinyActionPosition
    : isNarrowViewport
      ? diceSceneConfig.dice.compactActionPosition
      : diceSceneConfig.dice.actionPosition;
  const zonePosition = isTinyViewport
    ? diceSceneConfig.dice.tinyZonePosition
    : isNarrowViewport
      ? diceSceneConfig.dice.compactZonePosition
      : diceSceneConfig.dice.zonePosition;
  const diceSize = isTinyViewport ? diceSceneConfig.dice.tinySize : diceSceneConfig.dice.size;
  const rollLift = isTinyViewport
    ? diceSceneConfig.dice.tinyRollLift
    : diceSceneConfig.dice.rollLift;
  const shouldFocusResult = focusResult && isMobileViewport && canFocusResult;
  const diceGroupScale = shouldFocusResult
    ? isTinyViewport
      ? diceSceneConfig.dice.tinyFocusScale
      : diceSceneConfig.dice.focusScale
    : 1;
  const diceGroupPosition = shouldFocusResult
    ? diceSceneConfig.dice.focusPosition
    : ([0, 0, 0] as const);

  return (
    <div className="dice-stage" aria-label="3D-Würfelbereich">
      <Canvas shadows camera={diceSceneConfig.camera}>
        <Suspense fallback={null}>
          <ambientLight intensity={isMobileViewport ? 0.92 : 0.74} />
          <pointLight
            position={[-3.2, 1.6, 2.8]}
            color="#ff7bb7"
            intensity={isMobileViewport ? 0.56 : 0.46}
          />
          <pointLight
            position={[3.2, 1.6, 2.8]}
            color="#66e0d1"
            intensity={isMobileViewport ? 0.52 : 0.42}
          />
          <spotLight
            position={[0, 6.4, 4.4]}
            angle={0.58}
            penumbra={0.92}
            intensity={isMobileViewport ? 4.5 : 3.9}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0008}
            shadow-radius={6}
          />
          <group position={diceGroupPosition} scale={diceGroupScale}>
            <Die
              faces={actionFaces}
              resultFace={actionResult}
              color="#ff7bb7"
              position={actionPosition}
              rollingKey={rollingKey}
              size={diceSize}
              rollLift={rollLift}
            />
            <Die
              faces={zoneFaces}
              resultFace={zoneResult}
              color="#66e0d1"
              position={zonePosition}
              rollingKey={rollingKey}
              size={diceSize}
              rollLift={rollLift}
            />
          </group>
          <group
            rotation={[-Math.PI / 2, 0, 0]}
            position={diceSceneConfig.table.position}
            scale={diceSceneConfig.table.scale}
          >
            <mesh receiveShadow>
              <circleGeometry args={[diceSceneConfig.table.radius, 96]} />
              <meshStandardMaterial
                map={tableTexture}
                color="#f7f8fc"
                roughness={0.86}
                metalness={0.02}
                transparent
                opacity={isMobileViewport ? 0.92 : 0.84}
              />
            </mesh>
            <mesh position={[0, 0, -0.012]}>
              <circleGeometry args={[diceSceneConfig.table.radius + 0.43, 96]} />
              <meshBasicMaterial
                color="#090b12"
                transparent
                opacity={isMobileViewport ? 0.2 : 0.32}
                depthWrite={false}
              />
            </mesh>
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
