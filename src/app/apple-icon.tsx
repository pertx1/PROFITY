import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 14,
          background: "linear-gradient(135deg, #2a78d6 0%, #8b5cf6 100%)",
          padding: "0 0 34px 0",
        }}
      >
        <div style={{ width: 26, height: 42, borderRadius: 9, background: "rgba(255,255,255,0.85)" }} />
        <div style={{ width: 26, height: 74, borderRadius: 9, background: "rgba(255,255,255,0.93)" }} />
        <div style={{ width: 26, height: 108, borderRadius: 9, background: "#ffffff" }} />
      </div>
    ),
    { ...size },
  );
}
