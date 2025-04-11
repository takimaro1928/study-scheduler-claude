// src/ScheduleView.jsx (超シンプル表示テスト版 v3 - 構文エラー修正)
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
// import DayDetailModal from './DayDetailModal'; // モーダルは一旦使わない

// --- このコンポーネント内で使うシンプルな表示用コンポーネント ---
function MinimalQuestionItem({ questionId }) {
  const style = {
    border: '1px solid blue',
    backgroundColor: 'lightblue',
    color: 'black',
    padding: '2px',
    margin: '2px 0',
    fontSize: '0.7rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  // DnD機能は完全に削除
  return (
    <div style={style}>
      {questionId}
    </div>
  );
}

function MinimalDateCell({ dayData, cellKey, openModal }) {
  const MAX_ITEMS_VISIBLE = 3;
  const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);

  let cellStyle = {
    border: '1px solid #eee',
    minHeight: '80px',
    padding: '4px',
    fontSize: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
  };

  if (!isValidDate) {
    cellStyle.backgroundColor = '#f8f8f8'; // 空セル
    return <div key={cellKey} style={cellStyle}></div>;
  }

  const isToday = dayData.date.toDateString() === new Date().toDateString();
  if (isToday) {
    cellStyle.backgroundColor = '#e0f2fe'; // 今日のセル
    cellStyle.borderColor = '#7dd3fc';
  } else {
    cellStyle.backgroundColor = 'white';
    cellStyle.borderColor = '#d1d5db';
  }

  const questionsToShow = dayData.questions || [];
  const hiddenCount = questionsToShow.length - MAX_ITEMS_VISIBLE;

  return (
    <div style={cellStyle}>
      <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: isToday ? 'bold': 'normal', marginBottom: '2px' }}>{dayData.day}</div>
      <div style={{ marginTop: '4px', overflowY: 'auto', maxHeight: '60px', flexGrow: 1 }}>
        {questionsToShow.slice(0, MAX_ITEMS_VISIBLE).map(q => (
          // シンプルな表示用コンポーネントを使用
          <MinimalQuestionItem key={q.id} questionId={q.id} />
        ))}
      </div>
      {hiddenCount > 0 && (
        <div
           style={{ fontSize: '0.7rem', textAlign:'center', color: 'blue', cursor: 'pointer', marginTop: 'auto', paddingTop: '2px', borderTop: '1px dashed #ccc'}}
           // onClick={() => openModal(dayData.date, questionsToShow)} // モーダル呼び出しも一旦停止
        >
          + あと {hiddenCount} 件
        </div>
      )}
    </div>
  );
}

// --- ScheduleView 本体 ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // モーダル、DnD関連のstate、ハンドラは一時的に削除
  // const [activeDragItem, setActiveDragItem] = useState(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalDate, setModalDate] = useState(null);
  // const [modalQuestions, setModalQuestions] = useState([]);
  // const sensors = useSensors(...)
  // const handleDragStart = (...) => {};
  // const handleDragEnd = (...) => {};
  // const openDayModal = (...) => {};
  // const closeDayModal = (...) => {};


  const changeMonth = (offset) => {
     const newMonth = new Date(currentMonth);
     newMonth.setMonth(newMonth.getMonth() + offset);
     setCurrentMonth(newMonth);
  };

  const getCalendarData = () => {
      try {
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const daysInMonth = lastDay.getDate();
          const startDayOfWeek = firstDay.getDay();
          const calendar = [];
          let dayCounter = 1;
          let weekData = [];
          for (let i = 0; i < startDayOfWeek; i++) { weekData.push(null); }
          while (dayCounter <= daysInMonth) {
              const currentDate = new Date(year, month, dayCounter);
              if (isNaN(currentDate.getTime())) { weekData.push(null); }
              else {
                  currentDate.setHours(0, 0, 0, 0);
                  // getQuestionsForDate を呼び出す必要はある
                  const questionsForDay = getQuestionsForDate(currentDate) || [];
                  weekData.push({ day: dayCounter, date: currentDate, questions: questionsForDay });
              }
              if (weekData.length === 7) { calendar.push(weekData); weekData = []; }
              dayCounter++;
          }
          if (weekData.length > 0) { while (weekData.length < 7) { weekData.push(null); } calendar.push(weekData); }
          return calendar;
      } catch (error) { console.error("カレンダー生成エラー:", error); return []; }
  };

  const calendarWeeks = getCalendarData() || [];
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // DndContext削除
  return (
      <div style={{ padding: '1rem', maxWidth: '64rem', margin: 'auto', paddingBottom: '5rem' }}>
        {/* カレンダーヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <Calendar style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#4f46e5' }} />
              学習スケジュール
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '9999px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', padding: '0.25rem 0.5rem' }}>
              <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}> <ChevronLeft style={{ width: '1.25rem', height: '1.25rem', color: '#4f46e5' }} /> </button>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0.5rem', minWidth: '120px', textAlign: 'center' }}> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
              <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}> <ChevronRight style={{ width: '1.25rem', height: '1.25rem', color: '#4f46e5' }} /> </button>
          </div>
        </div>

        {/* カレンダー本体 */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)', padding: '1rem', border: '1px solid #e5e7eb' }}>
          {/* 曜日ヘッダー */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px', marginBottom: '0.5rem' }}>
            {weekDays.map((day, index) => ( <div key={index} style={{ textAlign: 'center', padding: '0.375rem 0', fontWeight: 'bold', fontSize: '0.8rem', borderRadius: '0.375rem', color: index === 0 ? '#dc2626' : index === 6 ? '#2563eb' : '#374151', backgroundColor: index === 0 ? '#fee2e2' : index === 6 ? '#dbeafe' : '#f3f4f6' }}> {day} </div> ))}
          </div>
          {/* 日付セル */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
            {(calendarWeeks && calendarWeeks.length > 0) ? (
              calendarWeeks.flat().map((dayData, index) => {
                const cellKey = dayData?.date ? dayData.date.toISOString().split('T')[0] : `empty-${index}-${currentMonth.getMonth()}`;
                return (
                  <MinimalDateCell // シンプル版セルを使用
                    key={cellKey}
                    dayData={dayData}
                    cellKey={cellKey}
                    // openModal={openDayModal} // モーダル無効化
                  />
                );
              })
            ) : (
              <div style={{ gridColumn: 'span 7', textAlign: 'center', color: 'red', padding: '1rem' }}>
                カレンダーデータの生成に失敗したか、空です。
              </div>
            )}
          </div>
        </div>
      </div>
      // DndContext削除
      // Modal削除
  );
};

export default ScheduleView;
