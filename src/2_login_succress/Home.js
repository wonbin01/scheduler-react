import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css"; // 스타일 import

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    axios.get("/session/home", { withCredentials: true })
      .then(response => {
        setUserId(response.data.id);
        setLoading(false);
      })
      .catch(error => {
        navigate("/");
      });
  }, [navigate]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="home-container">
      <p className="welcome-message">환영합니다.</p>
      <p>ID : <strong>{userId}</strong></p>

      <div className="button-group">
        <button className="sky-button" onClick={() => navigate("/schedule")}>
          스케줄 신청
        </button>
        <button className="sky-button" onClick={() => navigate("/notice")}>
          공지사항
        </button>
      </div>
    </div>
  );
}

export default Home;
