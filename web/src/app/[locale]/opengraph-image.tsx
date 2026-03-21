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

export default async function OpenGraphImage({
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
  const chipLeft = t("home.comparisonRebate");
  const chipMiddle = `${t("home.comparisonSpotFee")} / ${t("home.comparisonKYC")} / ${t("exchanges.referralCode")}`;
  const chipRight = `7 ${t("nav.exchanges")}`;
  const footer = t("home.comparisonSubtitle");
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
          background: "linear-gradient(135deg, #F8FBFF 0%, #EEF4FF 55%, #E6F0FF 100%)",
          color: "#0F172A",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(10,108,255,0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(246,195,67,0.18), transparent 28%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: -120,
            right: -40,
            width: 360,
            height: 360,
            borderRadius: 80,
            background: "linear-gradient(180deg, rgba(10,108,255,0.16), rgba(0,74,194,0.04))",
            transform: "rotate(18deg)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -60,
            width: 320,
            height: 320,
            borderRadius: 72,
            background: "linear-gradient(180deg, rgba(246,195,67,0.14), rgba(246,195,67,0.03))",
            transform: "rotate(-12deg)",
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
                boxShadow: "0 18px 36px rgba(10,108,255,0.20)",
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
              <div style={{ fontSize: 20, color: "#475569", fontWeight: 600 }}>{tagline}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 900 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[chipLeft, chipMiddle, chipRight].map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid rgba(148,163,184,0.28)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#1E293B",
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>

            <div style={{ fontSize: titleSize, lineHeight: 1.05, fontWeight: 900, letterSpacing: -2.2 }}>
              {title}
            </div>

            <div
              style={{
                fontSize: 28,
                lineHeight: 1.45,
                color: "#334155",
                maxWidth: 980,
              }}
            >
              {subtitle}
            </div>
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
              <div style={{ fontSize: 22, color: "#475569", fontWeight: 600 }}>{footer}</div>
            </div>
            <div style={{ fontSize: 20, color: "#64748B", fontWeight: 700 }}>{SITE_URL.replace("https://", "")}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
