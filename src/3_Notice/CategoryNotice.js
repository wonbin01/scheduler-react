import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function NoticeBoard() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
  setLoading(true);
  axios.get(`/notice/${category}`, { withCredentials: true })
    .then(res => {
      setPosts(res.data); // 게시글 목록 세팅
    })
    .catch(err => {
      if (err.response?.status === 401) {
        // 세션 없으면 메인 페이지로 이동
        navigate("/");
      } else {
        alert("게시글 로딩 실패");
        setPosts([]);
      }
    })
    .finally(() => setLoading(false));
}, [category, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    axios.post(`/notice/${category}`, { title, content }, { withCredentials: true })
      .then(res => {
        setPosts(prev => [...prev, res.data]);
        setTitle("");
        setContent("");
        setShowForm(false);
      })
      .catch(() => {
        alert("게시글 작성 실패");
      });
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
      <h2>{category} 게시판</h2>

      <button
        onClick={() => setShowForm(show => !show)}
        style={{
          marginBottom: "1rem",
          padding: "0.7rem 1.2rem",
          fontSize: "1rem",
          backgroundColor: "#ffffff",
          border: "2px dashed #3399ff",
          borderRadius: "8px",
          color: "#3399ff",
          fontWeight: "bold",
          cursor: "pointer"
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = "#f0f8ff"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#ffffff"}
      >
        {showForm ? "작성 취소" : "+ 새 글 작성"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#ffffff",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />
          <textarea
            placeholder="내용"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              borderRadius: "5px",
              border: "1px solid #ccc"
            }}
          />
          <button type="submit" style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3399ff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            작성 완료
          </button>
        </form>
      )}

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        maxWidth: "600px"
      }}>
        {posts.length === 0 ? (
          <p>게시글이 없습니다.</p>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              style={{
                backgroundColor: "#cce6ff",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #99ccff"
              }}
            >
              <h3 style={{ color: "#003366", margin: 0 }}>{post.title}</h3>
              <p style={{ marginTop: "0.5rem" }}>{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NoticeBoard;
