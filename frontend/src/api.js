const API_BASE = "http://localhost:8000";

// TEXT CLASSIFICATION
export async function classifyItem(label) {
  const res = await fetch(`${API_BASE}/api/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });

  const data = await res.json();
  return data.data;
}

// IMAGE CLASSIFICATION
export async function classifyImage(imageBase64) {
  const res = await fetch(`${API_BASE}/api/classify-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64 }),
  });

  const data = await res.json();
  return data.data;
}
