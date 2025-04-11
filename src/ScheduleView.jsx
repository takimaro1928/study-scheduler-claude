// src/ScheduleView.jsx (デバッグログ追加版)
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
function DraggableQuestion({ question, isDragging }) { /* ... */ }

// --- DroppableDateCell コンポーネント (変更なし) ---
function DroppableDateCell({ dayData, cellKey, openModal }) { /* ... */ }


// --- ScheduleView 本体 (デバッグログ追加) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalQuestions, setModalQuestions] = useState([]);

  const changeMonth = (offset) => { /* ... */ };
  const getCalendarData = () => {
    try {
        // ... (カレンダーデータ生成ロジック - 変更なし) ...
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
        console.log('getCalendarData result:', calendar); // ★★★ デバッグログ1 ★★★
        return calendar;
    } catch (error) { console.error("カレンダー生成エラー:", error); return []; }
  };

  const calendarWeeks = getCalendarData() || [];
  console.log('Rendering calendarWeeks:', calendarWeeks); // ★★★ デバッグログ2 ★★★

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const sensors = useSensors( /* ... */ );
  const handleDragStart = (event) => { /* ... */ };
  const handleDragEnd = (event) => { /* ... */ };
  const openDayModal = (date, questions) => { /* ... */ };
  const closeDayModal = () => { /* ... */ };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-4 max-w-5xl mx-auto pb-20">
        {/* カレンダーヘッダー */}
        {/* ... */}
        {/* カレンダー本体 */}
        <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 border border-gray-200">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
             {/* ... 曜日ヘッダーのJSX ... */}
             {weekDays.map((day, index) => ( <div key={index} className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${ index === 0 ? 'text-red-600 bg-red-50' : index === 6 ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50' }`}> {day} </div> ))}
          </div>
          {/* 日付セル */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {(calendarWeeks && calendarWeeks.length > 0) ? ( // ★★★ デバッグ用条件分岐 ★★★
                calendarWeeks.flat().map((dayData, index) => {
                // ★★★ デバッグログ3 ★★★
                console.log(`Mapping dayData at index ${index}:`, dayData);
                const cellKey = dayData?.date ? dayData.date.toISOString().split('T')[0] : `empty-${index}-${currentMonth.getMonth()}`;
                return (
                    <DroppableDateCell
                    key={cellKey}
                    dayData={dayData}
                    cellKey={cellKey}
                    openModal={openDayModal}
                    />
                );
                })
            ) : (
                // ★★★ デバッグ用表示 ★★★
                <div className="col-span-7 text-center text-red-500 p-4">カレンダーデータの生成に失敗したか、空です。</div>
            )}
          </div>
        </div>
      </div>
      {/* DragOverlay */}
      {/* ... */}
      {/* 日付詳細モーダル */}
      {/* ... */}
       <DragOverlay dropAnimation={null}> {activeDragItem ? ( <DraggableQuestion question={activeDragItem} isDragging={true} /> ) : null} </DragOverlay>
       <DayDetailModal isOpen={isModalOpen} onClose={closeDayModal} date={modalDate} questions={modalQuestions} formatDate={formatDate} />
    </DndContext>
  );
};

// DraggableQuestion と DroppableDateCell の定義は省略 (前回のコードと同じ)
// function DraggableQuestion({ question, isDragging }) { /* ... */ }
// function DroppableDateCell({ dayData, cellKey, openModal }) { /* ... */ }

export default ScheduleView;
