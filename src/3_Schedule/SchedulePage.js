import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

function SchedulePage() {
  const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");

    //session 확인하는 부분 -> 만약 세션이 없으면 홈으로 이동
  useEffect(() => {
    axios.get("/api/home", { withCredentials: true })
      .then(response => {
        setUserId(response.data.id);
        setUserName(response.data.name);
        setLoading(false);
      })
      .catch(error => {
        navigate("/");
      });
  }, [navigate]);
  return (
    <div style={styles.container}>
      {/* 왼쪽 상단에 이전 버튼 */}
      <div style={styles.backButtonContainer}>
        <button style={styles.backButton} onClick={() => navigate("/api/home")}>
          ← 홈으로
        </button>
      </div>

      <h2 style={styles.title}>스케줄 관리</h2>

      <div style={styles.buttonContainer}>
        <button
          style={styles.button}
          onClick={() => navigate("/api/schedule/view")}
        >
          스케줄 확인
        </button>
        <button
          style={styles.button}
          onClick={() => navigate("/api/schedule/apply")}
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
    position: "relative",
  },
  backButtonContainer: {
    position: "absolute",
    top: "20px",
    left: "20px",
  },
  backButton: {
    padding: "8px 16px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#3399ff",
    color: "white",
    cursor: "pointer",
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
