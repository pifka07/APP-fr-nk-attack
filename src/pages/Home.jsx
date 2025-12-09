import React, { useEffect, useState } from "react";
import { base44 } from "@base44/sdk";
import { createPageUrl, navigate } from "@base44/router";

export default function StartScreen() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ========================
  //  USER LADEN
  // ========================
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
      setLoadingUser(false);
    };

    loadUser();
  }, []);

  if (loadingUser)
    return <div style={{ color: "white" }}>Loading...</div>;

  // ========================
  //  PLAY BUTTON (richtiger Login-Check)
  // ========================
  const handlePlay = async () => {
    try {
      const missionId = null; // Mission wird später im Missions-Screen gewählt.
      const difficulty = null;

      const res = await base44.actions.startRun({
        missionId,
        difficulty
      });

      // Nicht eingeloggt → Login Popup
      if (!res.success && res.reason === "NOT_LOGGED_IN") {
        navigate(createPageUrl("Login"));
        return;
      }

      // StartRun erfolgreich → Mission-Auswahl öffnen
      navigate(createPageUrl("Missions"));
    } catch (err) {
      console.error("startRun failed:", err);
    }
  };

  return (
    <div style={styles.container}>

      {/* GAME TITLE */}
      <h1 style={styles.title}>FRÄNK</h1>

      {/* PLAY BUTTON */}
      <button style={styles.playButton} onClick={handlePlay}>
        ▶ PLAY
      </button>

      {/* SHOP */}
      <button
        style={styles.button}
        onClick={() => navigate(createPageUrl("Shop"))}
      >
        🛒 SHOP
      </button>

      {/* HIGHSCORE */}
      <button
        style={styles.button}
        onClick={() => navigate(createPageUrl("Highscore"))}
      >
        🏆 HIGHSCORE
      </button>

      {/* PROFILE & STATS → nur sichtbar wenn eingeloggt */}
      {user && (
        <button
          style={styles.button}
          onClick={() => navigate(createPageUrl("ProfileStats"))}
        >
          👤 PROFILE & STATS
        </button>
      )}

      {/* LOGIN BUTTON → wenn NICHT eingeloggt */}
      {!user && (
        <button
          style={styles.loginButton}
          onClick={() => navigate(createPageUrl("Login"))}
        >
          🔒 LOGIN
        </button>
      )}

      {/* Datenschutz */}
      <a href="/privacy" style={styles.privacy}>
        Datenschutz & Erklärung
      </a>
    </div>
  );
}

// ========================
// STYLES
// ========================
const styles = {
  container: {
    textAlign: "center",
    paddingTop: "40px",
    color: "white",
  },
  title: {
    fontSize: "48px",
    marginBottom: "40px",
  },
  playButton: {
    padding: "16px 32px",
    backgroundColor: "#FFC04D",
    color: "#000",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    marginBottom: "12px",
  },
  button: {
    padding: "14px 28px",
    backgroundColor: "#444",
    color: "white",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    marginBottom: "10px",
    fontSize: "18px",
  },
  loginButton: {
    padding: "14px 28px",
    backgroundColor: "#6C63FF",
    color: "white",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    marginBottom: "20px",
  },
  privacy: {
    marginTop: "30px",
    color: "gray",
    display: "block",
    fontSize: "13px",
  },
};
