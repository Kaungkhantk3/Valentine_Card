import { useState } from "react";
import {
  Share2,
  Download,
  Check,
  Copy,
  ArrowLeft,
  Facebook,
  MessageCircle,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SHAPES } from "./create/shapes";

const PREVIEW_W = 320;
const fontClass = {
  handwritten: "font-handwritten",
  cursive: "font-cursive",
  modern: "font-modern",
  classic: "font-classic",
  elegant: "font-cursive",
} as const;

// Helper to get editToken from localStorage
function getEditToken(slug: string): string | null {
  return localStorage.getItem(`card_${slug}_editToken`);
}

type Shape = "circle" | "heart" | "triangle" | "square";
type FitMode = "cover" | "contain";

type CardPhoto = {
  id: number;
  frameIndex: number;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  shape: Shape;
  fit?: FitMode;
};

type CardSticker = {
  id: number;
  src: string;
  cardId: number;
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  z: number;
};

type CardTextLayer = {
  id: number;
  content: string;
  color: string;
  style: "handwritten" | "cursive" | "modern" | "classic" | "elegant";
  x: number;
  y: number;
  scale: number;
  rotate: number;
  z: number;
};

type Card = {
  id: number;
  slug: string;
  templateId: string;
  photoUrl: string;
  message: string;
  textColor?: string;
  textStyle?: "handwritten" | "cursive" | "modern" | "classic" | "elegant";
  photoX: number;
  photoY: number;
  photoScale: number;
  photoRotate: number;
  shape?: Shape;
  photos?: CardPhoto[];
  stickers?: CardSticker[];
  textLayers?: CardTextLayer[];
  createdAt: string;
};

type Template = {
  id: string;
  backgroundSrc: string;
  frames?: Array<{
    kind: "path" | "rect";
    x: number;
    y: number;
    w: number;
    h: number;
    r?: number;
  }>;
};

type ExportPageProps = {
  card: Card;
  template: Template;
  getPhotoForFrame: (frameIndex: number) => CardPhoto | null;
  onExport?: () => void;
};

