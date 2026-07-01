import { Canvas } from "@react-three/fiber";
import type { DiceAction, RollFace, Zone } from "@/shared";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

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

const diceLabelFont = (size: number) => `700 ${size}px Inter, Arial`;

const ellipsizeToWidth = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let trimmed = text.trim();
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1).trimEnd();
  }
  return trimmed.length > 0 ? `${trimmed}…` : "…";
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  for (const word of words) {
    if (lines.length === 0) {
      lines.push(ellipsizeToWidth(ctx, word, maxWidth));
      continue;
    }

    const nextLine = `${lines[lines.length - 1]} ${word}`;
    if (ctx.measureText(nextLine).width <= maxWidth) {
      lines[lines.length - 1] = nextLine;
    } else {
      lines.push(ellipsizeToWidth(ctx, word, maxWidth));
    }
  }

  return lines.length > 0 ? lines : [""];
};

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
    if (lines.length <= maxLines) return { lines, fontSize };
  }

  ctx.font = diceLabelFont(minFontSize);
  const lines = wrapText(ctx, cleanLabel, maxWidth);
  const visibleLines = lines.slice(0, maxLines);
  visibleLines[maxLines - 1] = ellipsizeToWidth(ctx, lines.slice(maxLines - 1).join(" "), maxWidth);
  return { lines: visibleLines, fontSize: minFontSize };
};

const drawLabel = (ctx: CanvasRenderingContext2D, label: string, color: string) => {
  const maxWidth = 410;
  const { lines, fontSize } = fitLabelLines(ctx, label, maxWidth, 2, 40, 24);
  const lineHeight = Math.round(fontSize * 1.15);
  const blockHeight = lineHeight * lines.length;
  const firstBaseline = 356 - blockHeight / 2 + lineHeight / 2;

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

const drawIcon = (ctx: CanvasRenderingContext2D, iconKey: string, color: string) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.translate(256, 178);

  switch (iconKey) {
    case "kiss":
    case "lips":
    case "heart":
      drawHeart(ctx, 0, 0, 92);
      break;
    case "massage":
    case "hands":
    case "touch":
      drawHand(ctx, 0, 0);
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
    case "shoulders":
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, -58, 42, 0, Math.PI * 2);
      ctx.moveTo(-32, -12);
      ctx.quadraticCurveTo(-26, 38, -84, 78);
      ctx.moveTo(32, -12);
      ctx.quadraticCurveTo(26, 38, 84, 78);
      ctx.stroke();
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
    default:
      drawSparkle(ctx, 0, 0, 90);
      drawSparkle(ctx, 82, -66, 28);
  }

  ctx.restore();
};

const makeTexture = (label: string, iconKey: string, color: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#10131d";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = color;
  ctx.lineWidth = 18;
  ctx.strokeRect(26, 26, 460, 460);
  drawIcon(ctx, iconKey, color);
  drawLabel(ctx, label, color);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

function Die({
  faces,
  resultFace,
  color,
  position,
  rollingKey
}: {
  faces: RollFace<DiceAction | Zone>[];
  resultFace?: RollFace<DiceAction | Zone>;
  color: string;
  position: [number, number, number];
  rollingKey: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const animationRef = useRef<number | null>(null);
  const materials = useMemo(
    () =>
      faces.map(
        (face) =>
          new THREE.MeshStandardMaterial({
            map: makeTexture(face.label, face.iconKey, color),
            roughness: 0.38,
            metalness: 0.18
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
    const spin = new THREE.Euler(
      target[0] + Math.PI * 8,
      target[1] + Math.PI * 10,
      target[2] + Math.PI * 8
    );

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      ref.current!.rotation.x = THREE.MathUtils.lerp(initial.x, spin.x, ease);
      ref.current!.rotation.y = THREE.MathUtils.lerp(initial.y, spin.y, ease);
      ref.current!.rotation.z = THREE.MathUtils.lerp(initial.z, spin.z, ease);
      ref.current!.position.y = position[1] + Math.sin(progress * Math.PI) * 0.7;

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
  }, [position, resultFace, rollingKey]);

  return (
    <mesh ref={ref} position={position} castShadow>
      <boxGeometry args={[1.6, 1.6, 1.6, 6, 6, 6]} />
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
  rollingKey
}: {
  actionFaces: RollFace<DiceAction>[];
  zoneFaces: RollFace<Zone>[];
  actionResult?: RollFace<DiceAction>;
  zoneResult?: RollFace<Zone>;
  rollingKey: number;
}) {
  return (
    <div className="dice-stage" aria-label="3D-Würfelbereich">
      <Canvas shadows camera={{ position: [0, 2.2, 6], fov: 44 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <spotLight position={[0, 6, 4]} angle={0.6} penumbra={0.8} intensity={3} castShadow />
          <Die
            faces={actionFaces}
            resultFace={actionResult}
            color="#ff7bb7"
            position={[-1.45, 0.25, 0]}
            rollingKey={rollingKey}
          />
          <Die
            faces={zoneFaces}
            resultFace={zoneResult}
            color="#66e0d1"
            position={[1.45, 0.25, 0]}
            rollingKey={rollingKey}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]} receiveShadow>
            <circleGeometry args={[3.8, 72]} />
            <meshStandardMaterial color="#171b27" roughness={0.55} metalness={0.1} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}
