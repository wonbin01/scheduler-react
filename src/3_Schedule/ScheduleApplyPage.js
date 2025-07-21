// 기존 import 구문은 그대로 유지
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
  const [selectedDate, setSelectedDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentViewDate, setCurrentViewDate] = useState(moment());

  const [reason, setReason] = useState("");
  const [alternative, setAlternative] = useState("");
  const [etc, setEtc] = useState("");
  const [username, setUsername] = useState("알수없음");
  const [userID, setUserID] = useState(null);

  // --- 추가된 상태 ---
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);

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

  // 달력 빈 날짜 클릭 -> 해당 날짜 이벤트 리스트 모달 열기
  const handleSelectSlot = (slotInfo) => {
    const dateStr = moment(slotInfo.start).format("YYYY-MM-DD");
    const eventsOfDate = events.filter(
      (e) => moment(e.start).format("YYYY-MM-DD") === dateStr
    );
    setSelectedDateEvents(eventsOfDate);
    setShowDateEventsModal(true);
    setSelectedEvent(null); // 기존 상세 이벤트 모달 닫기
  };

  // 기존 이벤트 클릭 -> 상세 정보 모달
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowForm(false);
    setShowDateEventsModal(false); // 이벤트 리스트 모달 닫기
  };

  const handleAddEvent = () => {
    if (!selectedDate) {
      alert("날짜를 선택해주세요.");
      return;
    }
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
    setSelectedDate("");
    setSelectedEvent(null);
    setReason("");
    setAlternative("");
    setEtc("");
    setShowForm(false);
    setShowDateEventsModal(false);
    setSelectedDateEvents([]);
  };

  const handleNavigate = (date) => {
    const m = moment(date);
    setCurrentViewDate(m);
    fetchEvents(m.year(), m.month() + 1);
  };

  const handleCloseEventDetail = () => {
  if (selectedDateEvents.length > 0) {
    setSelectedEvent(null);
    setShowDateEventsModal(true);
  } else {
    closeModal(); // 기존대로 닫기
  }
};

const handleShowMore = (events, date) => {
  setSelectedDateEvents(events);
  setShowDateEventsModal(true);
};

  return (
    <>
      <style>
        {`
        .container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
          background-color: #f9f9f9;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .calendar-wrapper {
          height: 600px;
          border-radius: 12px;
          border: 1px solid #ddd;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: opacity 0.3s ease;
        }

        .calendar-wrapper.loading {
          opacity: 0.5;
        }

        .centered-button-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }

        .action-button {
          background-color: #1e88e5;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
        }

        .action-button:hover {
          background-color: #1565c0;
        }

        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fff;
          padding: 24px;
          z-index: 1001;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          width: 90%;
          max-width: 480px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-close {
          position: absolute;
          top: 10px;
          right: 16px;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }

        .modal input, .modal textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 16px;
          border: 1px solid #ccc;
          border-radius: 6px;
          box-sizing: border-box;
          font-size: 14px;
        }

        .modal input[readonly] {
          background-color: #f0f0f0;
        }

        .modal button {
          background-color: #1e88e5;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
        }

        .modal button:hover {
          background-color: #1565c0;
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
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 14px;
        }

        .event-list-item {
          padding: 8px 12px;
          border-bottom: 1px solid #ddd;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .event-list-item:hover {
          background-color: #e3f2fd;
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
            onSelectSlot={handleSelectSlot}  // 빈 날짜 클릭시 호출
            onSelectEvent={handleSelectEvent} // 이벤트 클릭시 호출
            onNavigate={handleNavigate}
            style={{ height: "100%" }}
            messages={messages}
            onShowMore={handleShowMore}
          />
        </div>

        {loading && <div className="loading-indicator">로딩 중...</div>}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          {/* 왼쪽: 이전으로 버튼 */}
          <div>
            <button
              className="action-button"
              style={{ backgroundColor: "#777" }}
              onClick={() => navigate("/schedulePage")}
            >
              ← 이전으로
            </button>
          </div>

          {/* 가운데: 신청하기 버튼 */}
          <div
            style={{
              margin: "0 auto",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <button className="action-button" onClick={() => setShowForm(true)}>
              신청하기
            </button>
          </div>

          {/* 오른쪽: 빈 공간 확보용 */}
          <div style={{ width: "100px" }}></div>
        </div>

        {/* 신청 폼 모달 */}
        {showForm && (
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
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <label>사유</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <label>대체 방안</label>
              <textarea
                value={alternative}
                onChange={(e) => setAlternative(e.target.value)}
                rows={3}
              />
              <label>기타</label>
              <textarea value={etc} onChange={(e) => setEtc(e.target.value)} rows={2} />
              <button onClick={handleAddEvent}>신청하기</button>
            </div>
            <div className="backdrop" onClick={closeModal} />
          </>
        )}

        {/* 이벤트 상세 모달 */}
        {selectedEvent && (
          <>
            <div className="modal">
              <button className="modal-close" onClick={handleCloseEventDetail}>
                &times;
              </button>
              <h3>신청 정보</h3>
              <label>신청자</label>
              <input type="text" value={selectedEvent.username} readOnly />
              <label>신청자 ID</label>
              <input type="text" value={selectedEvent.usernumber} readOnly />
              <label>신청 날짜</label>
              <input
                type="text"
                value={moment(selectedEvent.start).format("YYYY-MM-DD")}
                readOnly
              />
              <label>사유</label>
              <textarea value={selectedEvent.reason} readOnly rows={3} />
              <label>대체 방안</label>
              <textarea value={selectedEvent.alternativePlan} readOnly rows={3} />
              <label>기타</label>
              <textarea value={selectedEvent.etc} readOnly rows={2} />
            </div>
            <div className="backdrop" onClick={handleCloseEventDetail} />
          </>
        )}

        {/* 날짜별 이벤트 리스트 모달 */}
        {showDateEventsModal && (
          <>
            <div className="modal">
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
              <h3>
                {selectedDateEvents.length > 0
                  ? moment(selectedDateEvents[0].start).format("YYYY-MM-DD") + " 신청 내역"
                  : "신청 내역 없음"}
              </h3>
              <ul style={{ maxHeight: "60vh", overflowY: "auto", padding: 0, listStyle: "none" }}>
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((evt, idx) => (
                    <li
                      key={idx}
                      className="event-list-item"
                      onClick={() => {
                        handleSelectEvent(evt);
                      }}
                    >
                      <strong>{evt.username}</strong> - {evt.reason}
                    </li>
                  ))
                ) : (
                  <li>신청내역이 없습니다.</li>
                )}
              </ul>
            </div>
            <div className="backdrop" onClick={closeModal} />
          </>
        )}
      </div>
    </>
  );
}

export default ScheduleApplyPage;
