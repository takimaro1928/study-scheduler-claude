// src/ScheduleView.jsx (修正版 v2: Rules of Hooks 対応)
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- DraggableQuestion コンポーネント (変更なし) ---
function DraggableQuestion({ question, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: question.id,
    data: { question },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    cursor: 'grab',
    padding: '4px 8px',
    backgroundColor: isDragging ? '#a5b4fc' : '#e0e7ff',
    color: isDragging ? '#ffffff' : '#3730a3',
    borderRadius: '6px',
    fontSize: '0.75rem',
    margin: '2px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    border: `1px solid ${isDragging ? '#818cf8' : '#c7d2fe'}`,
    display: 'flex',
    alignItems: 'center',
    boxShadow: isDragging ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}>
      <GripVertical size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
      <span className="font-medium">
        {question.subjectName?.substring(0, 2)} - {question.id}
      </span>
    </div>
  );
}

// --- DroppableDateCell コンポーネント (修正箇所) ---
function DroppableDateCell({ dayData, cellKey }) { // dayDataがnullの可能性もある, cellKeyを追加

  // ***修正点: フックを常に呼び出す***
  // IDはセルごとに一意にする (日付 or 空セルのキー)
  // dateオブジェクトは有効な場合のみdataに含める
  const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);
  const droppableId = isValidDate ? dayData.date.toISOString().split('T')[0] : `empty-${cellKey}`;
  const droppableData = isValidDate ? { date: dayData.date } : null;

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    disabled: !isValidDate, // 有効な日付でないセルはドロップ不可
    data: droppableData
  });

  // --- スタイル計算 ---
  let cellClasses = "relative flex flex-col p-1 sm:p-1.5 rounded-lg border min-h-[90px] sm:min-h-[100px] ";
  let dayNumberClasses = "text-right font-bold text-xs mb-0.5 ";

  if (!isValidDate) {
    // 空セルのスタイル
    cellClasses += "bg-gray-50 border-gray-100 ";
    return <div key={cellKey} ref={setNodeRef} className={cellClasses}></div>; // setNodeRefは適用しておく
  }

  // 有効な日付セルのスタイル
  const isToday = dayData.date.toDateString() === new Date().toDateString();
  if (isToday) {
    cellClasses += "bg-blue-50 border-blue-300 ring-1 ring-blue-300 ";
    dayNumberClasses += "text-blue-700 ";
  } else {
    cellClasses += "bg-white border-gray-200 hover:border-indigo-300 ";
    dayNumberClasses += "text-gray-600 ";
  }
  if (isOver) {
      cellClasses += "border-dashed border-2 border-indigo-400 bg-indigo-50 ";
  } else {
      cellClasses += "transition-colors duration-150 ";
  }
  // --- スタイル計算ここまで ---

  return (
    <div ref={setNodeRef} className={cellClasses}>
      {/* 日付番号 */}
      <div className={dayNumberClasses}>
        {dayData.day}
      </div>
      {/* 問題リスト表示エリア */}
      <div className="flex-grow space-y-0.5 overflow-y-auto" style={{maxHeight: '70px'}}>
        {dayData.questions && dayData.questions.map(q => (
          <DraggableQuestion key={q.id} question={q} />
        ))}
         {/* ドロップ可能エリアであることを示すプレースホルダー */}
        {isOver && (
             <div className="text-center text-xs text-indigo-400 py-1 border border-dashed border-indigo-300 rounded-md mt-1">ここにドロップ</div>
        )}
      </div>
    </div>
  );
}


// --- ScheduleView 本体 (map内の修正) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDragItem, setActiveDragItem] = useState(null);

  const changeMonth = (offset) => { /* ...変更なし... */
      const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
   };
  const getCalendarData = () => { /* ...変更なし... */
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
             if (isNaN(currentDate.getTime())) {
                 weekData.push(null);
             } else {
                currentDate.setHours(0, 0, 0, 0);
                const questionsForDay = getQuestionsForDate(currentDate);
                weekData.push({ day: dayCounter, date: currentDate, questions: questionsForDay || [] });
             }
            if (weekData.length === 7) { calendar.push(weekData); weekData = []; }
            dayCounter++;
        }
        if (weekData.length > 0) {
            while (weekData.length < 7) { weekData.push(null); }
            calendar.push(weekData);
        }
        return calendar;
    } catch (error) { console.error("カレンダー生成エラー:", error); return []; }
  };

  const calendarWeeks = getCalendarData();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // Dnd センサー, handleDragStart, handleDragEnd は変更なし
    const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );
   const handleDragStart = (event) => {
      const { active } = event;
      let draggedQuestion = null;
      for (const subject of subjects) {
          for (const chapter of subject.chapters) {
              draggedQuestion = chapter.questions.find(q => q.id === active.id);
              if (draggedQuestion) break;
          }
          if (draggedQuestion) break;
      }
      setActiveDragItem(draggedQuestion);
  };
    const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (over && active.id !== over.id) {
      const questionId = active.id;
      const targetDate = over.data.current?.date;

      if (targetDate instanceof Date && !isNaN(targetDate.getTime())) {
          handleQuestionDateChange(questionId, targetDate);
      } else {
          console.error("ドロップ先の日付データが無効:", over.data.current?.date);
      }
    }
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart} // DragOverlayのために必要
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 max-w-5xl mx-auto pb-20">
        {/* カレンダーヘッダー (変更なし) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            {/* ... ヘッダー内容 ... */}
             <h2 className="text-xl font-bold text-gray-800 flex items-center"> <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> 学習スケジュール </h2>
             <div className="flex items-center bg-white rounded-full shadow-sm px-2 py-1 mt-2 md:mt-0">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronLeft className="w-5 h-5 text-indigo-600" /> </button>
                <h3 className="text-lg font-bold text-gray-800 mx-2 min-w-[120px] text-center"> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronRight className="w-5 h-5 text-indigo-600" /> </button>
                {/* <div className="ml-3 ..."> 登録: {totalQuestions}問 </div> */}
             </div>
        </div>

        {/* カレンダー本体 */}
        <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 border border-gray-200">
          {/* 曜日ヘッダー (変更なし) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDays.map((day, index) => ( <div key={index} className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${ index === 0 ? 'text-red-600 bg-red-50' : index === 6 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 bg-gray-50' }`}> {day} </div> ))}
          </div>
          {/* 日付セル (*** 修正点: mapの中で常にDroppableDateCellをレンダリング ***) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* flat() で1次元配列にし、indexを使って一意なキーを生成 */}
            {calendarWeeks.flat().map((dayData, index) => {
               const cellKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${index}`;
               return (
                 <DroppableDateCell
                   key={cellKey}
                   dayData={dayData} // dayData自体を渡す (nullの場合も)
                   cellKey={cellKey}  // 空セルのID生成用にキーを渡す
                 />
               );
            })}
          </div>
        </div>
      </div>

      {/* DragOverlay (変更なし) */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          <DraggableQuestion question={activeDragItem} isDragging={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ScheduleView;
