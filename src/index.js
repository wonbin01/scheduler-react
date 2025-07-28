import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './1_login/Auth';
import Home from './2_login_succress/Home';// 로그인 후 이동할 컴포넌트
import Notice from './3_Notice/Notice';
import NoticeBoard from './3_Notice/CategoryNotice';
import NoticeDetail from './3_Notice/NoticeDetail';
import NoticeEdit from './3_Notice/NoticeEdit';
import SchedulePage from './3_Schedule/SchedulePage';
import ScheduleApply from './3_Schedule/ScheduleApplyPage';
import ScheduleView from './3_Schedule/ScheduleView';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/api/home" element={<Home />} />
      <Route path="/api/notice" element={<Notice />} />
      <Route path="/api/notice/:category" element={<NoticeBoard />} />
      <Route path="/api/notice/:category/:id" element={<NoticeDetail />} />
      <Route path="/api/notice/:category/:id/edit" element={<NoticeEdit />} />
      <Route path="/api/schedulePage" element={<SchedulePage />} />
      <Route path="/api/schedule/apply" element={<ScheduleApply />} />
      <Route path="/api/schedule/view" element={<ScheduleView />} />
    </Routes>
  </BrowserRouter>
);
