// schedulePage.js
import React from "react";
import { useNavigate } from "react-router-dom";

function SchedulePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>스케줄 관리</h2>
      <div style={styles.buttonContainer}>
        <button
          style={styles.button}
          onClick={() => navigate("/schedule/view")}
        >
          스케줄 확인
        </button>
        <button
          style={styles.button}
          onClick={() => navigate("/schedule/apply")}
        >
          스케줄 신청
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
    backgroundColor: "#e6f2ff",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    fontSize: "28px",
    marginBottom: "40px",
    color: "#01579b",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  button: {
    padding: "14px 28px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#0288d1",
    color: "white",
    fontWeight: "600",
  },
};

export default SchedulePage;
