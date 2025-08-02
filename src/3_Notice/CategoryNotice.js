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
    axios.get(`/api/notice/${category}`, { withCredentials: true })
      .then(res => {
        setPosts(res.data);
      })
      .catch(err => {
        if (err.response?.status === 401) {
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

  axios.post(`/api/notice/${category}`, { title, content }, { withCredentials: true })
    .then(() => {
      // 게시글 작성 성공 후, 다시 게시글 목록을 서버에서 받아오기
      return axios.get(`/api/notice/${category}`, { withCredentials: true });
    })
    .then(res => {
      setPosts(res.data);
      setTitle("");
      setContent("");
      setShowForm(false);
    })
    .catch(() => {
      alert("게시글 작성 실패 또는 목록 갱신 실패");
    });
};

  const handleClickPost = (postId) => {
    navigate(`/notice/${category}/${postId}`);
  };

  if (loading) return <div>로딩 중...</div>;

  return (
  <div 
    style={{ 
      position: "relative",  // 부모에 relative 추가
      padding: "2rem", 
      minHeight: "100vh", 
      backgroundColor: "#e6f2ff", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center" 
    }}
  >
    {/* 왼쪽 상단 절대 위치 뒤로가기 버튼 */}
    <button
      onClick={() => navigate("/notice")}
      style={{
        position: "absolute",
        top: "1rem",
        left: "1rem",
        padding: "0.5rem 1rem",
        fontSize: "1rem",
        backgroundColor: "#3399ff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        zIndex: 10
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = "#267acc"}
      onMouseOut={(e) => e.target.style.backgroundColor = "#3399ff"}
    >
      ← 뒤로가기
    </button>

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
              onClick={() => handleClickPost(post.id)}
              style={{
                backgroundColor: "#cce6ff",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #99ccff",
                cursor: "pointer"
              }}
            >
              <h3 style={{ color: "#003366", margin: 0 }}>{post.title}</h3>
              <p style={{ marginTop: "0.5rem", color: "#333" }}>{post.content.slice(0, 50)}...</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NoticeBoard;
