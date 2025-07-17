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
    try {
      const res = await axios.post("/signup", { usernumber, password, username });
      setMessage("회원가입 성공: " + res.data);
    } catch (err) {
      setMessage("회원가입 실패: " + (err.response?.data || "서버 오류"));
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
