import { API } from "./constants";
import type { TextStyle } from "./types";

export async function uploadOne(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const upRes = await fetch(`${API}/upload`, { method: "POST", body: form });
  const upJson = await upRes.json();
  if (!upRes.ok) throw new Error(upJson?.error ?? "Upload failed");

  return upJson.url as string;
}

export async function createCard(
  templateId: string,
  message: string,
  textColor: string,
  textStyle: TextStyle,
  photos: any[],
  stickers: any[],
  textLayers: any[],
  revealType?: string,
): Promise<{ slug: string; editToken?: string }> {
  const res = await fetch(`${API}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      templateId,
      message,
      textColor,
      textStyle,
      photos,
      stickers,
      textLayers,
      revealType,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Create failed");

  return data;
}
