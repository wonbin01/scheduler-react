import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Notice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // 서버에서 카테고리 목록 불러오기
  useEffect(() => {
    axios.get("/notice", { withCredentials: true })
      .then(res => {
        setCategories(res.data.categories); // 백엔드에서 categories로 응답했다고 가정
        setLoading(false);
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate]);

  const handleCategoryClick = (category) => {
    navigate(`/notice/${category}`);
  };

  const handleAddCategory = () => {
    const newCategory = prompt("새로운 카테고리 이름을 입력하세요:");
    if (newCategory && newCategory.trim()) {
      const name = newCategory.trim();

      axios.post("/notice/category", { name }, { withCredentials: true })
        .then(() => {
          setCategories(prev => [...prev, name]);
        })
        .catch(err => {
          alert(err.response?.data || "카테고리 추가 실패");
        });
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{
      padding: "2rem",
      minHeight: "100vh",
      backgroundColor: "#e6f2ff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h2>공지사항</h2>
      <div style={{
        marginTop: "2rem",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
        width: "100%",
        maxWidth: "600px"
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            style={{
              padding: "1rem",
              fontSize: "1rem",
              backgroundColor: "#cce6ff",
              border: "1px solid #99ccff",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "0.2s",
              color: "#003366",
              fontWeight: "bold"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#b3d9ff"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#cce6ff"}
          >
            {category}
          </button>
        ))}

        <button
          onClick={handleAddCategory}
          style={{
            padding: "1rem",
            fontSize: "1rem",
            backgroundColor: "#ffffff",
            border: "2px dashed #99ccff",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#3399ff",
            fontWeight: "bold"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#f0f8ff"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#ffffff"}
        >
          + 추가
        </button>
      </div>
    </div>
  );
}

export default Notice;