export default function ExportPage({
  card,
  template: tpl,
  getPhotoForFrame,
  onExport,
}: ExportPageProps) {
  const navigate = useNavigate();
  const templateSrc = tpl.backgroundSrc;
  const previewFactor = 1080 / PREVIEW_W;
  const [copied, setCopied] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareUrl = `${window.location.origin}/r/${card.slug}`;

  const handleShare = () => {
    setShowShareLink(true);
  };

  // Generate card image as canvas
  const generateCardImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      // Use same dimensions as export (1080x1920)
      canvas.width = 1080;
      canvas.height = 1920;

      // Draw background
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        context.drawImage(img, 0, 0, 1080, 1920);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      };
      img.onerror = () => reject(new Error("Failed to load template"));
      img.src = templateSrc;
    });
  };

  // Share to social media with image
  const shareToSocial = async (
    platform: "facebook" | "facebook-stories" | "twitter" | "line",
  ) => {
    setSharing(true);
    try {
      const imageBlob = await generateCardImage();

      // Upload card image to backend
      const formData = new FormData();
      formData.append("file", imageBlob, "valentine-card.png");

      // Add editToken if available for ownership verification
      const editToken = getEditToken(card.slug);
      if (editToken) {
        formData.append("editToken", editToken);
      }

      const uploadRes = await fetch(
        `${import.meta.env.VITE_API_URL}/upload-card-image`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url: imageUrl } = await uploadRes.json();

      switch (platform) {
        case "facebook":
          // Facebook Feed Share Dialog with image URL
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
          window.open(facebookUrl, "_blank", "width=600,height=400");
          break;

        case "facebook-stories":
          // Facebook Stories Share with image URL
          const storiesUrl = `https://www.facebook.com/stories/create?content_url=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent("Check out this beautiful Valentine's card! 💕")}`;
          window.open(storiesUrl, "_blank", "width=600,height=400");
          break;

        case "twitter":
          // Twitter intent with card link
          const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out this beautiful Valentine's card! 💕")}`;
          window.open(twitterUrl, "_blank", "width=600,height=400");
          break;

        case "line":
          // LINE Share with image URL
          const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(imageUrl)}`;
          window.open(lineUrl, "_blank", "width=600,height=400");
          break;
      }
    } catch (error) {
      console.error("Share failed:", error);
      alert("Failed to share card. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExport = () => {
    onExport?.();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          marginBottom: "24px",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/create")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            color: "#d81b60",
            border: "none",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "16px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fce4ec";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
          }}
        >
          <ArrowLeft size={16} />
          Back to Editor
        </button>

        <h2
          style={{
            fontSize: "14px",
            fontWeight: 600,
            textAlign: "center",
            color: "#ec407a",
            letterSpacing: "2px",
            marginBottom: "8px",
            textTransform: "uppercase",
          }}
        >
          Valentine Card
        </h2>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            textAlign: "center",
            color: "#d81b60",
            marginBottom: "32px",
          }}
        >
          Ready to Share! 💕
        </h1>
      </div>

      {/* Card Preview */}
      <div
        style={{
          width: "320px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "9 / 16",
            borderRadius: "24px",
            overflow: "visible",
            position: "relative",
            boxShadow: "0 20px 60px rgba(216, 27, 96, 0.3)",
            background: "#111",
          }}
        >
          <img
            src={templateSrc}
            alt="template"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <svg
            viewBox="0 0 1080 1920"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <defs>
              {(tpl.frames ?? []).map((fr, i) => {
                const p = getPhotoForFrame(i);
                if (!p || fr.kind !== "path") return null;
                return (
                  <clipPath key={i} id={`frameClip-${i}`}>
                    <path
                      d={SHAPES[p.shape].svgPath}
                      transform={`translate(${fr.x}, ${fr.y}) scale(${
                        fr.w / 100
                      }, ${fr.h / 100})`}
                    />
                  </clipPath>
                );
              })}
            </defs>

            {(tpl.frames ?? []).map((fr, i) => {
              const p = getPhotoForFrame(i);
              if (!p || fr.kind !== "path") return null;

              const fit: FitMode = (p.fit ?? "cover") as FitMode;

              return (
                <image
                  key={i}
                  href={p.url}
                  x={fr.x}
                  y={fr.y}
                  width={fr.w}
                  height={fr.h}
                  preserveAspectRatio={
                    fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"
                  }
                  clipPath={`url(#frameClip-${i})`}
                  style={{
                    transformOrigin: `${fr.x + fr.w / 2}px ${
                      fr.y + fr.h / 2
                    }px`,
                    transform: `translate(${p.x * previewFactor}px, ${
                      p.y * previewFactor
                    }px) rotate(${p.rotate}deg) scale(${p.scale})`,
                  }}
                />
              );
            })}

            {/* Defs for free-placement photo shapes */}
            {(!tpl.frames || tpl.frames.length === 0) &&
              card.photos?.map((p) => {
                const shape = SHAPES[p.shape];
                return (
                  <clipPath
                    key={`clip-${p.id}`}
                    id={`freePlacementClip-${p.id}`}
                  >
                    <path d={shape.svgPath} transform="scale(2, 2)" />
                  </clipPath>
                );
              })}
          </svg>

          {/* Free-placement photos (for templates without frames like t7, t8) */}
          {(!tpl.frames || tpl.frames.length === 0) &&
            card.photos
              ?.slice()
              .sort((a, b) => (a.frameIndex ?? 0) - (b.frameIndex ?? 0))
              .map((p) => (
                <img
                  key={p.id}
                  src={p.url}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 200,
                    height: 200,
                    transform: `translate(calc(-50% + ${p.x * previewFactor}px), calc(-50% + ${p.y * previewFactor}px)) rotate(${p.rotate}deg) scale(${p.scale})`,
                    transformOrigin: "center",
                    pointerEvents: "none",
                    zIndex: 15,
                    objectFit: "cover",
                    clipPath: `url(#freePlacementClip-${p.id})`,
                  }}
                />
              ))}

          {/* Stickers (preview) */}
          {card.stickers
            ?.slice()
            .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
            .map((s) => (
              <img
                key={s.id}
                src={s.src}
                alt=""
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 110,
                  height: 110,
                  transform: `translate(calc(-50% + ${s.x / previewFactor}px), calc(-50% + ${s.y / previewFactor}px)) rotate(${s.rotate}deg) scale(${s.scale})`,
                  transformOrigin: "center",
                  pointerEvents: "none",
                  zIndex: 20 + (s.z ?? 0),
                }}
              />
            ))}

          {/* Text layers (preview) */}
          {card.textLayers
            ?.slice()
            .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
            .map((t) => (
              <div
                key={t.id}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${t.x / previewFactor}px), calc(-50% + ${t.y / previewFactor}px)) rotate(${t.rotate}deg) scale(${t.scale})`,
                  transformOrigin: "center",
                  textAlign: "center",
                  color: t.color,
                  fontSize: 16,
                  fontWeight: 700,
                  textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                  pointerEvents: "none",
                  zIndex: 30 + (t.z ?? 0),
                  maxWidth: "280px",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  padding: "0 8px",
                }}
                className={fontClass[t.style as keyof typeof fontClass]}
              >
                {t.content}
              </div>
            ))}

          {/* Fallback text (only if no text layers) */}
          {!card.textLayers || card.textLayers.length === 0 ? (
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 28,
                textAlign: "center",
                color: (card as any).textColor ?? "white",
                fontSize: 16,
                fontWeight: 700,
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                pointerEvents: "none",
              }}
              className={
                fontClass[
                  ((card as any).textStyle ??
                    "modern") as keyof typeof fontClass
                ]
              }
            >
              {card.message}
            </div>
          ) : null}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Share Button */}
        <button
          onClick={handleShare}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "linear-gradient(135deg, #ec407a 0%, #d81b60 100%)",
            color: "white",
            border: "none",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: "0 8px 24px rgba(216, 27, 96, 0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 12px 32px rgba(216, 27, 96, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(216, 27, 96, 0.4)";
          }}
        >
          <Share2 size={20} />
          Share Valentine Card
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "white",
            color: "#d81b60",
            border: "2px solid #ec407a",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fce4ec";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Download size={20} />
          Download as PNG
        </button>
      </div>

      {/* Share Link Modal */}
      {showShareLink && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1000,
          }}
          onClick={() => setShowShareLink(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#d81b60",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Share Your Card 💕
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              Copy this link and send it to your valentine!
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "2px solid #f8bbd0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#333",
                  background: "#fce4ec",
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  padding: "12px 24px",
                  background: copied ? "#4caf50" : "#ec407a",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "100px",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Social Media Sharing Buttons - Image Based */}
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                background: "#fff5f7",
                borderRadius: "12px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "#666",
                  marginBottom: "12px",
                  textAlign: "center",
                  fontWeight: 500,
                }}
              >
                Or share directly:
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                }}
              >
                {/* Facebook Feed */}
                <button
                  onClick={() => shareToSocial("facebook")}
                  disabled={sharing}
                  style={{
                    padding: "8px",
                    background: sharing ? "#ccc" : "#1877f2",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: sharing ? "not-allowed" : "pointer",
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s ease",
                    opacity: sharing ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!sharing) e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseOut={(e) => {
                    if (!sharing) e.currentTarget.style.opacity = "1";
                  }}
                >
                  <Facebook size={18} />
                  <span>{sharing ? "Sharing..." : "Feed"}</span>
                </button>

                {/* Facebook Stories */}
                <button
                  onClick={() => shareToSocial("facebook-stories")}
                  disabled={sharing}
                  style={{
                    padding: "8px",
                    background: sharing ? "#ccc" : "#1877f2",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: sharing ? "not-allowed" : "pointer",
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s ease",
                    opacity: sharing ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!sharing) e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseOut={(e) => {
                    if (!sharing) e.currentTarget.style.opacity = "1";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path d="M12 6v6m0 6v-6" stroke="white" strokeWidth="2" />
                  </svg>
                  <span>{sharing ? "Sharing..." : "Stories"}</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={() => shareToSocial("twitter")}
                  disabled={sharing}
                  style={{
                    padding: "8px",
                    background: sharing ? "#ccc" : "#000000",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: sharing ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s ease",
                    opacity: sharing ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!sharing) e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseOut={(e) => {
                    if (!sharing) e.currentTarget.style.opacity = "1";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9-1 9-5.5z" />
                  </svg>
                  <span>{sharing ? "Sharing..." : "X"}</span>
                </button>

                {/* LINE */}
                <button
                  onClick={() => shareToSocial("line")}
                  disabled={sharing}
                  style={{
                    padding: "8px",
                    background: sharing ? "#ccc" : "#00b900",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: sharing ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s ease",
                    opacity: sharing ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!sharing) e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseOut={(e) => {
                    if (!sharing) e.currentTarget.style.opacity = "1";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.365 9.863c.349-1.871-1.386-3.605-3.25-3.605-1.865 0-3.599 1.734-3.25 3.605-.233 1.25-1.347 2.231-2.626 2.231H6.115c-1.279 0-2.393-.981-2.626-2.231-.349-1.871 1.386-3.605 3.25-3.605 1.865 0 3.599 1.734 3.25 3.605.233 1.25 1.347 2.231 2.626 2.231h4.124c1.279 0 2.393-.981 2.626-2.231z" />
                  </svg>
                  <span>{sharing ? "Sharing..." : "LINE"}</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowShareLink(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#f5f5f5",
                color: "#666",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
