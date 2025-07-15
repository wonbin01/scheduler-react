import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Notice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/notice", { withCredentials: true })
      .then(res => {
        setLoading(false);
      })
      .catch(() => {
        navigate("/"); // 로그인 안 되어 있으면 홈(로그인)으로 리디렉션
      });
  }, [navigate]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>공지사항 페이지입니다.</h2>
    </div>
  );
}

export default Notice;
