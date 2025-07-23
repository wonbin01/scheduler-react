import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./ScheduleApplyPage.css"; // 공통 스타일 재사용

const localizer = momentLocalizer(moment);

const messages = {
  previous: "이전달",
  next: "다음달",
  today: "오늘",
};

const statusColors = {
  휴무신청: "#757575",
  오픈신청: "#1976d2",
  미들신청: "#f57c00",
  마감신청: "#d32f2f",
};

const initialSchedule = [
  { applyDate: "", userNumber: "", position: "", startTime: "", endTime: "" },
];

function SchedulePageView() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState(null);

  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [userName, setUserName] = useState("");
const [currentViewDate, setCurrentViewDate] = useState(null);

  const [schedules, setSchedules] = useState(initialSchedule);

  useEffect(() => {
  const now = moment();
  setCurrentViewDate(now);

  axios
    .get("/scheduleView", { withCredentials: true })
    .then((res) => {
      setUserName(res.data.name);
      setUserID(res.data.id);
      fetchEvents(now.year(), now.month() + 1);  // 여기서 일정 불러오기 호출
    })
    .catch(() => {
      navigate("/");
    });
}, [navigate]);

  useEffect(() => {
    axios
      .get("/member/all", { withCredentials: true })
      .then((res) => {
        console.log("memberList:", res.data);
        setMemberList(res.data);
      })
      .catch((err) => {
        console.error("멤버 로드 실패", err);
      });
  }, []);

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };


  // 새 스케줄 항목 추가
  const addSchedule = () => {
  const userNumber = schedules[0]?.userNumber || "";
  setSchedules([
    ...schedules,
    { applyDate: "", position: "", startTime: "", endTime: "", userNumber },
  ]);
};

  // 제출 처리 (예시: API 호출 등)
  const handleSubmitSchedules = async () => {
  // schedules 배열을 memberList와 매칭해서 username 추가
  const enrichedSchedules = schedules.map((schedule) => {
    const member = memberList.find(
      (m) => m.userNumber === schedule.userNumber
    );
    return {
      ...schedule,
    };
  });

  try {
    const response = await axios.post(
      "/scheduleview/apply",          // 서버 API 주소
      enrichedSchedules,              // body에 JSON 배열 형태로 데이터 전달
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("서버 응답:", response.data);
    alert("스케줄 등록 성공");
setShowApplyModal(false);
setSchedules(initialSchedule);

// 등록 후 일정 다시 불러오기
if (currentViewDate) {
  fetchEvents(currentViewDate.year(), currentViewDate.month() + 1);
}

  } catch (error) {
    console.error("스케줄 등록 실패", error);
    alert("스케줄 등록 실패");
  }
};

  const fetchEvents = (year, month) => {
  setLoading(true);
  console.log("fetchEvents 호출 - year:", year, "month:", month);
  axios
    .get(`/scheduleview/${year}/${month}`, { withCredentials: true })
    .then((res) => {
      console.log("서버에서 받은 일정 데이터:", res.data);  // 여기서 확인
      const result = res.data.map((item) => {
        const start = new Date(`${item.date}T${item.startTime}:00`);
        const end = new Date(`${item.date}T${item.endTime}:00`);
        return {
          ...item,
          start,
          end,
          title: item.userName,
        };
      });
      setEvents(result);
    })
    .catch((err) => {
      console.error("일정 불러오기 실패", err);
      setEvents([]);
    })
    .finally(() => {
      setLoading(false);
    });
};


  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowDateEventsModal(false);
  };

  const handleSelectSlot = (slotInfo) => {
    const dateStr = moment(slotInfo.start).format("YYYY-MM-DD");
    const eventsOfDate = events.filter(
      (e) => moment(e.start).format("YYYY-MM-DD") === dateStr
    );
    setSelectedDateEvents(eventsOfDate);
    setShowDateEventsModal(true);
    setSelectedEvent(null);
  };

  const handleShowMore = (events, date) => {
    setSelectedDateEvents(events);
    setShowDateEventsModal(true);
  };

  const handleNavigate = (date) => {
    const m = moment(date);
    setCurrentViewDate(m);
    fetchEvents(m.year(), m.month() + 1);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setShowDateEventsModal(false);
    setSelectedDateEvents([]);
  };

  const closeApplyModal = () => {
    setShowApplyModal(false);
    setSchedules(initialSchedule); // 스케줄 초기화
  };

  

  const eventStyleGetter = (event) => {
    let backgroundColor = statusColors["오픈신청"];
    if (event.timeSlot && statusColors[event.timeSlot]) {
      backgroundColor = statusColors[event.timeSlot];
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
      },
    };
  };

  return (
    <div className="container">
      <div className="status-color-wrapper">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="status-color-item">
            <div
              className="status-color-box"
              style={{ backgroundColor: color }}
            />
            <span>{status}</span>
          </div>
        ))}
      </div>

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
          onShowMore={handleShowMore}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {/* 신청하기 버튼 (특정 userID만 보임) */}
      {userID === 202126845 && (
        <div
          className="footer-buttons"
          style={{ marginTop: "10px", textAlign: "right" }}
        >
          <button
            className="action-button"
            style={{
              backgroundColor: "#777",
              color: "white",
              borderRadius: "6px",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setShowApplyModal(true)}
          >
            신청하기
          </button>
        </div>
      )}

      {loading && <div className="loading-indicator">로딩 중...</div>}

      {/* 날짜별 이벤트 리스트 모달 */}
      {showDateEventsModal && (
        <>
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <h3>
              {selectedDateEvents.length > 0
                ? moment(selectedDateEvents[0].start).format("YYYY-MM-DD") +
                  " 스캐줄 내역"
                : "등록 내역 없음"}
            </h3>
            <ul className="event-list">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((evt, idx) => (
                  <li
                    key={idx}
                    className="event-list-item"
                    onClick={() => handleSelectEvent(evt)}
                  >
                    <strong>{evt.username}</strong> -{" "}
                    {evt.timeSlot || "시간 미지정"}
                  </li>
                ))
              ) : (
                <li>등록 내역이 없습니다.</li>
              )}
            </ul>
          </div>
          <div className="backdrop" onClick={closeModal} />
        </>
      )}

      {/* 스케줄 등록 모달 */}
    <div className="container">
      {/* 기존 코드 생략 */}

      {/* 스케줄 등록 모달 */}
{showApplyModal && (
  <>
    <div className="modal" style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <button className="modal-close" onClick={closeApplyModal}>
  &times;
</button>
      <h3>스케줄 등록</h3>

      {schedules.map((schedule, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "10px",
            marginBottom: "12px",
          }}
        >

            {idx === 0 ? (
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "4px" }}>이름</label>
              <select
                className="input-style"
                value={schedule.userNumber}
                onChange={(e) => {
                  const newUserNumber = e.target.value;
                  const updated = schedules.map((s, i) =>
                    i === 0 ? { ...s, userNumber: newUserNumber } : { ...s, userNumber: newUserNumber }
                  );
                  setSchedules(updated);
                }}
              >
                <option value="">선택</option>
                {memberList.map((member) => (
                  <option key={member.usernumber} value={member.usernumber}>
                    {member.username} - {member.usernumber}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" value={schedule.userNumber} />
          )}

          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              등록 날짜
            </label>
            <input
              type="date"
              className="input-style"
              value={schedule.applyDate}
              onChange={(e) =>
                handleScheduleChange(idx, "applyDate", e.target.value)
              }
            />
          </div>

          {/* 포지션 */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>포지션</label>
            <select
              className="input-style"
              value={schedule.position}
              onChange={(e) =>
                handleScheduleChange(idx, "position", e.target.value)
              }
            >
              <option value="">선택</option>
              <option value="매점">매점</option>
              <option value="엔젤">엔젤</option>
              <option value="웰컴">웰컴</option>
              <option value="검표">검표</option>
            </select>
          </div>

          {/* 출근시간 */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>출근 시간</label>
            <input
              type="time"
              className="input-style"
              value={schedule.startTime}
              onChange={(e) =>
                handleScheduleChange(idx, "startTime", e.target.value)
              }
            />
          </div>

          {/* 퇴근시간 */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>퇴근 시간</label>
            <input
              type="time"
              className="input-style"
              value={schedule.endTime}
              onChange={(e) =>
                handleScheduleChange(idx, "endTime", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        onClick={addSchedule}
        style={{
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "8px 16px",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        + 스케줄 추가
      </button>

      <div style={{ textAlign: "right" }}>
        <button onClick={handleSubmitSchedules}>제출</button>
      </div>
    </div>
    <div className="backdrop" onClick={closeApplyModal} />
  </>
)}



      {/* 기존 이벤트 상세 모달 및 기타 코드 유지 */}
    </div>

      {/* 이벤트 상세 모달 */}
      {selectedEvent && (
        <>
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <h3>신청 정보</h3>
            <label>신청자</label>
            <input type="text" value={selectedEvent.username} readOnly className="input-style" />
            <label>신청자 ID</label>
            <input type="text" value={selectedEvent.usernumber} readOnly className="input-style" />
            <label>신청 날짜</label>
            <input
              type="text"
              value={moment(selectedEvent.start).format("YYYY-MM-DD")}
              readOnly
              className="input-style"
            />
            <label>신청 내용</label>
            <input
              type="text"
              value={selectedEvent.timeSlot || "선택 안됨"}
              readOnly
              className="input-style"
            />
            <label>사유</label>
            <textarea value={selectedEvent.reason} readOnly rows={3} className="input-style" />
            <label>대체 방안</label>
            <textarea value={selectedEvent.alternativePlan} readOnly rows={3} className="input-style" />
            <label>기타</label>
            <textarea value={selectedEvent.etc} readOnly rows={2} className="input-style" />
          </div>
          <div className="backdrop" onClick={closeModal} />
        </>
      )}
    </div>
  );
}

export default SchedulePageView;
