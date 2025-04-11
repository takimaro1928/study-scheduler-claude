// src/ScheduleView.jsx (背景色・曜日ヘッダー修正版)
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
import DayDetailModal from './DayDetailModal';

// --- DraggableQuestion コンポーネント (変更なし) ---
function DraggableQuestion({ question, isDragging }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: question.id, data: { question }, });
    const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.9 : 1, cursor: 'grab', padding: '4px 8px', backgroundColor: isDragging ? '#6366f1' : '#eef2ff', color: isDragging ? '#ffffff' : '#4338ca', borderRadius: '4px', fontSize: '0.75rem', margin: '2px 0', border: `1px solid ${isDragging ? '#4f46e5' : '#c7d2fe'}`, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', boxShadow: isDragging ? '0 4px 8px rgba(0, 0, 0, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)', transition: 'all 0.2s ease', };
    const subjectAbbreviation = question.subjectName ? question.subjectName.substring(0, 4) : '';
    return ( <div ref={setNodeRef} style={style} {...listeners} {...attributes} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}> <GripVertical size={14} className="mr-1.5 text-gray-400 flex-shrink-0" /> <span className="font-medium overflow-hidden text-ellipsis"> {subjectAbbreviation} - {question.id} </span> </div> );
}

// --- DroppableDateCell コンポーネント (背景色とテキスト色を調整) ---
function DroppableDateCell({ dayData, cellKey, openModal }) {
  const MAX_ITEMS_VISIBLE = 3;
  const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);
  const droppableId = isValidDate ? dayData.date.toISOString().split('T')[0] : `empty-${cellKey}`;
  const droppableData = isValidDate ? { date: dayData.date } : null;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId, disabled: !isValidDate, data: droppableData });

  // --- スタイル計算 (修正箇所) ---
  let cellClasses = "relative flex flex-col p-1 sm:p-1.5 rounded-lg border min-h-[100px] sm:min-h-[110px] ";
  let dayNumberClasses = "text-right font-semibold text-xs mb-0.5 ";

  if (!isValidDate) {
    cellClasses += "bg-gray-50 border-gray-100 "; // 空セル
    return <div key={cellKey} ref={setNodeRef} className={cellClasses}></div>;
  }

  const isToday = dayData.date.toDateString() === new Date().toDateString();
  const dayOfWeek = dayData.date.getDay(); // 0=Sun, 6=Sat

  // 背景色と枠線
  if (isToday) {
    cellClasses += "bg-blue-50 border-blue-300 ring-1 ring-blue-300 "; // 今日の背景色
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    cellClasses += "bg-gray-50 border-gray-200 "; // 土日の背景色 (薄いグレー)
  } else {
    cellClasses += "bg-white border-gray-200 "; // 通常の白背景
  }
  cellClasses += "hover:border-indigo-300 "; // ホバー時の枠線

  // 日付の文字色
  if (isToday) {
    dayNumberClasses += "text-blue-700 ";
  } else if (dayOfWeek === 0) {
    dayNumberClasses += "text-red-500 "; // 日曜の文字色
  } else if (dayOfWeek === 6) {
    dayNumberClasses += "text-blue-500 "; // 土曜の文字色
  } else {
    dayNumberClasses += "text-gray-500 "; // 平日の文字色
  }

  // ドロップオーバー時のスタイル
  if (isOver) {
      cellClasses += "border-dashed border-2 border-indigo-400 bg-indigo-100 "; // isOver時の背景を少し濃く
  } else {
      cellClasses += "transition-colors duration-150 ";
  }
  // --- スタイル計算ここまで ---

  const questionsToShow = dayData.questions || [];
  const hiddenCount = questionsToShow.length - MAX_ITEMS_VISIBLE;

  return (
    <div ref={setNodeRef} className={cellClasses}>
      <div className={dayNumberClasses}>
        {dayData.day}
      </div>
      <div className="flex-grow space-y-1 overflow-hidden" style={{maxHeight: '80px'}}>
        {questionsToShow.slice(0, MAX_ITEMS_VISIBLE).map(q => (
          <DraggableQuestion key={q.id} question={q} />
        ))}
      </div>
      {hiddenCount > 0 && (
        <div
          className="mt-auto pt-1 text-center text-xs text-indigo-600 font-medium cursor-pointer hover:underline"
          onClick={() => openModal(dayData.date, questionsToShow)}
        >
          + あと {hiddenCount} 件
        </div>
      )}
      {isOver && !hiddenCount > 0 && (
           <div className="text-center text-xs text-indigo-400 py-1 border border-dashed border-indigo-300 rounded-md mt-1">ここにドロップ</div>
       )}
    </div>
  );
}


// --- ScheduleView 本体 (曜日ヘッダー追加) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalQuestions, setModalQuestions] = useState([]);

  const changeMonth = (offset) => { /* ... */ };
  const getCalendarData = () => { /* ... */ };
  const calendarWeeks = getCalendarData() || [];
  // *** 修正点: 曜日ヘッダー用の配列 ***
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const sensors = useSensors( /* ... */ );
  const handleDragStart = (event) => { /* ... */ };
  const handleDragEnd = (event) => { /* ... */ };
  const openDayModal = (date, questions) => { /* ... */ };
  const closeDayModal = () => { /* ... */ };

  return (
    <DndContext /* ... */ >
      <div className="p-4 max-w-5xl mx-auto pb-20">
        {/* カレンダーヘッダー (変更なし) */}
        {/* ... */}
        {/* カレンダー本体 */}
        <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 border border-gray-200">
          {/* *** 追加: 曜日ヘッダー *** */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${
                  index === 0 ? 'text-red-600 bg-red-50' : //日曜の色
                  index === 6 ? 'text-blue-600 bg-blue-50' : //土曜の色
                  'text-gray-600 bg-gray-50' //平日の色
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          {/* 日付セル (変更なし) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarWeeks.flat().map((dayData, index) => {
               const cellKey = dayData?.date ? dayData.date.toISOString().split('T')[0] : `empty-${index}-${currentMonth.getMonth()}`;
               return (
                 <DroppableDateCell
                   key={cellKey}
                   dayData={dayData}
                   cellKey={cellKey}
                   openModal={openDayModal}
                 />
               );
            })}
          </div>
        </div>
      </div>

      {/* DragOverlay (変更なし) */}
      {/* ... */}
      {/* 日付詳細モーダル (変更なし) */}
      <DayDetailModal
        isOpen={isModalOpen}
        onClose={closeDayModal}
        date={modalDate}
        questions={modalQuestions}
        formatDate={formatDate}
      />
    </DndContext>
  );
};

export default ScheduleView;
