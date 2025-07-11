import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const clearForm = () => {
    setUsername("");
    setPassword("");
    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", { username, password });
      setMessage("로그인 성공: " + res.data);
      navigate("/home");
    } catch (err) {
      setMessage("로그인 실패: " + (err.response?.data || "서버 오류"));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/signup", { username, password });
      setMessage("회원가입 성공: " + res.data);
    } catch (err) {
      setMessage("회원가입 실패: " + (err.response?.data || "서버 오류"));
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>{tab === "login" ? "로그인" : "회원가입"}</h2>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => { setTab("login"); clearForm(); }} disabled={tab === "login"}>
          로그인
        </button>
        <button onClick={() => { setTab("signup"); clearForm(); }} disabled={tab === "signup"}>
          회원가입
        </button>
      </div>

      <form onSubmit={tab === "login" ? handleLogin : handleSignup}>
        <div style={{ marginBottom: "1rem" }}>
          <label>아이디</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>비밀번호</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" style={{ width: "100%" }}>
          {tab === "login" ? "로그인" : "회원가입"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>
    </div>
  );
}

export default App;
