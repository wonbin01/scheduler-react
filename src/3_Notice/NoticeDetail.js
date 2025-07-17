import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function NoticeDetail() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/notice/${category}/${id}`, { withCredentials: true })
      .then(res => setPost(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          navigate("/");
        } else {
          alert("글을 불러오지 못했습니다.");
        }
      })
      .finally(() => setLoading(false));
  }, [category, id, navigate]);

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios.delete(`/notice/${category}/${id}`, { withCredentials: true })
        .then(() => {
          alert("게시글이 삭제되었습니다.");
          navigate(`/notice/${category}`);
        })
        .catch(() => {
          alert("게시글 삭제 실패");
        });
    }
  };

  const handleEdit = () => {
    navigate(`/notice/${category}/${id}/edit`);
  };

  if (loading) return <div>로딩 중...</div>;
  if (!post) return <div>해당 글이 존재하지 않습니다.</div>;

  return (
    <div style={{
      padding: "2rem",
      minHeight: "100vh",
      backgroundColor: "#e6f2ff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h2>{category} 게시글 상세보기</h2>

      <div style={{
        backgroundColor: "#cce6ff",
        padding: "1.5rem",
        borderRadius: "8px",
        border: "1px solid #99ccff",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        maxHeight: "400px",
        overflowY: "auto"
      }}>
        <h3 style={{ color: "#003366", marginBottom: "1rem" }}>{post.title}</h3>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", color: "#333" }}>
          {post.content}
        </p>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button
  onClick={() => navigate(`/notice/${category}`)}
  style={{
    padding: "0.6rem 1.2rem",
    backgroundColor: "#3399ff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }}
  onMouseOver={(e) => e.target.style.backgroundColor = "#267acc"}
  onMouseOut={(e) => e.target.style.backgroundColor = "#3399ff"}
>
  ← 목록으로
</button>

        <button
          onClick={handleEdit}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#ffa940",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#d48806"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#ffa940"}
        >
          수정
        </button>

        <button
          onClick={handleDelete}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#ff4d4f",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#d9363e"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#ff4d4f"}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default NoticeDetail;
