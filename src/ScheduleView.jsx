// src/ScheduleView.jsx (修正版 v3: calendarWeeks の undefined対策)
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

// --- DroppableDateCell コンポーネント (変更なし) ---
function DroppableDateCell({ dayData, cellKey, openModal }) {
    const MAX_ITEMS_VISIBLE = 3;
    const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);
    const droppableId = isValidDate ? dayData.date.toISOString().split('T')[0] : `empty-${cellKey}`;
    const droppableData = isValidDate ? { date: dayData.date } : null;
    const { isOver, setNodeRef } = useDroppable({ id: droppableId, disabled: !isValidDate, data: droppableData });
    let cellClasses = "relative flex flex-col p-1 sm:p-1.5 rounded-lg border min-h-[100px] sm:min-h-[110px] ";
    let dayNumberClasses = "text-right font-semibold text-xs mb-0.5 ";
    if (!isValidDate) { cellClasses += "bg-gray-50 border-gray-100 "; return <div key={cellKey} ref={setNodeRef} className={cellClasses}></div>; }
    const isToday = dayData.date.toDateString() === new Date().toDateString();
    if (isToday) { cellClasses += "bg-blue-50 border-blue-300 ring-1 ring-blue-300 "; dayNumberClasses += "text-blue-700 "; }
    else { cellClasses += "bg-white border-gray-200 hover:border-indigo-300 "; dayNumberClasses += "text-gray-500 "; }
    if (isOver) { cellClasses += "border-dashed border-2 border-indigo-400 bg-indigo-50 "; }
    else { cellClasses += "transition-colors duration-150 "; }
    const questionsToShow = dayData.questions || [];
    const hiddenCount = questionsToShow.length - MAX_ITEMS_VISIBLE;
    return ( <div ref={setNodeRef} className={cellClasses}> <div className={dayNumberClasses}> {dayData.day} </div> <div className="flex-grow space-y-1 overflow-hidden" style={{maxHeight: '80px'}}> {questionsToShow.slice(0, MAX_ITEMS_VISIBLE).map(q => ( <DraggableQuestion key={q.id} question={q} /> ))} </div> {hiddenCount > 0 && ( <div className="mt-auto pt-1 text-center text-xs text-indigo-600 font-medium cursor-pointer hover:underline" onClick={() => openModal(dayData.date, questionsToShow)}> + あと {hiddenCount} 件 </div> )} {isOver && !hiddenCount > 0 && ( <div className="text-center text-xs text-indigo-400 py-1 border border-dashed border-indigo-300 rounded-md mt-1">ここにドロップ</div> )} </div> );
}


// --- ScheduleView 本体 (calendarWeeks の undefined 対策) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalQuestions, setModalQuestions] = useState([]);

  const changeMonth = (offset) => { /* ... */ };
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
             if (isNaN(currentDate.getTime())) {
                 weekData.push(null);
             } else {
                currentDate.setHours(0, 0, 0, 0);
                const questionsForDay = getQuestionsForDate(currentDate) || []; // *** 常に配列を保証 ***
                weekData.push({ day: dayCounter, date: currentDate, questions: questionsForDay });
             }
            if (weekData.length === 7) { calendar.push(weekData); weekData = []; }
            dayCounter++;
        }
        if (weekData.length > 0) {
            while (weekData.length < 7) { weekData.push(null); }
            calendar.push(weekData);
        }
        return calendar; // 常に配列を返すはず
    } catch (error) {
        console.error("カレンダー生成エラー:", error);
        return []; // エラー時も空配列を返す
    }
  };

  // *** 修正点: getCalendarData() の結果が falsy な場合に空配列をデフォルト値とする ***
  const calendarWeeks = getCalendarData() || [];
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // Dnd センサー, handleDragStart, handleDragEnd は変更なし
    const sensors = useSensors(/* ... */);
    const handleDragStart = (event) => { /* ... */ };
    const handleDragEnd = (event) => { /* ... */ };

  // モーダル開閉関数 (変更なし)
  const openDayModal = (date, questions) => { /* ... */ };
  const closeDayModal = () => { /* ... */ };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 max-w-5xl mx-auto pb-20">
        {/* カレンダーヘッダー (変更なし) */}
        {/* ... */}
        {/* カレンダー本体 */}
        <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 border border-gray-200">
          {/* 曜日ヘッダー (変更なし) */}
          {/* ... */}
          {/* 日付セル */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* *** 修正点: calendarWeeks を使用 *** */}
            {calendarWeeks.flat().map((dayData, index) => {
               const cellKey = dayData?.date ? dayData.date.toISOString().split('T')[0] : `empty-${index}-${currentMonth.getMonth()}`; // キー生成修正
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
