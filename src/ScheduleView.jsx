// src/ScheduleView.jsx (モーダル表示対応版)
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
// *** 追加: DayDetailModal をインポート ***
import DayDetailModal from './DayDetailModal';

// --- DraggableQuestion コンポーネント (変更なし) ---
function DraggableQuestion({ question, isDragging }) { /* ... 前回のコードと同じ ... */
   const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: question.id,
    data: { question },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.9 : 1,
    cursor: 'grab',
    padding: '4px 8px',
    backgroundColor: isDragging ? '#6366f1' : '#eef2ff',
    color: isDragging ? '#ffffff' : '#4338ca',
    borderRadius: '4px',
    fontSize: '0.75rem',
    margin: '2px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    border: `1px solid ${isDragging ? '#4f46e5' : '#c7d2fe'}`,
    display: 'flex',
    alignItems: 'center',
    boxShadow: isDragging ? '0 4px 8px rgba(0, 0, 0, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
  };
  const subjectAbbreviation = question.subjectName ? question.subjectName.substring(0, 4) : '';
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}>
      <GripVertical size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
      <span className="font-medium overflow-hidden text-ellipsis">
        {subjectAbbreviation} - {question.id}
      </span>
    </div>
  );
 }

// --- DroppableDateCell コンポーネント (表示制限とモーダル呼び出し追加) ---
// *** 変更点: openModal 関数を props で受け取る ***
function DroppableDateCell({ dayData, cellKey, openModal }) {
  const MAX_ITEMS_VISIBLE = 3; // ★★★ セル内に表示する最大問題数 ★★★

  const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);
  const droppableId = isValidDate ? dayData.date.toISOString().split('T')[0] : `empty-${cellKey}`;
  const droppableData = isValidDate ? { date: dayData.date } : null;

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    disabled: !isValidDate,
    data: droppableData
  });

  // --- スタイル計算 (変更なし) ---
  let cellClasses = "relative flex flex-col p-1 sm:p-1.5 rounded-lg border min-h-[100px] sm:min-h-[110px] ";
  let dayNumberClasses = "text-right font-semibold text-xs mb-0.5 ";
  if (!isValidDate) { /* ... 空セルの処理 ... */
      cellClasses += "bg-gray-50 border-gray-100 ";
      return <div key={cellKey} ref={setNodeRef} className={cellClasses}></div>;
  }
  const isToday = dayData.date.toDateString() === new Date().toDateString();
  if (isToday) { /* ... 今日のスタイル ... */
       cellClasses += "bg-blue-50 border-blue-300 ring-1 ring-blue-300 ";
       dayNumberClasses += "text-blue-700 ";
  } else { /* ... 通常日のスタイル ... */
       cellClasses += "bg-white border-gray-200 hover:border-indigo-300 ";
       dayNumberClasses += "text-gray-500 ";
   }
  if (isOver) { cellClasses += "border-dashed border-2 border-indigo-400 bg-indigo-50 "; }
  else { cellClasses += "transition-colors duration-150 "; }
  // --- スタイル計算ここまで ---

  const questionsToShow = dayData.questions || [];
  const hiddenCount = questionsToShow.length - MAX_ITEMS_VISIBLE;

  return (
    <div ref={setNodeRef} className={cellClasses}>
      {/* 日付番号 */}
      <div className={dayNumberClasses}>
        {dayData.day}
      </div>
      {/* 問題リスト表示エリア */}
      <div className="flex-grow space-y-1 overflow-hidden" style={{maxHeight: '80px'}}> {/* overflow-y-auto を削除し、表示件数を制限 */}
        {questionsToShow.slice(0, MAX_ITEMS_VISIBLE).map(q => (
          <DraggableQuestion key={q.id} question={q} />
        ))}
      </div>
      {/* 「もっと見る」表示 */}
      {hiddenCount > 0 && (
        <div
          className="mt-auto pt-1 text-center text-xs text-indigo-600 font-medium cursor-pointer hover:underline"
          onClick={() => openModal(dayData.date, questionsToShow)} // ★★★ モーダルを開く
        >
          + あと {hiddenCount} 件
        </div>
      )}
       {/* ドロップ可能エリアであることを示すプレースホルダー */}
       {isOver && !hiddenCount > 0 && ( // もっと見るがない時だけ表示
           <div className="text-center text-xs text-indigo-400 py-1 border border-dashed border-indigo-300 rounded-md mt-1">ここにドロップ</div>
       )}
    </div>
  );
}


// --- ScheduleView 本体 (モーダル関連の state と関数を追加) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDragItem, setActiveDragItem] = useState(null);
  // *** 追加: モーダル管理用 state ***
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalQuestions, setModalQuestions] = useState([]);

  const changeMonth = (offset) => { /* ...変更なし... */ };
  const getCalendarData = () => { /* ...変更なし... */ };
  const calendarWeeks = getCalendarData();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const sensors = useSensors( /* ...変更なし... */ );
  const handleDragStart = (event) => { /* ...変更なし... */ };
  const handleDragEnd = (event) => { /* ...変更なし... */ };

  // *** 追加: モーダルを開く関数 ***
  const openDayModal = (date, questions) => {
    setModalDate(date);
    setModalQuestions(questions);
    setIsModalOpen(true);
  };

  // *** 追加: モーダルを閉じる関数 ***
  const closeDayModal = () => {
    setIsModalOpen(false);
    setModalDate(null);
    setModalQuestions([]);
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
        {/* ... */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-4">
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
             {/* ... */}
              {weekDays.map((day, index) => ( <div key={index} className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${ index === 0 ? 'text-red-600 bg-red-50' : index === 6 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 bg-gray-50' }`}> {day} </div> ))}
          </div>
          {/* 日付セル (map内でDroppableDateCellにopenModalを渡す) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarWeeks.flat().map((dayData, index) => {
               const cellKey = dayData ? dayData.date.toISOString().split('T')[0] : `empty-${index}-${currentMonth.getMonth()}`;
               return (
                 <DroppableDateCell
                   key={cellKey}
                   dayData={dayData}
                   cellKey={cellKey}
                   openModal={openDayModal} // ★★★ モーダルを開く関数を渡す
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

      {/* *** 追加: 日付詳細モーダル *** */}
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
