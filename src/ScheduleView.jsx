// src/ScheduleView.jsx (CSS Modules + 問題アイテムスタイル改善版)
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
import styles from './ScheduleView.module.css'; // CSSモジュールをインポート

// --- DraggableQuestion コンポーネント ---
function DraggableQuestion({ question, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: question.id,
    data: { question },
  });
  const style = { transform: CSS.Translate.toString(transform) };
  const itemClass = isDragging ? styles.draggableQuestionDragging : styles.draggableQuestion;
  const subjectAbbreviation = question.subjectName ? question.subjectName.substring(0, 4) : '';

  return (
    <div ref={setNodeRef} style={style} className={itemClass} {...listeners} {...attributes} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}>
      <GripVertical size={14} style={{ marginRight: '6px', color: 'currentColor', flexShrink: 0 }} strokeWidth={2}/> {/* 色を継承 */}
      {/* ★★★ spanにクラス名を追加 ★★★ */}
      <span className={styles.questionText}>{subjectAbbreviation} - {question.id}</span>
    </div>
  );
}

// --- DroppableDateCell コンポーネント (変更なし) ---
function DroppableDateCell({ dayData, cellKey, openModal }) {
    const MAX_ITEMS_VISIBLE = 3;
    const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);
    const droppableId = isValidDate ? dayData.date.toISOString().split('T')[0] : `empty-${cellKey}`;
    const droppableData = isValidDate ? { date: dayData.date } : null;
    const { isOver, setNodeRef } = useDroppable({ id: droppableId, disabled: !isValidDate, data: droppableData });
    let cellClasses = styles.dateCell || "dateCell";
    let dayNumberClasses = styles.dayNumber || "dayNumber";
    if (!isValidDate) { cellClasses = `${cellClasses} ${styles.dateCellEmpty || "dateCellEmpty"}`; return <div key={cellKey} ref={setNodeRef} className={cellClasses}></div>; }
    const isToday = dayData.date.toDateString() === new Date().toDateString();
    const dayOfWeek = dayData.date.getDay();
    if (isToday) { cellClasses = `${cellClasses} ${styles.dateCellToday || "dateCellToday"}`; dayNumberClasses = `${dayNumberClasses} ${styles.dayNumberToday || "dayNumberToday"}`; }
    else if (dayOfWeek === 0 || dayOfWeek === 6) { cellClasses = `${cellClasses} ${styles.dateCellWeekend || "dateCellWeekend"}`; dayNumberClasses = `${dayNumberClasses} ${dayOfWeek === 0 ? (styles.dayNumberSun || "dayNumberSun") : (styles.dayNumberSat || "dayNumberSat")}`; }
    else { dayNumberClasses = `${dayNumberClasses} ${styles.dayNumberOther || "dayNumberOther"}`; }
    if (isOver) { cellClasses = `${cellClasses} ${styles.dateCellOver || "dateCellOver"}`; }
    const questionsToShow = dayData.questions || [];
    const hiddenCount = questionsToShow.length - MAX_ITEMS_VISIBLE;
    return ( <div ref={setNodeRef} className={cellClasses}> <div className={dayNumberClasses}>{dayData.day}</div> <div className={styles.questionList || "questionList"}> {questionsToShow.slice(0, MAX_ITEMS_VISIBLE).map(q => ( <DraggableQuestion key={q.id} question={q} /> ))} </div> {hiddenCount > 0 && ( <div className={styles.showMore || "showMore"} onClick={() => openModal(dayData.date, questionsToShow)}> + あと {hiddenCount} 件 </div> )} {isOver && !hiddenCount > 0 && ( <div className={styles.dropPlaceholder || "dropPlaceholder"}>ここにドロップ</div> )} </div> );
}

