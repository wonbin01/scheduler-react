import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Auth() {
  const [tab, setTab] = useState("login");
  const [usernumber, setUsernumber] = useState(""); // 아이디
  const [password, setPassword] = useState("");     // 비밀번호
  const [username, setUsername] = useState("");     // 이름
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const clearForm = () => {
    setUsernumber("");
    setPassword("");
    setUsername("");
    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { usernumber, password }, { withCredentials: true });
      setMessage("로그인 성공: " + res.data);
      navigate("/home");
    } catch (err) {
      setMessage("로그인 실패: " + (err.response?.data || "서버 오류"));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    // 메시지 초기화
    setMessage("");

    // --- 비밀번호 길이 유효성 검사 추가 시작 ---
    if (password.length < 4) {
      setMessage("비밀번호는 최소 4자리 이상이어야 합니다.");
      return; // 서버 요청을 보내지 않고 함수 종료
    }
  
    try {
      const res = await axios.post("/signup", { usernumber, password, username });
      setMessage("회원가입 성공: " + res.data);
    } catch (err) {
      // catch 블록에서 에러를 잡습니다.
      if (err.response) {
        // 서버에서 응답을 보낸 경우
        const status = err.response.status;
        const errorMessage = err.response.data;
  
        if (status === 409) {
          // 백엔드에서 설정한 Conflict(409) 상태 코드를 확인
          // 메시지를 더 구체적으로 표시
          setMessage("회원가입 실패: " + (errorMessage.message || "이미 존재하는 아이디입니다."));
        } else {
          // 그 외 다른 종류의 서버 에러
          setMessage("회원가입 실패: " + (errorMessage.message || "서버 오류가 발생했습니다."));
        }
      } else {
        // 서버가 응답하지 않은 경우 (네트워크 오류 등)
        setMessage("회원가입 실패: 네트워크 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>{tab === "login" ? "로그인" : "회원가입"}</h2>

      <div className="tab-buttons">
        <button
          onClick={() => { setTab("login"); clearForm(); }}
          className={tab === "login" ? "active" : ""}
        >
          로그인
        </button>
        <button
          onClick={() => { setTab("signup"); clearForm(); }}
          className={tab === "signup" ? "active" : ""}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={tab === "login" ? handleLogin : handleSignup}>
        <div className="form-group">
          <label>사번</label>
          <input
            type="text"
            value={usernumber}
            onChange={(e) => setUsernumber(e.target.value)}
            required
          />
        </div>

        {tab === "signup" && (
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          {tab === "login" ? "로그인" : "회원가입"}
        </button>
      </form>

      <p className="message">{message}</p>
    </div>
  );
}

export default Auth;
