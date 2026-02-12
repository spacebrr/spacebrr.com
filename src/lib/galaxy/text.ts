import type { GalaxyState } from "./types";

const TEXT = {
  titleFont: "600 76px Poppins, system-ui, sans-serif",
  subtitleFont: "500 24px Poppins, system-ui, sans-serif",
  titleShadow: 14,
  subtitleShadow: 8,
  titleGlowAlpha: 0.15,
  subtitleGlowAlpha: 0.1,
  subtitleOpacity: 0.7,
  subtitleOffset: 64,
  alphaThreshold: 0.3,
  subtitleThreshold: 0.6,
} as const;

export const drawText = (
  ctx: CanvasRenderingContext2D,
  state: GalaxyState,
  alpha: number,
  text: { title: string; subtitle?: string },
) => {
  const { centerX, centerY } = state;
  const textAlpha = Math.max(
    0,
    (alpha - TEXT.alphaThreshold) / (1 - TEXT.alphaThreshold),
  );
  if (textAlpha <= 0) return;

  ctx.font = TEXT.titleFont;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowBlur = TEXT.titleShadow;
  ctx.shadowColor = `rgba(255, 255, 255, ${TEXT.titleGlowAlpha * textAlpha})`;
  ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
  ctx.fillText(text.title, centerX, centerY);
  ctx.shadowBlur = 0;

  if (text.subtitle) {
    const taglineAlpha = Math.max(
      0,
      (alpha - TEXT.subtitleThreshold) / (1 - TEXT.subtitleThreshold),
    );
    if (taglineAlpha > 0) {
      ctx.font = TEXT.subtitleFont;
      ctx.shadowBlur = TEXT.subtitleShadow;
      ctx.shadowColor = `rgba(255, 255, 255, ${TEXT.subtitleGlowAlpha * taglineAlpha})`;
      ctx.fillStyle = `rgba(255, 255, 255, ${taglineAlpha * TEXT.subtitleOpacity})`;
      ctx.fillText(text.subtitle, centerX, centerY + TEXT.subtitleOffset);
      ctx.shadowBlur = 0;
    }
  }
};
