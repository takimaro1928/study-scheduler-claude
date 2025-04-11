// src/ScheduleView.jsx (表示・レイアウト改善版)
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

// --- DraggableQuestion コンポーネント (表示内容・スタイル改善) ---
function DraggableQuestion({ question, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: question.id,
    data: { question },
  });

  // スタイル調整: ドラッグ中と通常時
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.9 : 1, // ドラッグ中も少し見えるように
    cursor: 'grab',
    padding: '4px 8px', // 内側余白
    backgroundColor: isDragging ? '#6366f1' : '#eef2ff', // ドラッグ中は濃い色 (indigo-500 / indigo-50)
    color: isDragging ? '#ffffff' : '#4338ca',         // ドラッグ中は白文字 (indigo-700)
    borderRadius: '4px', // rounded-sm or rounded
    fontSize: '0.75rem', // text-xs
    margin: '2px 0',
    border: `1px solid ${isDragging ? '#4f46e5' : '#c7d2fe'}`, // ドラッグ中は濃い枠線 (indigo-600 / indigo-200)
    display: 'flex',
    alignItems: 'center',
    // テキストが長すぎる場合に省略 (...)
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxShadow: isDragging ? '0 4px 8px rgba(0, 0, 0, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)', // ドラッグ中に影を強調
    transition: 'all 0.2s ease', // トランジション
  };

  // 科目名を適切な長さで表示 (例: 4文字まで)
  const subjectAbbreviation = question.subjectName ? question.subjectName.substring(0, 4) : '';

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}>
      {/* ドラッグハンドル */}
      <GripVertical size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
      {/* 表示内容: 科目名省略 + 問題ID */}
      <span className="font-medium overflow-hidden text-ellipsis">
        {subjectAbbreviation} - {question.id}
      </span>
    </div>
  );
}

// --- DroppableDateCell コンポーネント (レイアウト改善) ---
function DroppableDateCell({ dayData, cellKey }) {
  const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);
  const droppableId = isValidDate ? dayData.date.toISOString().split('T')[0] : `empty-${cellKey}`;
  const droppableData = isValidDate ? { date: dayData.date } : null;

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    disabled: !isValidDate,
    data: droppableData
  });

  // --- スタイル計算 ---
  let cellClasses = "relative flex flex-col p-1.5 sm:p-2 rounded-lg border min-h-[100px] sm:min-h-[110px] "; // 高さを少し増やす
  let dayNumberClasses = "text-right font-semibold text-xs mb-0.5 "; // font-semibold に変更

  if (!isValidDate) {
    cellClasses += "bg-gray-50 border-gray-100 ";
    return <div key={cellKey} ref={setNodeRef} className={cellClasses}></div>;
  }

  const isToday = dayData.date.toDateString() === new Date().toDateString();
  if (isToday) {
    cellClasses += "bg-blue-50 border-blue-300 ring-1 ring-blue-300 ";
    dayNumberClasses += "text-blue-700 ";
  } else {
    cellClasses += "bg-white border-gray-200 hover:border-indigo-300 ";
    dayNumberClasses += "text-gray-500 "; // 通常の日付の色を少し薄く
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
      {/* 問題リスト表示エリア (レイアウト調整) */}
      {/* flex-growで残りの高さを埋め、overflow-y-autoでスクロール */}
      <div className="flex-grow space-y-1 overflow-y-auto pr-1" style={{maxHeight: '80px'}}> {/* maxHeight調整, 右にpadding追加 */}
        {dayData.questions && dayData.questions.map(q => (
          // DraggableQuestion に isDragging={false} を明示的に渡す必要はない
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


// --- ScheduleView 本体 (変更なし) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDragItem, setActiveDragItem] = useState(null);

  const changeMonth = (offset) => { /* ... */
     const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
   };
  const getCalendarData = () => { /* ... */
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

  const sensors = useSensors( /* ... */
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
      useSensor(KeyboardSensor)
   );
  const handleDragStart = (event) => { /* ... */
        const { active } = event;
      let draggedQuestion = null;
      // subjectsを検索してドラッグされた問題オブジェクトを見つける
      // この検索ロジックはデータ構造に依存するため、必要に応じて調整
      subjects.flat().forEach(subject => {
          subject.chapters.forEach(chapter => {
              const found = chapter.questions.find(q => q.id === active.id);
              if(found) draggedQuestion = found;
          });
      });
      setActiveDragItem(draggedQuestion); // 問題オブジェクト全体をstateに保存
   };
  const handleDragEnd = (event) => { /* ... */
      const { active, over } = event;
    setActiveDragItem(null);

    if (over && active.id !== over.id) {
      const questionId = active.id;
      const targetDate = over.data.current?.date;

      if (targetDate instanceof Date && !isNaN(targetDate.getTime())) {
          handleQuestionDateChange(questionId, targetDate);
      } else {
          // IDが日付形式でない場合（例: 'empty-...'）、何もしないか、エラーログ
          if (typeof over.id === 'string' && !over.id.startsWith('empty-')) {
             console.error("ドロップ先IDから日付を特定できません:", over.id);
          }
      }
    }
   };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 max-w-5xl mx-auto pb-20">
        {/* カレンダーヘッダー (変更なし) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
           {/* ... */}
            <h2 className="text-xl font-bold text-gray-800 flex items-center"> <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> 学習スケジュール </h2>
             <div className="flex items-center bg-white rounded-full shadow-sm px-2 py-1 mt-2 md:mt-0">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronLeft className="w-5 h-5 text-indigo-600" /> </button>
                <h3 className="text-lg font-bold text-gray-800 mx-2 min-w-[120px] text-center"> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronRight className="w-5 h-5 text-indigo-600" /> </button>
             </div>
        </div>

        {/* カレンダー本体 */}
        <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 border border-gray-200">
          {/* 曜日ヘッダー (変更なし) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDays.map((day, index) => ( <div key={index} className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${ index === 0 ? 'text-red-600 bg-red-50' : index === 6 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 bg-gray-50' }`}> {day} </div> ))}
          </div>
          {/* 日付セル */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarWeeks.flat().map((dayData, index) => {
               const cellKey = dayData ? dayData.date.toISOString().split('T')[0] : `empty-${index}-${currentMonth.getMonth()}`; // キーの一意性を高める
               return (
                 <DroppableDateCell
                   key={cellKey}
                   dayData={dayData}
                   cellKey={cellKey}
                 />
               );
            })}
          </div>
        </div>
      </div>

      {/* DragOverlay (DraggableQuestionにisDragging=trueを渡す) */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          // ドラッグ中のアイテム表示: DraggableQuestionを再利用し、isDraggingフラグを立てる
          <DraggableQuestion question={activeDragItem} isDragging={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ScheduleView;
