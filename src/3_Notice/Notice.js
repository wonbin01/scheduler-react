import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Notice.css";

function Notice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get("/api/notice", { withCredentials: true })
      .then(res => {
        setCategories(res.data.categories);
        setLoading(false);
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate]);

  const handleCategoryClick = (category) => {
    navigate(`/api/notice/${category}`);
  };

  const handleAddCategory = () => {
    const newCategory = prompt("새로운 카테고리 이름을 입력하세요:");
    if (newCategory && newCategory.trim()) {
      const name = newCategory.trim();

      axios.post("/api/notice/category", { name }, { withCredentials: true })
        .then(() => {
          setCategories(prev => [...prev, name]);
        })
        .catch(err => {
          alert(err.response?.data || "카테고리 추가 실패");
        });
    }
  };

  const handleBackClick = () => {
    navigate("/api/home");
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="notice-container">
      <button className="back-button-top-left" onClick={handleBackClick}>
        ← 홈으로
      </button>

      <h2 className="notice-title">공지사항</h2>
      <div className="notice-grid">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="notice-category-btn"
          >
            {category}
          </button>
        ))}
        <button
          onClick={handleAddCategory}
          className="notice-add-btn"
        >
          + 추가
        </button>
      </div>
    </div>
  );
}

export default Notice;
