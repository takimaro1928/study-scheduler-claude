// src/ScheduleView.jsx (修正版)
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'; // GripVerticalを追加
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- DraggableQuestion コンポーネント ---
// 各問題を表示し、ドラッグ可能にする
function DraggableQuestion({ question }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: question.id, // ドラッグ可能な要素の一意なID
    data: { // ドラッグ時に渡したいデータ
        questionId: question.id,
        // 必要であれば他の情報も渡せる
    }
  });

  // ドラッグ中のスタイルを適用
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    padding: '3px 6px', // 少しパディング調整
    backgroundColor: '#eef2ff', // bg-indigo-50
    color: '#4338ca', // text-indigo-700
    borderRadius: '4px', // rounded
    fontSize: '0.75rem', // text-xs
    margin: '3px 0', // 上下マージン調整
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    border: '1px solid #c7d2fe', // border-indigo-200
    display: 'flex', // アイコン表示用
    alignItems: 'center', // アイコン表示用
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} title={question.id}>
      {/* ドラッグハンドル用アイコン（オプション） */}
      <GripVertical size={12} className="mr-1 text-gray-400 flex-shrink-0" />
      {question.id} {/* 問題IDを表示 */}
    </div>
  );
}

// --- DroppableDateCell コンポーネント ---
// カレンダーの日付セルをドロップ可能エリアにする
function DroppableDateCell({ date, dayNumber, isToday, questions }) {
  // Hooksは条件分岐の外、コンポーネントのトップレベルで呼び出す
  const dateString = date instanceof Date && !isNaN(date) ? date.toISOString().split('T')[0] : null;
  const { isOver, setNodeRef } = useDroppable({
    id: dateString, // 日付文字列をIDに (nullの場合は無効なDroppable IDになる)
    disabled: !dateString, // dateStringがnullなら無効化
    data: { date: date }
  });

  // --- スタイル計算 ---
  let cellClasses = "relative flex flex-col p-1.5 sm:p-2 rounded-lg border ";
  let dayNumberClasses = "text-right font-bold text-xs sm:text-sm ";

  if (isToday) {
    cellClasses += "bg-blue-50 border-blue-300 ring-1 sm:ring-2 ring-blue-400 shadow-sm ";
    dayNumberClasses += "text-blue-700 ";
  } else {
    cellClasses += "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all ";
    dayNumberClasses += "text-gray-700 ";
  }

  if (isOver && dateString) { // isOverの時にスタイル変更
      cellClasses += "border-dashed border-2 border-indigo-500 bg-indigo-50 ";
  }
  // --- スタイル計算ここまで ---

  return (
    // setNodeRefを適用
    <div ref={setNodeRef} className={cellClasses} style={{ minHeight: '90px' }}> {/* 高さを確保 */}
      {/* 日付番号 */}
      <div className={dayNumberClasses}>
        {dayNumber}
      </div>
      {/* 問題リスト表示エリア */}
      <div className="mt-1 space-y-0.5 overflow-y-auto flex-grow" style={{maxHeight: '60px'}}> {/* スクロール */}
        {questions && questions.map(q => (
          <DraggableQuestion key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
}

// --- ScheduleView 本体 ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  // カレンダーデータ生成ロジック
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
                const questionsForDay = getQuestionsForDate(currentDate); // App.jsから渡された関数を使用
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
  // totalQuestions は App.js から渡されていないので削除 or 必要なら渡す
  // const totalQuestions = subjects.reduce((total, subject) => total + subject.chapters.reduce((chTotal, chapter) => chTotal + chapter.questions.length, 0), 0);

  // DndContext の設定
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 多少動かさないとドラッグ開始しない
    useSensor(KeyboardSensor)
  );

  // ドラッグ終了時の処理
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const questionId = active.id;
      const targetDateString = over.id; // DroppableのID (YYYY-MM-DD)
      const targetDate = over.data.current?.date; // DroppableのdataからDateオブジェクト取得

      if (targetDate instanceof Date && !isNaN(targetDate.getTime())) {
          handleQuestionDateChange(questionId, targetDate); // App.jsの関数を呼び出す
      } else {
          console.error("ドロップ先の日付データが無効:", over.data.current?.date);
      }
    }
  };

  return (
    // DndContext でラップ
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 max-w-5xl mx-auto pb-20">
        {/* カレンダーヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            学習スケジュール
          </h2>
          <div className="flex items-center bg-white rounded-full shadow-sm px-2 py-1 mt-2 md:mt-0">
            <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronLeft className="w-5 h-5 text-indigo-600" /> </button>
            <h3 className="text-lg font-bold text-gray-800 mx-2 min-w-[120px] text-center"> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
            <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronRight className="w-5 h-5 text-indigo-600" /> </button>
            {/* totalQuestions は削除 */}
          </div>
        </div>

        {/* カレンダー本体 */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDays.map((day, index) => ( <div key={index} className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${ index === 0 ? 'text-red-600 bg-red-50' : index === 6 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 bg-gray-50' }`}> {day} </div> ))}
          </div>
          {/* 日付セル (mapの中でDroppableDateCellを使う) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarWeeks.flat().map((dayData, index) => {
               // キー生成を改善
               const key = dayData ? dayData.date.toISOString().split('T')[0] : `empty-${index}`;

               if (!dayData || !(dayData.date instanceof Date) || isNaN(dayData.date.getTime())) {
                  return <div key={key} className="aspect-square bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl"></div>;
               }

               const isToday = dayData.date.toDateString() === new Date().toDateString();

               return (
                 <DroppableDateCell
                   key={key}
                   date={dayData.date}
                   dayNumber={dayData.day}
                   isToday={isToday}
                   questions={dayData.questions}
                 />
               );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default ScheduleView;
