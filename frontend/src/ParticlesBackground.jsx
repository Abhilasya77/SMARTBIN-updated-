import { useEffect } from "react";
import { tsParticles } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";


function ParticlesBackground() {
  useEffect(() => {
    const loadParticles = async () => {
      await loadFull(tsParticles);

      tsParticles.load("tsparticles", {
        background: { color: "#111" },
        particles: {
          number: { value: 80 },
          size: { value: 3 },
          color: { value: "#00ff88" },
          links: {
            enable: true,
            color: "#00ff88",
            opacity: 0.5,
            distance: 120
          },
          move: { enable: true, speed: 1 }
        }
      });
    };

    loadParticles();
  }, []);

  return <div id="tsparticles" className="particles-bg"></div>;
}

export default ParticlesBackground;
