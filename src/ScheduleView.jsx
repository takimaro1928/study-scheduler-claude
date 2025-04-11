// src/ScheduleView.jsx (超シンプル表示テスト版)
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
// import { DndContext, ... } from '@dnd-kit/core'; // DnD一時停止
// import DayDetailModal from './DayDetailModal'; // モーダル一時停止

const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // const [activeDragItem, setActiveDragItem] = useState(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalDate, setModalDate] = useState(null);
  // const [modalQuestions, setModalQuestions] = useState([]);

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

  return (
    // <DndContext> を一時的に削除
      <div style={{ padding: '1rem', maxWidth: '64rem', margin: 'auto', paddingBottom: '5rem' }}>
        {/* カレンダーヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                <Calendar style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#4f46e5' }} />
                学習スケジュール
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '9999px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', padding: '0.25rem 0.5rem' }}>
                <button onClick={() => changeMonth(-1)} style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', background: 'none', border: 'none', cursor: 'pointer' }}> <ChevronLeft style={{ width: '1.25rem', height: '1.25rem', color: '#4f46e5' }} /> </button>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0.5rem', minWidth: '120px', textAlign: 'center' }}> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
                <button onClick={() => changeMonth(1)} style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', background: 'none', border: 'none', cursor: 'pointer' }}> <ChevronRight style={{ width: '1.25rem', height: '1.25rem', color: '#4f46e5' }} /> </button>
            </div>
        </div>

        {/* カレンダー本体 */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)', padding: '1rem', border: '1px solid #e5e7eb' }}>
          {/* 曜日ヘッダー */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px', marginBottom: '0.5rem' }}>
            {weekDays.map((day, index) => (
              <div key={index} style={{ textAlign: 'center', padding: '0.375rem 0', fontWeight: 'bold', fontSize: '0.8rem', borderRadius: '0.375rem',
                                        color: index === 0 ? '#dc2626' : index === 6 ? '#2563eb' : '#374151',
                                        backgroundColor: index === 0 ? '#fee2e2' : index === 6 ? '#dbeafe' : '#f3f4f6' }}>
                {day}
              </div>
            ))}
          </div>
          {/* 日付セル */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
            {(calendarWeeks && calendarWeeks.length > 0) ? (
              calendarWeeks.flat().map((dayData, index) => {
                const cellKey = dayData?.date ? dayData.date.toISOString().split('T')[0] : `empty-${index}-${currentMonth.getMonth()}`;
                const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);

                if (!isValidDate) {
                  return <div key={cellKey} style={{ border: '1px solid #f3f4f6', minHeight: '80px', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}></div>;
                }

                const isToday = dayData.date.toDateString() === new Date().toDateString();

                return (
                  // ★★★ 超シンプルなセル表示 ★★★
                  <div key={cellKey} style={{ border: '1px solid #d1d5db', minHeight: '80px', padding: '4px', borderRadius: '0.375rem', backgroundColor: isToday ? '#e0f2fe' : 'white' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: isToday ? 'bold': 'normal' }}>{dayData.day}</div>
                    {/* 問題の表示は一旦コメントアウト */}
                    {/* <div style={{ marginTop: '4px' }}>
                      {(dayData.questions || []).slice(0,3).map(q => <div key={q.id} style={{fontSize: '0.7rem', border:'1px solid blue', margin:'1px 0'}}>{q.id}</div>)}
                      {(dayData.questions?.length || 0) > 3 && <div style={{fontSize: '0.7rem', textAlign:'center'}}>+ more</div>}
                    </div> */}
                  </div>
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
      {/* DragOverlay と Modal を一時的にコメントアウト */}
      {/* <DragOverlay ... /> */}
      {/* <DayDetailModal ... /> */}
    // </DndContext> // DndContext も一時的にコメントアウト
  );
};

export default ScheduleView;
