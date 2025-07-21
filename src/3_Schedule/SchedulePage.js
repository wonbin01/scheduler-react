import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function ScheduleTap() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("view"); // 초기 탭 'view'로 설정
  const [viewEvents, setViewEvents] = useState([]); // 서버에서 받아올 신청 이벤트
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [reason, setReason] = useState("");
  const [alternative, setAlternative] = useState("");
  const [etc, setEtc] = useState("");
  const [username, setUsername] = useState("알수없음");
  const [userID, setUserID] = useState(null);

  // 로그인 사용자 정보 받아오기 + 초기 월 데이터 로딩
  useEffect(() => {
    axios
      .get("/schedulePage", { withCredentials: true })
      .then((res) => {
        setUsername(res.data.name);
        setUserID(res.data.id);
        setLoading(false);
        // 사용자 정보 로딩 완료되면 현재 월 데이터도 불러오기
        fetchEventsForMonth(moment().month() + 1);
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate]);

  // 서버에서 해당 달 신청 데이터 받아오는 함수
  const fetchEventsForMonth = (monthNumber) => {
    axios
      .get(`/schedule/apply/${monthNumber}`, { withCredentials: true })
      .then((res) => {
        const events = res.data.map((item) => {
          const startDate = new Date(item.applyDate);
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 1);

          return {
            ...item,
            title: `ID: ${item.usernumber}`,
            start: startDate,
            end: endDate,
          };
        });
        setViewEvents(events);
      })
      .catch((error) => {
        console.error("일정 데이터 로딩 실패", error);
      });
  };

  // 달력에서 보이는 범위가 바뀔 때 호출됨
  const handleRangeChange = (range) => {
    let monthNumber;
    if (Array.isArray(range)) {
      monthNumber = moment(range[0]).month() + 1;
    } else {
      monthNumber = moment(range.start).month() + 1;
    }
    fetchEventsForMonth(monthNumber);
  };

  // activeTab이 "view"로 바뀔 때마다 현재 월 데이터 다시 불러오기
  useEffect(() => {
    if (activeTab === "view") {
      fetchEventsForMonth(moment().month() + 1);
      closeModal(); // 탭 전환 시 모달 닫기
    }
  }, [activeTab]);

  // 날짜 선택 시 (스케줄 신청용)
  const handleSelectSlot = (slotInfo) => {
    const selected = new Date(slotInfo.start);
    selected.setHours(12, 0, 0, 0);

    setSelectedDate(selected);
    setSelectedEvent(null);
    setReason("");
    setAlternative("");
    setEtc("");
  };

  // 이벤트 클릭 시 (상세보기용)
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  // 신청 버튼 클릭 시
  const handleAddEvent = () => {
    if (!reason.trim()) {
      alert("사유를 입력해주세요.");
      return;
    }

    const newEvent = {
      usernumber: userID,
      username: username,
      applyDate: selectedDate,
      reason: reason,
      alternativePlan: alternative,
      etc: etc,
    };

    axios
      .post("/schedule/apply", newEvent, { withCredentials: true })
      .then(() => {
        fetchEventsForMonth(moment(selectedDate).month() + 1);
        closeModal();
      })
      .catch((error) => {
        alert("스케줄 신청 중 오류가 발생했습니다.");
        console.error(error);
      });
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setSelectedDate(null);
    setReason("");
    setAlternative("");
    setEtc("");
  };

  if (loading) return <div style={{ padding: 20 }}>로딩 중...</div>;

  return (
    <>
      <style>{`
        .container {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
          background-color: #e6f2ff;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
        }
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
        }
        .tab {
          padding: 10px 20px;
          border: 1px solid #ccc;
          cursor: pointer;
          border-radius: 8px;
          background: #f2f2f2;
          font-weight: 600;
          color: #01579b;
          user-select: none;
        }
        .tab:hover {
          background-color: #cce6ff;
        }
        .tab.active {
          background: #0288d1;
          color: white;
          font-weight: bold;
        }
        .calendar-wrapper {
          height: 600px;
          border-radius: 8px;
          border: 1px solid #99ccff;
          background-color: #cce6ff;
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
        .event-list {
          max-height: 300px;
          overflow-y: auto;
          margin-top: 12px;
          padding-left: 10px;
          border-left: 2px solid #0288d1;
          color: #003366;
          font-size: 14px;
        }
      `}</style>

      <div className="container">
        <div className="tabs">
          <div
            className={`tab ${activeTab === "view" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("view");
            }}
          >
            스케줄 확인
          </div>
          <div
            className={`tab ${activeTab === "apply" ? "active" : ""}`}
            onClick={() => {
              closeModal();
              setActiveTab("apply");
            }}
          >
            스케줄 신청
          </div>
        </div>

        <div className="calendar-wrapper">
          <Calendar
  localizer={localizer}
  events={viewEvents}
  startAccessor="start"
  endAccessor="end"
  defaultView="month"
  views={['month']}    // 월 단위 뷰만 허용
  selectable
  onSelectEvent={handleSelectEvent}
  onSelectSlot={handleSelectSlot}
  onRangeChange={handleRangeChange}
  style={{ height: "100%" }}
/>
        </div>

        {/* 이벤트 상세 모달 */}
        {selectedEvent && (
          <>
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-detail-title"
            >
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="닫기"
              >
                &times;
              </button>
              <h3 id="event-detail-title">스케줄 상세</h3>
              <p>
                <strong>신청자:</strong> {selectedEvent.username}
              </p>
              <p>
                <strong>신청자 ID:</strong> {selectedEvent.usernumber}
              </p>
              <p>
                <strong>사유:</strong> {selectedEvent.reason}
              </p>
              <p>
                <strong>대체 방안:</strong> {selectedEvent.alternativePlan}
              </p>
              <p>
                <strong>기타:</strong> {selectedEvent.etc}
              </p>
              <p>
                <strong>신청일:</strong>{" "}
                {moment(selectedEvent.start).format("YYYY-MM-DD")}
              </p>
            </div>
            <div className="backdrop" onClick={closeModal} />
          </>
        )}

        {/* 신청 모달 */}
        {selectedDate && activeTab === "apply" && (
          <>
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="schedule-apply-title"
            >
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="닫기"
              >
                &times;
              </button>
              <h3 id="schedule-apply-title">스케줄 신청</h3>

              <label>신청자</label>
              <input type="text" value={username} readOnly />

              <label>신청자 ID</label>
              <input type="text" value={userID || ""} readOnly />

              <label>신청 날짜</label>
              <input
                type="text"
                value={moment(selectedDate).format("YYYY-MM-DD HH:mm")}
                readOnly
              />

              <label>사유</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="신청 사유를 입력하세요"
              />

              <label>대체 방안</label>
              <textarea
                value={alternative}
                onChange={(e) => setAlternative(e.target.value)}
                rows={3}
                placeholder="대체 방안을 입력하세요"
              />

              <label>기타</label>
              <textarea
                value={etc}
                onChange={(e) => setEtc(e.target.value)}
                rows={2}
                placeholder="기타 참고사항을 입력하세요"
              />

              <button onClick={handleAddEvent}>신청하기</button>
            </div>
            <div className="backdrop" onClick={closeModal} />
          </>
        )}
      </div>
    </>
  );
}

export default ScheduleTap;
