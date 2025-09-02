export async function uploadToS3(file: File, type: string, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);
  formData.append("userId", userId);

  const res = await fetch("/api/s3/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.error("Upload failed");
    return;
  }

  const data = await res.json();
  return data;
}
