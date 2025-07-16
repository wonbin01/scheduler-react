import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './1_login/Auth';
import Home from './2_login_succress/Home';// 로그인 후 이동할 컴포넌트
import Schedule from './3_Schedule/Schedule';
import Notice from './3_Notice/Notice';
import NoticeBoard from './3_Notice/CategoryNotice';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/home" element={<Home />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/notice" element={<Notice />} />
      <Route path="/notice/:category" element={<NoticeBoard />} />
    </Routes>
  </BrowserRouter>
);
