// src/ScheduleView.jsx (問題表示・レイアウト改善、DragOverlay追加)
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay // DragOverlay をインポート
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- DraggableQuestion コンポーネント (表示内容とスタイルを改善) ---
function DraggableQuestion({ question, isDragging }) { // isDragging prop を追加
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: question.id,
    data: { question }, // questionオブジェクト全体を渡す
  });

  // 通常時とドラッグ中でスタイルを少し変える
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.8 : 1, // isDragging中も少し見えるように
    cursor: 'grab',
    padding: '4px 8px', // 少しゆとりを持たせる
    backgroundColor: isDragging ? '#a5b4fc' : '#e0e7ff', // ドラッグ中は少し濃い色 (indigo-300 / indigo-100)
    color: isDragging ? '#ffffff' : '#3730a3', // ドラッグ中は白文字 (indigo-800)
    borderRadius: '6px', // rounded-md
    fontSize: '0.75rem', // text-xs
    margin: '2px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    border: `1px solid ${isDragging ? '#818cf8' : '#c7d2fe'}`, // ドラッグ中は少し濃い枠線 (indigo-400 / indigo-200)
    display: 'flex',
    alignItems: 'center',
    boxShadow: isDragging ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none', // ドラッグ中に影
    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    // setNodeRef: ドラッグ可能要素として登録
    // listeners, attributes: ドラッグ操作のためのイベントリスナーや属性
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}>
      <GripVertical size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
      {/* 表示内容: 科目名の先頭2文字 + 問題ID */}
      <span className="font-medium">
        {question.subjectName?.substring(0, 2)} - {question.id}
      </span>
    </div>
  );
}

// --- DroppableDateCell コンポーネント (レイアウト改善) ---
function DroppableDateCell({ date, dayNumber, isToday, questions }) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return <div className="bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl"></div>;
  }
  const dateString = date.toISOString().split('T')[0];
  const { isOver, setNodeRef } = useDroppable({
    id: dateString,
    disabled: !dateString,
    data: { date: date }
  });

  // セルのスタイル
  let cellClasses = "relative flex flex-col p-1 sm:p-1.5 rounded-lg border min-h-[90px] sm:min-h-[100px] "; // padding調整、min-h確保
  let dayNumberClasses = "text-right font-bold text-xs mb-0.5 "; // smサイズ削除

  if (isToday) {
    cellClasses += "bg-blue-50 border-blue-300 ring-1 ring-blue-300 ";
    dayNumberClasses += "text-blue-700 ";
  } else {
    cellClasses += "bg-white border-gray-200 hover:border-indigo-300 ";
    dayNumberClasses += "text-gray-600 ";
  }

  if (isOver) { // ドラッグオーバー時のスタイル
      cellClasses += "border-dashed border-2 border-indigo-400 bg-indigo-50 ";
  } else {
      cellClasses += "transition-colors duration-150 "; // 通常時のトランジション
  }


  return (
    <div ref={setNodeRef} className={cellClasses}>
      {/* 日付番号 */}
      <div className={dayNumberClasses}>
        {dayNumber}
      </div>
      {/* 問題リスト表示エリア (flex-col と gap-1 で縦に並べる) */}
      <div className="flex-grow space-y-1 overflow-y-auto" style={{maxHeight: '70px'}}> {/* 高さとスクロール */}
        {questions && questions.map(q => (
          <DraggableQuestion key={q.id} question={q} />
        ))}
        {/* ドロップ可能エリアであることを示すプレースホルダー（オプション） */}
        {isOver && (
             <div className="text-center text-xs text-indigo-400 py-1 border border-dashed border-indigo-300 rounded-md mt-1">ここにドロップ</div>
        )}
      </div>
    </div>
  );
}


// --- ScheduleView 本体 (DragOverlay追加) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // *** 追加: ドラッグ中のアイテムIDとデータを保持するstate ***
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
  // const totalQuestions = subjects.reduce(/* ... */); // App.jsから渡されていないので削除

  // Dnd センサー
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // 8px以上動かしたらドラッグ開始
    useSensor(KeyboardSensor)
  );

  // ドラッグ開始時の処理: ドラッグ中のアイテム情報をstateに保存
  const handleDragStart = (event) => {
      const { active } = event;
      // subjectsからドラッグされた問題オブジェクト全体を探す
      let draggedQuestion = null;
      for (const subject of subjects) {
          for (const chapter of subject.chapters) {
              draggedQuestion = chapter.questions.find(q => q.id === active.id);
              if (draggedQuestion) break;
          }
          if (draggedQuestion) break;
      }
      setActiveDragItem(draggedQuestion); // 問題オブジェクトを保存
  };


  // ドラッグ終了時の処理
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null); // ドラッグ終了したらクリア

    if (over && active.id !== over.id) {
      const questionId = active.id;
      // over.data.current から日付を取得 (useDroppableのdataで設定)
      const targetDate = over.data.current?.date;

      if (targetDate instanceof Date && !isNaN(targetDate.getTime())) {
          handleQuestionDateChange(questionId, targetDate);
      } else {
          console.error("ドロップ先の日付データが無効:", over.data.current?.date);
      }
    }
  };

  return (
    // DndContext (onDragStartを追加)
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 max-w-5xl mx-auto pb-20">
        {/* カレンダーヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            {/* ... (ヘッダーの内容は変更なし) ... */}
             <h2 className="text-xl font-bold text-gray-800 flex items-center"> <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> 学習スケジュール </h2>
             <div className="flex items-center bg-white rounded-full shadow-sm px-2 py-1 mt-2 md:mt-0">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronLeft className="w-5 h-5 text-indigo-600" /> </button>
                <h3 className="text-lg font-bold text-gray-800 mx-2 min-w-[120px] text-center"> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronRight className="w-5 h-5 text-indigo-600" /> </button>
                {/* <div className="ml-3 ..."> 登録: {totalQuestions}問 </div> */}
             </div>
        </div>

        {/* カレンダー本体 */}
        <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 border border-gray-200"> {/* pading調整 */}
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDays.map((day, index) => ( <div key={index} className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${ index === 0 ? 'text-red-600 bg-red-50' : index === 6 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 bg-gray-50' }`}> {day} </div> ))}
          </div>
          {/* 日付セル */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarWeeks.flat().map((dayData, index) => {
               const key = dayData ? dayData.date.toISOString().split('T')[0] : `empty-${index}`;
               if (!dayData || !(dayData.date instanceof Date) || isNaN(dayData.date.getTime())) {
                  return <div key={key} className="bg-gray-50 border border-gray-100 rounded-lg min-h-[90px] sm:min-h-[100px]"></div>; // 空セルのスタイル調整
               }
               const isToday = dayData.date.toDateString() === new Date().toDateString();
               return (
                 <DroppableDateCell
                   key={key}
                   date={dayData.date}
                   dayNumber={dayData.day}
                   isToday={isToday}
                   questions={dayData.questions} // questions を渡す
                 />
               );
            })}
          </div>
        </div>
      </div>

      {/* DragOverlay: ドラッグ中のアイテムの見た目を表示 */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          // ドラッグ中専用のスタイルを適用したQuestionコンポーネント
          <DraggableQuestion question={activeDragItem} isDragging={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ScheduleView;
