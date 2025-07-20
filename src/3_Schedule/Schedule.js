import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function Schedule() {
  const [events] = useState([
    {
      title: "예시 일정",
      start: new Date(2025, 6, 21, 10, 0),
      end: new Date(2025, 6, 21, 12, 0),
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <>
      <style>{`
        .container {
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #e6f2ff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        h2 {
          color: #003366;
          margin-bottom: 1.5rem;
          font-weight: bold;
          font-size: 1.8rem;
          text-align: center;
        }

        .calendar-wrapper {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #99ccff;
          background-color: #cce6ff;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          height: 600px;
          overflow: hidden;
        }

        .rbc-toolbar, .rbc-month-view, .rbc-month-header {
          color: #003366 !important;
          font-weight: 600 !important;
        }

        .schedule-modal {
          position: absolute;
          top: 25%;
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          background-color: #cce6ff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.15);
          padding: 1rem 1.5rem;
          z-index: 1000;
          color: #003366;
          font-weight: 600;
        }

        .schedule-modal-close {
          float: right;
          background: transparent;
          border: none;
          font-size: 1.4rem;
          cursor: pointer;
          line-height: 1;
          color: #003366;
          font-weight: bold;
        }

        .schedule-modal p {
          margin: 0.4rem 0;
          font-weight: 400;
          color: #333;
          font-size: 1rem;
        }

        .backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0,0,0,0.25);
          z-index: 900;
        }

        button.close-btn:hover {
          color: #ff4d4f;
        }
      `}</style>

      <div className="container">
        <h2>스케줄 신청 페이지</h2>
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="month"
            style={{ height: "100%" }}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        {selectedEvent && (
          <>
            <div className="schedule-modal" role="dialog" aria-modal="true">
              <button
                className="schedule-modal-close close-btn"
                onClick={closeModal}
                aria-label="모달 닫기"
              >
                &times;
              </button>
              <h3>{selectedEvent.title}</h3>
              <p><strong>시작 시간:</strong> {moment(selectedEvent.start).format('YYYY-MM-DD HH:mm')}</p>
              <p><strong>종료 시간:</strong> {moment(selectedEvent.end).format('YYYY-MM-DD HH:mm')}</p>
            </div>
            <div className="backdrop" onClick={closeModal} />
          </>
        )}
      </div>
    </>
  );
}

export default Schedule;