// --- ScheduleView 本体 (変更なし) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeDragItem, setActiveDragItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [modalQuestions, setModalQuestions] = useState([]);
    const changeMonth = (offset) => { const newMonth = new Date(currentMonth); newMonth.setMonth(newMonth.getMonth() + offset); setCurrentMonth(newMonth); };
    const getCalendarData = () => { try { const year = currentMonth.getFullYear(); const month = currentMonth.getMonth(); const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0); const daysInMonth = lastDay.getDate(); const startDayOfWeek = firstDay.getDay(); const calendar = []; let dayCounter = 1; let weekData = []; for (let i = 0; i < startDayOfWeek; i++) { weekData.push(null); } while (dayCounter <= daysInMonth) { const currentDate = new Date(year, month, dayCounter); if (isNaN(currentDate.getTime())) { weekData.push(null); } else { currentDate.setHours(0, 0, 0, 0); const questionsForDay = getQuestionsForDate(currentDate) || []; weekData.push({ day: dayCounter, date: currentDate, questions: questionsForDay }); } if (weekData.length === 7) { calendar.push(weekData); weekData = []; } dayCounter++; } if (weekData.length > 0) { while (weekData.length < 7) { weekData.push(null); } calendar.push(weekData); } return calendar; } catch (error) { console.error("カレンダー生成エラー:", error); return []; } };
    const calendarWeeks = getCalendarData() || [];
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const sensors = useSensors( useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor) );
    const handleDragStart = (event) => { const { active } = event; let draggedQuestion = null; subjects.flat().forEach(subject => { subject?.chapters?.forEach(chapter => { const found = chapter?.questions?.find(q => q.id === active.id); if(found) draggedQuestion = { ...found, subjectName: subject.name, chapterName: chapter.name }; }); }); setActiveDragItem(draggedQuestion); }; // subjectNameなどを追加
    const handleDragEnd = (event) => { const { active, over } = event; setActiveDragItem(null); if (over && active.id !== over.id) { const questionId = active.id; const targetDate = over.data.current?.date; if (targetDate instanceof Date && !isNaN(targetDate.getTime())) { handleQuestionDateChange(questionId, targetDate); } else { if (typeof over.id === 'string' && !over.id.startsWith('empty-')) { console.error("ドロップ先IDから日付を特定できません:", over.id); } } } };
    const openDayModal = (date, questions) => { setModalDate(date); setModalQuestions(questions); setIsModalOpen(true); };
    const closeDayModal = () => { setIsModalOpen(false); setModalDate(null); setModalQuestions([]); };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* className を styles オブジェクトから参照 */}
      <div className={styles.container || "scheduleViewContainer"}>
        {/* ヘッダー */}
        <div className={styles.header || "scheduleViewHeader"}>
            <h2 className={styles.title || "scheduleViewTitle"}>
                <Calendar /> 学習スケジュール
            </h2>
            <div className={styles.nav || "scheduleViewNav"}>
                <button onClick={() => changeMonth(-1)} className={styles.navButton || "scheduleViewNavButton"}> <ChevronLeft /> </button>
                <h3 className={styles.monthDisplay || "scheduleViewMonthDisplay"}> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
                <button onClick={() => changeMonth(1)} className={styles.navButton || "scheduleViewNavButton"}> <ChevronRight /> </button>
            </div>
        </div>

        {/* カレンダー本体 */}
        <div className={styles.calendarWrapper || "scheduleViewCalendarWrapper"}>
          {/* 曜日ヘッダー */}
          <div className={styles.weekdayGrid || "weekdayGrid"}>
            {weekDays.map((day, index) => (
              <div key={index} className={`${styles.weekdayHeader || "weekdayHeader"} ${
                  index === 0 ? (styles.weekdayHeaderSun || "weekdayHeaderSun") :
                  index === 6 ? (styles.weekdayHeaderSat || "weekdayHeaderSat") :
                  (styles.weekdayHeaderOther || "weekdayHeaderOther")
              }`}>
                {day}
              </div>
            ))}
          </div>
          {/* 日付セル */}
          <div className={styles.calendarGrid || "calendarGrid"}>
            {(calendarWeeks && calendarWeeks.length > 0) ? (
              calendarWeeks.flat().map((dayData, index) => {
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
              <div style={{ gridColumn: 'span 7', textAlign: 'center', color: 'red', padding: '1rem' }}>
                カレンダーデータの生成に失敗したか、空です。
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DragOverlay */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          <DraggableQuestion question={activeDragItem} isDragging={true} />
        ) : null}
      </DragOverlay>

      {/* 日付詳細モーダル */}
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
