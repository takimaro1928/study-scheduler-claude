// src/ScheduleView.jsx (超絶シンプル表示テスト版 v4)
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
// CSS Modules import も削除
// import styles from './ScheduleView.module.css';
// DayDetailModal import も削除
// import DayDetailModal from './DayDetailModal';
// DnD 関連も削除

const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // モーダル、DnD関連のstate削除

  const changeMonth = (offset) => {
     const newMonth = new Date(currentMonth);
     newMonth.setMonth(newMonth.getMonth() + offset);
     setCurrentMonth(newMonth);
  };

  const getCalendarData = () => { // ロジックは変更なし
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
                  // getQuestionsForDate は呼び出すが、エラーチェックは強化
                  let questionsForDay = [];
                  try {
                     questionsForDay = getQuestionsForDate(currentDate) || [];
                  } catch (e) {
                      console.error(`getQuestionsForDate Error for ${currentDate}:`, e);
                  }
                  weekData.push({ day: dayCounter, date: currentDate, questions: questionsForDay });
              }
              if (weekData.length === 7) { calendar.push(weekData); weekData = []; }
              dayCounter++;
          }
          if (weekData.length > 0) { while (weekData.length < 7) { weekData.push(null); } calendar.push(weekData); }
          return calendar; // 常に配列を返す
      } catch (error) { console.error("カレンダー生成エラー:", error); return []; } // エラー時は空配列
  };

  const calendarWeeks = getCalendarData() || []; // 念のためデフォルト値
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  // ハンドラ、センサーなど DnD関連削除

  return (
    // DndContext削除
      <div style={{ padding: '1rem', maxWidth: '64rem', margin: 'auto', paddingBottom: '5rem' }}>
        {/* カレンダーヘッダー (変更なし) */}
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
          {/* ★★★ 日付セル描画を超シンプルに ★★★ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
            {(Array.isArray(calendarWeeks) && calendarWeeks.length > 0) ? (
              calendarWeeks.flat().map((dayData, index) => {
                const key = `cell-${index}`; // シンプルなキー
                const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);

                // スタイルを直接定義
                const cellStyle = {
                    border: isValidDate ? '1px solid #d1d5db' : '1px solid #f3f4f6', // 枠線
                    minHeight: '50px', // 最低限の高さ
                    padding: '4px',
                    fontSize: '10px',
                    backgroundColor: isValidDate ? (new Date(dayData.date).toDateString() === new Date().toDateString() ? '#e0f2fe' : 'white') : '#f9fafb', // 今日 or 白 or 空セル
                };

                return (
                  <div key={key} style={cellStyle}>
                    {isValidDate ? dayData.day : ''} {/* 日付番号だけ表示 */}
                    {/* 問題リストも表示しない */}
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
    // DndContext削除
    // Modal削除
  );
};

// Minimalコンポーネント定義も削除

export default ScheduleView;
