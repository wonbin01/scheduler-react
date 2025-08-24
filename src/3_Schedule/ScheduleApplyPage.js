// ScheduleApplyPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./ScheduleApplyPage.css"; // CSS import

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
  const [timeSlot, setTimeSlot] = useState("");
  const [applyId, setApplyId] = useState(null);

  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);

  const [selectedDates, setSelectedDates] = useState([]);
  const [allowedDates, setAllowedDates] = useState([]);

  



  const statusColors = {
    휴무신청: "#757575",
    오픈신청: "#1976d2",
    미들신청: "#f57c00",
    마감신청: "#d32f2f",
  };

  useEffect(() => {
    axios
      .get("/api/scheduleApplyPage", { withCredentials: true })
      .then((res) => {
        setUsername(res.data.name);
        setUserID(res.data.id);
        fetchEvents(currentViewDate.year(), currentViewDate.month() + 1);
        fetchAllowedDates();
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate, currentViewDate]);

  const fetchAllowedDates = () => {
  axios
    .get("/api/allowed-dates", { withCredentials: true })
    .then((res) => {
      setAllowedDates(res.data);
    })
    .catch((err) => {
      console.error("allowed-dates 불러오기 실패", err);
    });
};

const handleRemoveAllowedDate = (id) => {
  console.log("삭제 요청 id : ", id);
  if (window.confirm("정말 삭제하시겠습니까?")) {
    axios
      .delete(`/api/allowed-dates/${id}`, { withCredentials: true })
      .then(() => {
        alert("삭제되었습니다.");
        setAllowedDates(allowedDates.filter((d) => d.id !== id));
      })
      .catch((err) => {
        console.error("삭제 실패", err);
        alert("삭제 실패했습니다.");
      });
  }
};




  const fetchEvents = (year, month) => {
    setLoading(true);
    axios
      .get(`/api/schedule/apply/${year}/${month}`, { withCredentials: true })
      .then((res) => {
        const result = res.data
          .sort((a, b) => a.applyId - b.applyId)
          .map((item) => {
            const start = new Date(item.applyDate);
            const end = new Date(start);
            end.setHours(end.getHours() + 1);
            return {
              ...item,
              start,
              end,
              title: `${item.username}`,
              applyId: item.applyId,
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
    const dateStr = moment(slotInfo.start).format("YYYY-MM-DD");
    const eventsOfDate = events.filter(
      (e) => moment(e.start).format("YYYY-MM-DD") === dateStr
    );
    setSelectedDateEvents(eventsOfDate);
    setShowDateEventsModal(true);
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowForm(false);
    setShowDateEventsModal(false);
  };

  const openForm = () => {
    setApplyId(null);
    setSelectedDate("");
    setTimeSlot("");
    setReason("");
    setAlternative("");
    setEtc("");
    setShowForm(true);
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
    if (!timeSlot) {
      alert("신청내용을 선택해주세요.");
      return;
    }

    const eventPayload = {
      applyId,
      usernumber: userID,
      username,
      applyDate: selectedDate,
      timeSlot,
      reason,
      alternativePlan: alternative,
      etc,
    };

    const m = moment(currentViewDate);

    if (applyId) {
      axios
        .put(`/api/schedule/apply/${applyId}`, eventPayload, { withCredentials: true })
        .then(() => {
          alert("수정되었습니다.");
          fetchEvents(m.year(), m.month() + 1);
          closeModal();
        })
        .catch((err) => {
          alert("수정 중 오류 발생");
          console.error(err);
        });
    } else {
      axios
        .post("/api/schedule/apply", eventPayload, { withCredentials: true })
        .then(() => {
          console.log(eventPayload); // 실제 보내는 값 확인
          alert("신청되었습니다.");
          fetchEvents(m.year(), m.month() + 1);
          closeModal();
        })
        .catch((err) => {
          console.log(eventPayload); // 실제 보내는 값 확인
          alert("신청 중 오류 발생");
          console.error(err);
        });
    }
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
      closeModal();
    }
  };

  const handleShowMore = (events, date) => {
    setSelectedDateEvents(events);
    setShowDateEventsModal(true);
  };

  const handleEdit = () => {
    setApplyId(selectedEvent.applyId);
    setSelectedDate(moment(selectedEvent.start).format("YYYY-MM-DD"));
    setTimeSlot(selectedEvent.timeSlot);
    setReason(selectedEvent.reason);
    setAlternative(selectedEvent.alternativePlan);
    setEtc(selectedEvent.etc);
    setSelectedEvent(null);
    setShowForm(true);
    if (allowedDates.includes(moment(selectedEvent.start).format("YYYY-MM-DD"))) {
  setSelectedDate(moment(selectedEvent.start).format("YYYY-MM-DD"));
}
  };

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .delete(`/api/schedule/apply/${selectedEvent.applyId}`, { withCredentials: true })
        .then(() => {
          alert("삭제되었습니다.");
          fetchEvents(currentViewDate.year(), currentViewDate.month() + 1);
          setSelectedEvent(null);
        })
        .catch(() => {
          alert("삭제 실패했습니다.");
        });
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = statusColors["오픈신청"];

    if (event.timeSlot && statusColors[event.timeSlot]) {
      backgroundColor = statusColors[event.timeSlot];
    }

    const style = {
      backgroundColor,
      borderRadius: "4px",
      opacity: 0.9,
      color: "white",
      border: "none",
      display: "block",
    };

    return { style };
  };
  const handleRemoveSelectedDate = (date) => {
  setSelectedDates(selectedDates.filter((d) => d !== date));
};

const handleSubmitAllowedDates = () => {
  if (selectedDates.length === 0) {
    alert("선택된 날짜가 없습니다.");
    return;
  }

  axios.post("/api/allowed-dates/bulk", selectedDates, { withCredentials: true })
  .then(res => {
    setAllowedDates([...allowedDates, ...res.data]); // id 포함된 객체
    setSelectedDates([]);
    console.log("저장 요청 날짜들 : ", selectedDates);
    alert("날짜가 저장되었습니다.");
  })
  .catch((err) => {
    console.error("날짜 저장 실패", err);
    alert("날짜 저장에 실패했습니다.");
  });
};

  return (
    <>
      {userID === 202126845 && (
  <div className="admin-date-setter">
    <h4>신청 가능 날짜 설정</h4>
    <input
      type="date"
      onChange={(e) => {
        const date = e.target.value;
        if (date && !selectedDates.includes(date)) {
          setSelectedDates([...selectedDates, date]);
        } else {
          alert("이미 선택된 날짜입니다.");
        }
      }}
    />
    <ul>
      {selectedDates.map(date => (
        <li key={date}>
          {date}
          <button onClick={() => handleRemoveSelectedDate(date)}>삭제</button>
        </li>
      ))}
    </ul>

    {/* '날짜들 저장' 버튼을 이 위치로 옮겼습니다. */}
    <button className="admin-save-button" onClick={handleSubmitAllowedDates}>신청 기간 저장</button>

    <hr />
    <h4>현재 저장된 신청 가능 날짜</h4>
    <ul>
      {allowedDates.map(d => (
        <li key={d.id}>
          {d.date}
          <button onClick={() => handleRemoveAllowedDate(d.id)}>삭제</button>
        </li>
      ))}
    </ul>
  </div>
)}

<div className="container">
  <div className="status-color-wrapper">
    {Object.entries(statusColors).map(([status, color]) => (
      <div key={status} className="status-color-item">
        <div className="status-color-box" style={{ backgroundColor: color }} />
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
  dayPropGetter={(date) => {
    const dateStr = moment(date).format("YYYY-MM-DD");
    const isAllowed = allowedDates.some((d) => d.date === dateStr);

    return {
      style: {
        backgroundColor: isAllowed ? "white" : "#f0f0f0",
        cursor: isAllowed ? "pointer" : "not-allowed",
      },
    };
  }}
/>
        </div>

        {loading && <div className="loading-indicator">로딩 중...</div>}

        <div className="footer-buttons">
          <button
            className="action-button"
            style={{ backgroundColor: "#777" }}
            onClick={() => navigate("/schedulePage")}
          >
            ← 이전으로
          </button>

          <button className="action-button" onClick={openForm}>
            신청하기
          </button>

          <div style={{ width: "100px" }} />
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
<select
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
>
  <option value="">-- 날짜 선택 --</option>
  {allowedDates.map((d) => (
    <option key={d.id} value={d.date}>
      {d.date}
    </option>
  ))}
</select>

              <label>신청 내용</label>
              <div className="time-slot-buttons">
                {["휴무신청", "오픈신청", "미들신청", "마감신청"].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={timeSlot === slot ? "selected" : ""}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <label>사유</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
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
              <h3 className="modal-header-with-time">
                신청 정보
                <small className="time-info">
                  작성된 시간:{" "}
                  {selectedEvent.createAt
                    ? moment(selectedEvent.createAt).format("YYYY-MM-DD HH:mm:ss") +
                      (selectedEvent.updatedAt ? " (수정됨)" : "")
                    : "정보 없음"}
                </small>
              </h3>
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
              <label>신청 내용</label>
              <input type="text" value={selectedEvent.timeSlot || "선택 안됨"} readOnly />
              <label>사유</label>
              <textarea value={selectedEvent.reason} readOnly rows={3} />
              <label>대체 방안</label>
              <textarea value={selectedEvent.alternativePlan} readOnly rows={3} />
              <label>기타</label>
              <textarea value={selectedEvent.etc} readOnly rows={2} />

              {selectedEvent.usernumber === userID && (
                <div className="modal-button-group">
                  <button onClick={handleEdit}>수정</button>
                  <button onClick={handleDelete} className="delete-button">
                    삭제
                  </button>
                </div>
              )}
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
              <ul className="event-list">
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents
            .sort((a, b) => new Date(a.createAt) - new Date(b.createAt))
            .map((evt, idx) => (
                    <li
              key={idx}
              className="event-list-item"
              onClick={() => {
                handleSelectEvent(evt);
              }}
              style={{
                cursor: "pointer",
                display: "flex", // flexbox를 사용하여 내부 요소를 정렬합니다.
                justifyContent: "space-between", // 첫 번째 요소와 마지막 요소를 양 끝으로 보냅니다.
                border: evt.isMySchedule ? "2px solid #1976d2" : "1px solid #ddd",
                backgroundColor: evt.isMySchedule ? "#e3f2fd" : "#fff",
                fontWeight: evt.isMySchedule ? "bold" : "normal",
                padding: "8px",
                borderRadius: "4px",
                marginBottom: "4px",
              }}
            >
              <div>
                <strong>{evt.username}</strong> - {evt.timeSlot || "시간 미지정"}
              </div>
              {evt.createAt && (
                <span style={{ fontSize: '0.8em', color: '#666' }}>
                  작성: {moment(evt.createAt).format("YYYY.MM.DD HH:mm")}
                </span>
              )}
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
