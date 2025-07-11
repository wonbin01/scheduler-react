import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState(""); // 상태 선언

  useEffect(() => {
    axios.get("/hello")
      .then(res => {
        setMessage(res.data); // 응답 데이터를 상태에 저장
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Hello React</h1>
      <p>Spring에서 온 메시지: {message}</p> {/* 상태를 화면에 출력 */}
    </div>
  );
}

export default App;
