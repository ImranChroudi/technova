export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "Failed to upload image");
  }

  return data.url as string;
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}