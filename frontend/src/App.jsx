import { useState } from "react";
import { classifyItem, classifyImage } from "./api";
import "./style.css";
import ParticlesBackground from "./ParticlesBackground";

// Small animated loader
const Loader = () => (
  <div className="loader-wrapper">
    <div className="scanner"></div>
    <p className="loader-text">Analyzing…</p>
  </div>
);

// Helper to safely extract { itemName, bin, co2Saved, points }
const extractData = (res) => {
  if (!res) return {};
  // backend: { success, data: {...} }
  if (res.data) return res.data;
  return res;
};

// Simple points bonus based on bin type
const pointsForBin = (bin) => {
  if (!bin) return 5;
  const b = bin.toLowerCase();
  if (b.includes("compost")) return 15;
  if (b.includes("recycle")) return 10;
  if (b.includes("hazard")) return 20;
  if (b.includes("ewaste") || b.includes("e-waste")) return 18;
  return 5;
};

function App() {
  const [label, setLabel] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [points, setPoints] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const [iotStatus, setIotStatus] = useState(null);
  const [quests, setQuests] = useState([
    { id: 1, text: "Classify 3 items correctly", reward: 15, done: false },
    { id: 2, text: "Use image classification once", reward: 10, done: false },
    { id: 3, text: "Compost at least 1 item", reward: 20, done: false },
  ]);

  // Rewards catalog
  const rewards = [
    { id: "metro", name: "Metro Pass 10% Off", cost: 120 },
    { id: "coffee", name: "Coffee Shop Coupon", cost: 80 },
    { id: "eco", name: "Eco-Store 10% Off", cost: 150 },
    { id: "badge", name: "Campus Green Hero Badge", cost: 50 },
  ];

  const addPoints = (amount) => {
    if (!amount || amount <= 0) return;
    setPoints((p) => p + amount);
  };

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  // Text classify
  const handleTextClassify = async () => {
    if (!label.trim()) return;
    setLoading(true);

    try {
      const res = await classifyItem(label);
      const data = extractData(res);
      setResult(data);

      const basePoints = data.points ?? pointsForBin(data.bin);
      addPoints(basePoints);
    } catch (err) {
      console.error("Text classify error:", err);
      alert("Text classification failed (likely rate limit). Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Image classify
  const handleImageClassify = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const res = await classifyImage(image);
      const data = extractData(res);
      setResult(data);

      const basePoints = data.points ?? pointsForBin(data.bin) + 5; // small bonus for image scan
      addPoints(basePoints);

      // Mark quest #2 as done automatically
      setQuests((qs) =>
        qs.map((q) => (q.id === 2 ? { ...q, done: true } : q))
      );
    } catch (err) {
      console.error("Image classify error:", err);
      alert("Image classification failed (likely rate limit). Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Quest completion
  const handleQuestComplete = (id) => {
    setQuests((qs) =>
      qs.map((q) =>
        q.id === id && !q.done ? { ...q, done: true } : q
      )
    );

    const quest = quests.find((q) => q.id === id);
    if (quest && !quest.done) {
      addPoints(quest.reward);
    }
  };

  // IoT Smart Bin Simulation
  const simulateIotScan = () => {
    const weights = [0.4, 0.8, 1.2, 2.0]; // in kg
    const fullness = ["30%", "55%", "78%", "92%"];
    const idx = Math.floor(Math.random() * weights.length);

    const status = {
      weight: weights[idx],
      fullness: fullness[idx],
      binId: "BIN-" + (1000 + Math.floor(Math.random() * 9000)),
    };

    setIotStatus(status);
    addPoints(25); // bonus for using smart bin
  };

  // Rewards redeem
  const handleRedeem = (reward) => {
    if (points < reward.cost) {
      alert("Not enough GreenCredits yet. Keep sorting!");
      return;
    }
    setPoints((p) => p - reward.cost);
    setSelectedReward(reward);
    setShowRewardModal(true);
  };

  const closeRewardModal = () => {
    setShowRewardModal(false);
    setSelectedReward(null);
  };

  return (
    <div className="app-root">
      <ParticlesBackground />

      {/* HEADER */}
      <header className="app-header">
        {/* CATEGORY QUICK BUTTONS */}
    <div className="category-row">
      {[
         "Plastic",
          "Paper",
         "Organic",
         "Metal",
         "Glass",
         "E-Waste",
        "General Waste"
      ].map((cat) => (
         <button
           key={cat}
           className="category-btn"
          onClick={() => setLabel(cat)}
         >
           {cat}
         </button>
      ))}
    </div>

      <div className="team-badge">Team Eagle 🦅</div>

        <div>
          <h1 className="app-title">SmartBin+</h1>
          <p className="app-subtitle">AI-powered waste sorting assistant</p>
        </div>
        <div className="points-badge">
          ⭐ {points} <span>GreenCredits</span>
        </div>
      </header>

      <main className="main-grid">
        {/* LEFT COLUMN – CLASSIFICATION */}
        <section className="column">
          {/* TEXT CARD */}
          <div className="card neon-card">
            <h2 className="card-title">Classify by Text</h2>
            <input
              className="neon-input"
              type="text"
              placeholder="Enter item name (ex: plastic bottle)…"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <button className="btn-primary" onClick={handleTextClassify}>
              Classify
            </button>
          </div>

          {/* IMAGE CARD */}
          <div className="card neon-card">
            <h2 className="card-title">Classify by Image</h2>
            <input
              className="file-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {image && (
              <div className="image-section">
                <img src={image} alt="preview" className="preview-image" />
                <button
                  className="btn-secondary"
                  onClick={handleImageClassify}
                >
                  Classify Image
                </button>
              </div>
            )}

            {loading && <Loader />}
          </div>

          {/* RESULT CARD */}
          <div className="card neon-card">
            <h2 className="card-title">Result</h2>

            {result ? (
              <>
                <p>
                  <strong>Item:</strong> {result.itemName || "—"}
                </p>
                <p>
                  <strong>Bin:</strong> {result.bin || "—"}
                </p>
                <p>
                  <strong>CO₂ Saved:</strong>{" "}
                  {result.co2Saved ? result.co2Saved + " g" : "—"}
                </p>
                <p>
                  <strong>Points (this action):</strong>{" "}
                  {result.points ?? pointsForBin(result.bin)}
                </p>
                {result.aiOutput && (
                  <div className="ai-output">
                    <strong>AI Explanation:</strong>
                    <pre>{result.aiOutput}</pre>
                  </div>
                )}
              </>
            ) : (
              <p className="muted">No classification yet. Try typing or uploading an image.</p>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN – REWARDS, MAP, IOT, QUESTS */}
        <section className="column">
          {/* REWARDS */}
          <div className="card neon-card">
            <h2 className="card-title">Rewards & GreenCredits</h2>
            <p className="muted">
              Earn points by sorting correctly, using smart bins, and completing
              eco-quests. Redeem them for real-world benefits.
            </p>

            <div className="rewards-grid">
              {rewards.map((r) => (
                <div key={r.id} className="reward-item">
                  <h3>{r.name}</h3>
                  <p className="reward-cost">{r.cost} pts</p>
                  <button
                    className="btn-outline"
                    onClick={() => handleRedeem(r)}
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MAP + IOT */}
          <div className="card neon-card">
            <h2 className="card-title">Nearby Recycling Centers</h2>
            <p className="muted">
              This demo shows a sample map area. In a real deployment, it would
              use city open data + GPS.
            </p>
            <div className="map-container">
              <iframe
                title="Recycling Map"
                className="map-frame"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.5%2C-0.1%2C51.52&layer=mapnik"
              ></iframe>
            </div>
            <a
              className="map-link"
              href="https://www.google.com/maps/search/recycling+center+near+me"
              target="_blank"
              rel="noreferrer"
            >
              Open in Maps
            </a>
          </div>

          <div className="card neon-card">
            <h2 className="card-title">IoT Smart Bin Simulation</h2>
            <p className="muted">
              Simulate scanning a connected bin with QR + weight sensors.
            </p>
            <button className="btn-secondary" onClick={simulateIotScan}>
              Scan Smart Bin
            </button>

            {iotStatus && (
              <div className="iot-status">
                <p>
                  <strong>Bin ID:</strong> {iotStatus.binId}
                </p>
                <p>
                  <strong>Weight:</strong> {iotStatus.weight} kg
                </p>
                <p>
                  <strong>Fullness:</strong> {iotStatus.fullness}
                </p>
                <p>
                  <strong>Bonus:</strong> +25 GreenCredits
                </p>
              </div>
            )}
          </div>

          {/* QUESTS */}
          <div className="card neon-card">
            <h2 className="card-title">Daily Eco-Quests</h2>
            <p className="muted">
              Complete small actions to earn extra points and keep users
              engaged.
            </p>

            <ul className="quest-list">
              {quests.map((q) => (
                <li
                  key={q.id}
                  className={`quest-item ${q.done ? "quest-done" : ""}`}
                >
                  <div>
                    <p>{q.text}</p>
                    <span className="quest-reward">+{q.reward} pts</span>
                  </div>
                  <button
                    className="btn-quest"
                    disabled={q.done}
                    onClick={() => handleQuestComplete(q.id)}
                  >
                    {q.done ? "Completed" : "Claim"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* REWARD MODAL */}
      {showRewardModal && selectedReward && (
        <div className="modal-backdrop" onClick={closeRewardModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reward Redeemed 🎉</h2>
            <p>
              You redeemed <strong>{selectedReward.name}</strong>.
            </p>
            <p className="muted">
              Show this QR code at the counter / metro kiosk in a real
              deployment.
            </p>
            <div className="qr-placeholder">
              {/* Fake QR-style pattern */}
              <div className="qr-block" />
              <div className="qr-block" />
              <div className="qr-block" />
              <div className="qr-block" />
            </div>
            <button className="btn-primary" onClick={closeRewardModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
