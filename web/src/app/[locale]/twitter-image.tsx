import { ImageResponse } from "next/og";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const runtime = "nodejs";
export const alt = "CryptoRebate social card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function TwitterImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const tagline = t("metadata.siteTagline");
  const title = t("home.heroTitle");
  const subtitle = t("home.heroSubtitle");
  const badgeText = t("home.comparisonTitle");
  const footerText = t("home.comparisonSubtitle");
  const titleSize = title.length > 32 ? 52 : 58;
  const brandMarkUrl = `${SITE_URL}/images/brand/cryptorebate-mark.svg`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #0F172A 0%, #111827 45%, #0A63F6 100%)",
          color: "#FFFFFF",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(246,195,67,0.16), transparent 24%), radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 30%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "54px 64px 48px",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(180deg, #0A6CFF 0%, #004AC2 100%)",
                boxShadow: "0 18px 36px rgba(10,108,255,0.28)",
                overflow: "hidden",
              }}
            >
              <img
                src={brandMarkUrl}
                alt={`${SITE_NAME} mark`}
                width={74}
                height={74}
                style={{ width: "74px", height: "74px", objectFit: "cover" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.8 }}>{SITE_NAME}</div>
              <div style={{ fontSize: 20, color: "#CBD5E1", fontWeight: 600 }}>{tagline}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 940 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "fit-content",
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.14)",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {badgeText}
            </div>

            <div style={{ fontSize: titleSize, lineHeight: 1.05, fontWeight: 900, letterSpacing: -2.2 }}>
              {title}
            </div>

            <div style={{ fontSize: 28, lineHeight: 1.45, color: "#E2E8F0", maxWidth: 980 }}>{subtitle}</div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              paddingTop: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#F6C343",
                }}
              />
              <div style={{ fontSize: 22, color: "#CBD5E1", fontWeight: 600 }}>
                {footerText}
              </div>
            </div>
            <div style={{ fontSize: 20, color: "#CBD5E1", fontWeight: 700 }}>{SITE_URL.replace("https://", "")}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
