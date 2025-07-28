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
  매점: "#757575",
  엔젤: "#FFC0CB",
  웰컴: "#1976d2",
  검표: "#f57c00",
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
  axios
    .get("/api/scheduleView", { withCredentials: true })
    .then((res) => {
      setUserName(res.data.name);
      setUserID(res.data.id);
    })
    .catch(() => {
      navigate("/");
    });
}, [navigate]);

// 2) userID가 세팅된 후에 일정 불러오기 실행
useEffect(() => {
  if (userID) {
    const now = moment();
    setCurrentViewDate(now);
    fetchEvents(now.year(), now.month() + 1);
  }
}, [userID]);

  useEffect(() => {
    axios
      .get("/api/member/all", { withCredentials: true })
      .then((res) => {
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
      "/api/scheduleview/apply",          // 서버 API 주소
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
  axios
    .get(`/api/scheduleview/${year}/${month}`, { withCredentials: true })
    .then((res) => {
      let result = res.data.map((item) => {
        // 날짜 가공
        const start = new Date(`${item.applyDate}T${item.startTime}:00`);
        const end = new Date(`${item.applyDate}T${item.endTime}:00`);
        const isMySchedule = String(item.userNumber) === String(userID);

        return {
          ...item,
          start,
          end,
          title: isMySchedule ? item.userName || item.username || "내 스케줄" : "",
          isMySchedule,
        };
      });

      // 내 이벤트가 먼저 오도록 정렬
      result = result.sort((a, b) => {
        if (a.isMySchedule && !b.isMySchedule) return -1;
        if (!a.isMySchedule && b.isMySchedule) return 1;
        return 0;
      });

      setEvents(result); // 정렬된 이벤트로 상태 변경
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

  const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    options.push(`${String(h).padStart(2, "0")}:00`);
    options.push(`${String(h).padStart(2, "0")}:30`);
  }
  return options;
};

  const timeOptions = generateTimeOptions();

  const handleDelete = async () => {
  try {
    await axios.delete(`/api/scheduleview/${selectedEvent.scheduleEventId}`);
    alert("삭제되었습니다.");
    closeModal();
    if (currentViewDate) {
  fetchEvents(currentViewDate.year(), currentViewDate.month() + 1);
}
  } catch (error) {
    console.error("삭제 실패:", error);
    alert("삭제 중 문제가 발생했습니다.");
  }
};

  const isAllSchedulesValid = (schedules) => {
  return schedules.every((s) =>
    s.userNumber &&
    s.applyDate &&
    s.position &&
    s.startTime &&
    s.endTime
  );
};

  const eventStyleGetter = (event) => {
  if (!event.isMySchedule) return { style: { display: "none" } };

  // position에 따른 색상 가져오기 (기본 색상 지정 가능)
  let backgroundColor = statusColors[event.position] || "#1976d2"; // 기본 파랑색

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
    {/* 뒤로가기 버튼 추가 */}
    <button
      onClick={() => navigate("/api/schedulePage")}
      style={{
        marginBottom: "10px",
        padding: "6px 12px",
        borderRadius: "4px",
        border: "1px solid #1976d2",
        backgroundColor: "white",
        color: "#1976d2",
        cursor: "pointer",
      }}
    >
      뒤로가기
    </button>

    <h2>Schedule</h2>
    <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
  {Object.entries(statusColors).map(([position, color]) => (
    <div key={position} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          width: "16px",
          height: "16px",
          backgroundColor: color,
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <span style={{ fontSize: "14px" }}>{position}</span>
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
            등록하기
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
          ? moment(selectedDateEvents[0].start).format("YYYY-MM-DD") + " 스케줄 내역"
          : "등록 내역 없음"}
      </h3>

      {selectedDateEvents.length > 0 ? (
        Object.entries(
          selectedDateEvents.reduce((groups, evt) => {
            const pos = evt.position || "미지정";
            if (!groups[pos]) groups[pos] = [];
            groups[pos].push(evt);
            return groups;
          }, {})
        ).map(([position, events]) => {
          // 출근시간 기준 오름차순 정렬 (시간 없으면 뒤로)
          const sortedEvents = events.slice().sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
          });

          return (
            <div key={position} style={{ marginBottom: "16px" }}>
              <h4>{position} 포지션</h4>
              <ul className="event-list">
                {sortedEvents.map((evt, idx) => (
                  <li
                    key={idx}
                    className="event-list-item"
                    onClick={() => handleSelectEvent(evt)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{evt.userName || evt.username}</strong> - 출근시간: {evt.startTime || "미지정"} / 퇴근시간: {evt.endTime || "미지정"}
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      ) : (
        <li>등록 내역이 없습니다.</li>
      )}
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
  <select
    className="input-style"
    value={schedule.startTime}
    onChange={(e) => handleScheduleChange(idx, "startTime", e.target.value)}
  >
    {timeOptions.map((time) => (
      <option key={time} value={time}>
        {time}
      </option>
    ))}
  </select>
</div>

          {/* 퇴근시간 */}
          <div style={{ marginBottom: "8px" }}>
  <label style={{ display: "block", marginBottom: "4px" }}>퇴근 시간</label>
  <select
    className="input-style"
    value={schedule.endTime}
    onChange={(e) => handleScheduleChange(idx, "endTime", e.target.value)}
  >
    {timeOptions.map((time) => (
      <option key={time} value={time}>
        {time}
      </option>
    ))}
  </select>
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
        <button
  onClick={handleSubmitSchedules}
  disabled={!isAllSchedulesValid(schedules)}
  style={{
    backgroundColor: isAllSchedulesValid(schedules) ? "#1976d2" : "#ccc",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: isAllSchedulesValid(schedules) ? "pointer" : "not-allowed",
  }}
>
  제출
</button>
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
      <h3>등록 정보</h3>
      <label>이름</label>
      <input type="text" value={selectedEvent.userName} readOnly className="input-style" />
      <label>사번</label>
      <input type="text" value={selectedEvent.userNumber} readOnly className="input-style" />
      <label>신청 날짜</label>
      <input
        type="text"
        value={moment(selectedEvent.start).format("YYYY-MM-DD")}
        readOnly
        className="input-style"
      />
      <label>포지션</label>
      <input
        type="text"
        value={selectedEvent.position || "선택 안됨"}
        readOnly
        className="input-style"
      />
      <label>출근 시간</label>
      <input
        type="text"
        value={selectedEvent.startTime || "선택 안됨"}
        readOnly
        className="input-style"
      />
      <label>퇴근 시간</label>
      <input
        type="text"
        value={selectedEvent.endTime || "선택 안됨"}
        readOnly
        className="input-style"
      />

      {/* 삭제하기 버튼 추가 */}
      {userID === 202126845 && (
  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
    <button
      onClick={handleDelete}
      style={{
        backgroundColor: "#e53935",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      삭제하기
    </button>
  </div>
)}
    </div>
    <div className="backdrop" onClick={closeModal} />
  </>
)}
    </div>
  );
}

export default SchedulePageView;
