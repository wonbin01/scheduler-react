import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const messages = {
  previous: "이전달",
  next: "다음달",
  today: "오늘",
};

function ScheduleApplyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentViewDate, setCurrentViewDate] = useState(moment());

  const [reason, setReason] = useState("");
  const [alternative, setAlternative] = useState("");
  const [etc, setEtc] = useState("");
  const [username, setUsername] = useState("알수없음");
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    axios
      .get("/schedulePage", { withCredentials: true })
      .then((res) => {
        setUsername(res.data.name);
        setUserID(res.data.id);
        fetchEvents(currentViewDate.year(), currentViewDate.month() + 1);
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate]);

  const fetchEvents = (year, month) => {
    setLoading(true);
    axios
      .get(`/schedule/apply/${year}/${month}`, { withCredentials: true })
      .then((res) => {
        const result = res.data.map((item) => {
          const start = new Date(item.applyDate);
          const end = new Date(start);
          end.setHours(end.getHours() + 1);
          return {
            ...item,
            start,
            end,
            title: `ID: ${item.usernumber}`,
          };
        });
        setEvents(result);
      })
      .catch((err) => {
        console.error("일정 불러오기 실패", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelectSlot = (slotInfo) => {
    const selected = new Date(slotInfo.start);
    selected.setHours(12, 0, 0, 0);
    setSelectedDate(selected);
    setSelectedEvent(null);
    setReason("");
    setAlternative("");
    setEtc("");
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
  };

  const handleAddEvent = () => {
    if (!reason.trim()) {
      alert("사유를 입력해주세요.");
      return;
    }

    const newEvent = {
      usernumber: userID,
      username,
      applyDate: selectedDate,
      reason,
      alternativePlan: alternative,
      etc,
    };

    axios
      .post("/schedule/apply", newEvent, { withCredentials: true })
      .then(() => {
        const m = moment(currentViewDate);
        fetchEvents(m.year(), m.month() + 1);
        closeModal();
      })
      .catch((err) => {
        alert("신청 중 오류 발생");
        console.error(err);
      });
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedEvent(null);
    setReason("");
    setAlternative("");
    setEtc("");
  };

  const handleNavigate = (date) => {
    const m = moment(date);
    setCurrentViewDate(m);
    fetchEvents(m.year(), m.month() + 1);
  };

  const handleRangeChange = (range) => {
    let startDate = Array.isArray(range) ? moment(range[0]) : moment(range.start);
    const m = moment(startDate);
    if (!m.isSame(currentViewDate, "month")) {
      setCurrentViewDate(m);
      fetchEvents(m.year(), m.month() + 1);
    }
  };

  return (
    <>
      <style>
        {`
        .container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
          background-color: #e6f2ff;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
        }
        .calendar-wrapper {
          height: 600px;
          border-radius: 8px;
          border: 1px solid #99ccff;
          background-color: #cce6ff;
          transition: opacity 0.3s ease;
        }
        .calendar-wrapper.loading {
          opacity: 0.5;
        }
        .modal {
          position: fixed;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -30%);
          background: white;
          padding: 20px;
          z-index: 1001;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-close {
          position: absolute;
          top: 8px;
          right: 12px;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        .modal input, .modal textarea {
          width: 100%;
          padding: 8px;
          margin-bottom: 16px;
          border: 1px solid #ccc;
          border-radius: 6px;
          box-sizing: border-box;
        }
        .modal input[readonly] {
          background-color: #f0f0f0;
        }
        .modal button {
          background-color: #0288d1;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .modal button:hover {
          background-color: #026caa;
        }
        .backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0,0,0,0.3);
          z-index: 1000;
        }
        .loading-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #eee;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }
      `}
      </style>

      <div className="container">
        <div className={`calendar-wrapper ${loading ? "loading" : ""}`}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="month"
            views={["month"]}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            style={{ height: "100%" }}
            messages={messages}
          />
        </div>

        {loading && <div className="loading-indicator">로딩 중...</div>}

        {selectedDate && (
          <>
            <div className="modal">
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
              <h3>스케줄 신청</h3>
              <label>신청자</label>
              <input type="text" value={username} readOnly />
              <label>신청자 ID</label>
              <input type="text" value={userID || ""} readOnly />
              <label>신청 날짜</label>
              <input type="text" value={moment(selectedDate).format("YYYY-MM-DD")} readOnly />
              <label>사유</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
              <label>대체 방안</label>
              <textarea value={alternative} onChange={(e) => setAlternative(e.target.value)} rows={3} />
              <label>기타</label>
              <textarea value={etc} onChange={(e) => setEtc(e.target.value)} rows={2} />
              <button onClick={handleAddEvent}>신청하기</button>
            </div>
            <div className="backdrop" onClick={closeModal} />
          </>
        )}

        {selectedEvent && (
          <>
            <div className="modal">
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
              <h3>신청 정보</h3>
              <label>신청자</label>
              <input type="text" value={selectedEvent.username} readOnly />
              <label>신청자 ID</label>
              <input type="text" value={selectedEvent.usernumber} readOnly />
              <label>신청 날짜</label>
              <input type="text" value={moment(selectedEvent.start).format("YYYY-MM-DD")} readOnly />
              <label>사유</label>
              <textarea value={selectedEvent.reason} readOnly rows={3} />
              <label>대체 방안</label>
              <textarea value={selectedEvent.alternativePlan} readOnly rows={3} />
              <label>기타</label>
              <textarea value={selectedEvent.etc} readOnly rows={2} />
            </div>
            <div className="backdrop" onClick={closeModal} />
          </>
        )}
      </div>
    </>
  );
}

export default ScheduleApplyPage;
