// src/ScheduleView.jsx (CSS Modules 対応版)
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
// *** CSSモジュールをインポート ***
import styles from './ScheduleView.module.css';

// --- DraggableQuestion コンポーネント ---
function DraggableQuestion({ question, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: question.id,
    data: { question },
  });

  // isDraggingに応じてクラスを切り替え
  const itemClass = isDragging ? styles.draggableQuestionDragging : styles.draggableQuestion;

  const style = { transform: CSS.Translate.toString(transform) }; // transformだけインラインで適用

  const subjectAbbreviation = question.subjectName ? question.subjectName.substring(0, 4) : '';

  return (
    <div ref={setNodeRef} style={style} className={itemClass} {...listeners} {...attributes} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}>
      <GripVertical size={14} style={{marginRight: '6px', color: '#9ca3af', flexShrink: 0}}/> {/* インラインスタイルで微調整 */}
      <span className={styles.questionText}>{subjectAbbreviation} - {question.id}</span>
    </div>
  );
}

// --- DroppableDateCell コンポーネント ---
function DroppableDateCell({ dayData, cellKey, openModal }) {
  const MAX_ITEMS_VISIBLE = 3;
  const isValidDate = dayData && dayData.date instanceof Date && !isNaN(dayData.date);
  const droppableId = isValidDate ? dayData.date.toISOString().split('T')[0] : `empty-${cellKey}`;
  const droppableData = isValidDate ? { date: dayData.date } : null;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId, disabled: !isValidDate, data: droppableData });

  let cellClasses = styles.dateCell; // 基本クラス
  let dayNumberClasses = styles.dayNumber;

  if (!isValidDate) {
    cellClasses += ` ${styles.dateCellEmpty}`;
    return <div key={cellKey} ref={setNodeRef} className={cellClasses}></div>;
  }

  const isToday = dayData.date.toDateString() === new Date().toDateString();
  const dayOfWeek = dayData.date.getDay();

  if (isToday) {
    cellClasses += ` ${styles.dateCellToday}`;
    dayNumberClasses += ` ${styles.dayNumberToday}`;
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    cellClasses += ` ${styles.dateCellWeekend}`;
    dayNumberClasses += ` ${dayOfWeek === 0 ? styles.dayNumberSun : styles.dayNumberSat}`;
  }

  if (isOver) { cellClasses += ` ${styles.dateCellOver}`; }

  const questionsToShow = dayData.questions || [];
  const hiddenCount = questionsToShow.length - MAX_ITEMS_VISIBLE;

  return (
    <div ref={setNodeRef} className={cellClasses}>
      <div className={dayNumberClasses}>{dayData.day}</div>
      <div className={styles.questionList}>
        {questionsToShow.slice(0, MAX_ITEMS_VISIBLE).map(q => (
          <DraggableQuestion key={q.id} question={q} />
        ))}
      </div>
      {hiddenCount > 0 && (
        <div className={styles.showMore} onClick={() => openModal(dayData.date, questionsToShow)}>
          + あと {hiddenCount} 件
        </div>
      )}
      {isOver && !hiddenCount > 0 && ( <div className={styles.dropPlaceholder}>ここにドロップ</div> )}
    </div>
  );
}


// --- ScheduleView 本体 ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [modalQuestions, setModalQuestions] = useState([]);

  const changeMonth = (offset) => { /* ... */ };
  const getCalendarData = () => { /* ... */ };
  const calendarWeeks = getCalendarData() || [];
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const sensors = useSensors( useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor) );
  const handleDragStart = (event) => { /* ... */ };
  const handleDragEnd = (event) => { /* ... */ };
  const openDayModal = (date, questions) => { /* ... */ };
  const closeDayModal = () => { /* ... */ };

  // --- ハンドラ関数やデータ取得ロジックは変更なし ---
  // (上記省略した部分は前回のコードと同じ)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        {/* ヘッダー */}
        <div className={styles.header}>
            <h2 className={styles.title}>
                <Calendar /> {/* アイコンコンポーネントを直接使用 */}
                学習スケジュール
            </h2>
            <div className={styles.nav}>
                <button onClick={() => changeMonth(-1)} className={styles.navButton}> <ChevronLeft /> </button>
                <h3 className={styles.monthDisplay}> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
                <button onClick={() => changeMonth(1)} className={styles.navButton}> <ChevronRight /> </button>
            </div>
        </div>

        {/* カレンダー本体 */}
        <div className={styles.calendarWrapper}>
          {/* 曜日ヘッダー */}
          <div className={styles.weekdayGrid}>
            {weekDays.map((day, index) => (
              <div key={index} className={`${styles.weekdayHeader} ${
                  index === 0 ? styles.weekdayHeaderSun :
                  index === 6 ? styles.weekdayHeaderSat :
                  styles.weekdayHeaderOther
              }`}>
                {day}
              </div>
            ))}
          </div>
          {/* 日付セル */}
          <div className={styles.calendarGrid}>
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
