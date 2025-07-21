import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css"; // 스타일 import

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    axios.get("/home", { withCredentials: true })
      .then(response => {
        setUserId(response.data.id);
        setUserName(response.data.name);
        setLoading(false);
      })
      .catch(error => {
        navigate("/");
      });
  }, [navigate]);

  const handleLogout = () => {
    axios.post("/logout", {}, { withCredentials: true })
      .then(() => {
        alert("로그아웃 되었습니다.");
        navigate("/");
      })
      .catch(() => {
        alert("로그아웃 실패");
      });
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="home-container">
      {/* 🔼 왼쪽 상단 로그아웃 버튼 */}
      <button className="logout-button" onClick={handleLogout}>
        로그아웃
      </button>

      <p className="welcome-message">환영합니다.</p>
      <p>사번 : <strong>{userId}</strong></p>
      <p>이름 : <strong>{userName}</strong></p>

      {/* 🔽 버튼 그룹 */}

      <div className="button-group">
        <button className="sky-button" onClick={() => navigate("/schedulePage")}>
          스케줄
        </button>
        <button className="sky-button" onClick={() => navigate("/notice")}>
          공지사항
        </button>
      </div>
    </div>
  );
}

export default Home;
