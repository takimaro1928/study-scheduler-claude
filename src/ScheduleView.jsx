// src/ScheduleView.jsx (超シンプル表示テスト版 v2 - コメント等削除)
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'; // DnD関連アイコン削除

// CSSファイルをインポートする場合 (例)
// import './ScheduleViewMinimal.css'; // または index.css にスタイルがあるか確認

// --- シンプルな DraggableQuestion (ドラッグ機能なしの表示のみ) ---
function MinimalDraggableQuestion({ question }) {
  // DnDフック削除
  const style = { // インラインスタイルで最低限の見た目
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
  return (
    <div style={style}>
      {question.id}
    </div>
  );
}

// --- シンプルな DroppableDateCell (ドロップ機能なしの表示のみ) ---
function MinimalDroppableCell({ dayData, cellKey, openModal }) {
  const MAX_ITEMS_VISIBLE = 3;
  const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);

  // セルの基本クラス（インラインスタイルで代替）
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
    // DnDフック削除 - setNodeRef 不要
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

  // DnDフック削除 - setNodeRef 不要
  return (
    <div style={cellStyle}>
      <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: isToday ? 'bold': 'normal', marginBottom: '2px' }}>{dayData.day}</div>
      <div style={{ marginTop: '4px', overflowY: 'auto', maxHeight: '60px', flexGrow: 1 }}>
        {questionsToShow.slice(0, MAX_ITEMS_VISIBLE).map(q => (
          // MinimalDraggableQuestion を使用
          <MinimalDraggableQuestion key={q.id} question={q} />
        ))}
      </div>
      {hiddenCount > 0 && (
        <div
           // className="show-more-debug" // クラス名削除 -> インライン or 別途CSSで
           style={{ fontSize: '0.7rem', textAlign:'center', color: 'blue', cursor: 'pointer', marginTop: 'auto', paddingTop: '2px', borderTop: '1px dashed #ccc'}}
           onClick={() => openModal(dayData.date, questionsToShow)}
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
  // DnD関連のstate削除
  // const [activeDragItem, setActiveDragItem] = useState(null);
  // モーダル関連のstateは残す (ただし呼び出し元 openModal は MinimalDroppableCell に仮で渡す)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalQuestions, setModalQuestions] = useState([]);

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
                  const questionsForDay = getQuestionsForDate(currentDate) || [];
                  weekData.push({ day: dayCounter, date: currentDate, questions: questionsForDay });
              }
              if (weekData.length === 7) { calendar.push(weekData); weekData = []; }
              dayCounter++;
          }
          if (weekData.length > 0) { while (weekData.length < 7) { weekData.push(null); } calendar.push(weekData); }
          // console.log('getCalendarData result:', calendar); // デバッグログは削除
          return calendar;
      } catch (error) { console.error("カレンダー生成エラー:", error); return []; }
  };

  const calendarWeeks = getCalendarData() || [];
  // console.log('Rendering calendarWeeks:', calendarWeeks); // デバッグログは削除

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  // Dnd関連のハンドラ、センサー削除
  // const sensors = useSensors(...)
  // const handleDragStart = (...) => {...};
  // const handleDragEnd = (...) => {...};

  // モーダル関連の関数は残す
  const openDayModal = (date, questions) => {
      setModalDate(date);
      setModalQuestions(questions);
      setIsModalOpen(true);
  };
  const closeDayModal = () => {
      setIsModalOpen(false);
      setModalDate(null);
      setModalQuestions([]);
   };

  return (
    // DndContext削除
      <div style={{ padding: '1rem', maxWidth: '64rem', margin: 'auto', paddingBottom: '5rem' }}>
        {/* カレンダーヘッダー (インラインスタイル) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <Calendar style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#4f46e5' }} />
              学習スケジュール
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '9999px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', padding: '0.25rem 0.5rem' }}>
              <button onClick={() => changeMonth(-1)} style={{ /*...*/ background: 'none', border: 'none', cursor: 'pointer' }}> <ChevronLeft style={{ width: '1.25rem', height: '1.25rem', color: '#4f46e5' }} /> </button>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: '0 0.5rem', minWidth: '120px', textAlign: 'center' }}> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
              <button onClick={() => changeMonth(1)} style={{ /*...*/ background: 'none', border: 'none', cursor: 'pointer' }}> <ChevronRight style={{ width: '1.25rem', height: '1.25rem', color: '#4f46e5' }} /> </button>
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
                  // シンプルなセルコンポーネントを使用
                  <MinimalDroppableCell
                    key={cellKey}
                    dayData={dayData}
                    cellKey={cellKey}
                    openModal={openDayModal}
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

      // Modal は表示
      <DayDetailModal isOpen={isModalOpen} onClose={closeDayModal} date={modalDate} questions={modalQuestions} formatDate={formatDate} />

  );
};

export default ScheduleView;
