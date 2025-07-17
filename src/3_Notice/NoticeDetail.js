import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function NoticeDetail() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // 댓글 상태
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);

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

 useEffect(() => {
  axios.get(`/notice/${category}/${id}/comments`, { withCredentials: true })
    .then(res => {
      console.log("받아온 댓글 데이터:", res.data);
      setComments(res.data);
    })
    .catch(() => {
      // 실패해도 댓글 없으면 그냥 넘어감
    });
}, [category, id]);

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

  // 댓글 작성 핸들러
  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    axios.post(`/notice/${category}/${id}/comments`, { comment_content: commentContent }, { withCredentials: true })
  .then(() => {
    return axios.get(`/notice/${category}/${id}/comments`, { withCredentials: true });
  })
  .then(res => {
    setComments(res.data); // 최신 댓글 목록으로 교체
    setCommentContent(""); // 입력란 초기화
  })
  .catch(() => {
    alert("댓글 작성 실패");
  });
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

      {/* 댓글 목록 */}
      <div style={{ maxWidth: "600px", width: "100%", marginTop: "2rem" }}>
        <h3>댓글 ({comments.length})</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {comments.map((comment) => (
            <li key={comment.comment_Id} style={{ marginBottom: "1rem", background: "#fff", padding: "0.8rem", borderRadius: "6px", border: "1px solid #ccc" }}>
              <strong>{comment.username}</strong> <small style={{ color: "#888", fontSize: "0.8rem" }}>{new Date(comment.createdAt).toLocaleString()}</small>
              <p style={{ marginTop: "0.3rem", whiteSpace: "pre-wrap" }}>{comment.comment_content}</p>
            </li>
          ))}
          {comments.length === 0 && <p>댓글이 없습니다.</p>}
        </ul>
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleCommentSubmit} style={{ maxWidth: "600px", width: "100%", marginTop: "1rem" }}>
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          rows={4}
          placeholder="댓글을 입력하세요."
          style={{ width: "100%", padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc", resize: "vertical" }}
        />
        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
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
          댓글 작성
        </button>
      </form>

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
