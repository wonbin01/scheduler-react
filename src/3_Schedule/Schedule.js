import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Schedule() {
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/schedule", { withCredentials: true })
      .then(res => {
        // Handle successful response
      })
      .catch(() => {
        navigate("/"); // Redirect to home if not logged in
      });
  }, [navigate]);

  return(
    <div style={{ padding: "2rem" }}>
      <h2>스케줄 신청 페이지입니다.</h2>
    </div>
  );

}

export default Schedule;
