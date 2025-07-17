import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function NoticeEdit() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/notice/${category}/${id}`, { withCredentials: true })
      .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
      })
      .catch(err => {
        alert("게시글 정보를 불러오지 못했습니다.");
        navigate(`/notice/${category}`);
      })
      .finally(() => setLoading(false));
  }, [category, id, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.put(`/notice/${category}/${id}`, { title, content }, { withCredentials: true })
      .then(() => {
        alert("게시글이 수정되었습니다.");
        navigate(`/notice/${category}/${id}`);
      })
      .catch(() => {
        alert("게시글 수정 실패");
      });
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{
      padding: "2rem",
      minHeight: "100vh",
      backgroundColor: "#f9f9f9",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h2>{category} 게시글 수정</h2>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "8px",
        border: "1px solid #ddd",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 0 10px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            padding: "0.8rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem"
          }}
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows="10"
          style={{
            padding: "0.8rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            resize: "vertical"
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            type="submit"
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#52c41a",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#389e0d"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#52c41a"}
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#aaa",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#888"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#aaa"}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoticeEdit;
