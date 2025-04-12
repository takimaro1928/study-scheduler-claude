// src/RedesignedAllQuestionsView.jsx (フィルターロジック修正版)
import React, { useState, useMemo } from 'react'; // useEffect, useRef は不要になったので削除
import {
  Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info,
  ChevronRight, ChevronDown, ChevronUp, X as XIcon
} from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar';
// CSSモジュールをインポート
import styles from './RedesignedAllQuestionsView.module.css';
import datePickerStyles from './DatePickerCalendarModal.module.css';

// 科目色定義
const subjectColorMap = { /* ... */ };
const getSubjectColorClass = (subjectName) => { /* ... */ };
// 理解度スタイル取得関数
const getUnderstandingStyle = (understanding) => { /* ... */ };
// 正解率バーの色取得関数
const getCorrectRateColor = (rate) => { /* ... */ };


const RedesignedAllQuestionsView = ({
  subjects,
  expandedSubjects,
  expandedChapters,
  toggleSubject,
  toggleChapter,
  setEditingQuestion,
  setBulkEditMode,
  bulkEditMode,
  selectedQuestions,
  setSelectedQuestions,
  saveBulkEdit,
  formatDate,
  toggleQuestionSelection,
  selectedDate,
  setSelectedDate
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ understanding: 'all', correctRate: 'all', interval: 'all', });
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // フィルターと検索ロジック (useMemoを使用)
  const filteredSubjects = useMemo(() => {
    return subjects.map(subject => {
      const chaptersWithFilteredQuestions = subject.chapters.map(chapter => {
        const filteredQuestions = chapter.questions.filter(question => {
          // Search Term Filter
          if (searchTerm && !question.id.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
          // Detailed Filters
          // Understanding (★★★ 修正箇所 ★★★)
          if (filters.understanding !== 'all') {
              // understanding が文字列型で、指定された文字列で始まっているかチェック
              if (typeof question.understanding !== 'string' || !question.understanding.startsWith(filters.understanding)) {
                  return false;
              }
          }
          // Correct Rate
          const rate = question.correctRate ?? -1;
          if (filters.correctRate === 'high' && rate < 80) return false;
          if (filters.correctRate === 'medium' && (rate < 50 || rate >= 80)) return false;
          if (filters.correctRate === 'low' && rate >= 50) return false;
          // Interval
          if (filters.interval !== 'all' && question.interval !== filters.interval) {
            return false;
          }
          return true;
        });
        return { ...chapter, questions: filteredQuestions };
      }).filter(chapter => chapter.questions.length > 0);
      return { ...subject, chapters: chaptersWithFilteredQuestions };
    }).filter(subject => subject.chapters.length > 0);
  }, [subjects, searchTerm, filters]); // 依存配列


  // 全選択/全解除 (変更なし)
  const toggleSelectAllForSubject = (subject) => { /* ... */ };
  // executeBulkEdit (変更なし)
  const executeBulkEdit = () => { /* ... */ };

  // --- レンダリング ---
  return (
    // JSX部分は変更なし（前回のコードを流用）
    <div className={styles.container}>
        {/* 上部コントロール */}
        {/* ... */}
        {/* 詳細フィルターパネル */}
        {showFilters && ( <div className={styles.filterPanel}> {/* ... */} </div> )}
        {/* 一括編集時の操作パネル */}
        {bulkEditMode && ( <div className={styles.bulkEditPanel}> {/* ... */} </div> )}
        {/* 問題リスト */}
        {filteredSubjects.length === 0 ? ( /* ... */ ) : (
            <div className={styles.listContainer}>
            {filteredSubjects.map(subject => {
                // ... 科目アコーディオン、章アコーディオン、問題カードのレンダリング ...
                // (この中のJSXは前回の提案のままでOK)
                 const subjectColorClass = getSubjectColorClass(subject.name);
                 const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions.map(q => q.id));
                 const isAllSelectedInSubject = allQuestionIdsInSubject.length > 0 && allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));
                 const subjectBorderColorStyle = { borderLeftColor: subjectColorMap[subject.name || "未分類"] || subjectColorMap["未分類"] };
                 return ( <div key={subject.id} className={styles.subjectAccordion}> <div className={styles.subjectHeader} style={subjectBorderColorStyle} onClick={() => toggleSubject(subject.id)}> {bulkEditMode && ( <input type="checkbox" className={styles.subjectCheckbox} checked={isAllSelectedInSubject} onChange={() => toggleSelectAllForSubject(subject)} onClick={(e) => e.stopPropagation()} /> )} <div className={`${styles.subjectChevron} ${expandedSubjects[subject.id] ? styles.subjectChevronOpen : ''}`}> <ChevronRight size={18} /> </div> <h3 className={styles.subjectTitle}>{subject.name}</h3> <div className={styles.subjectCountBadge}> {subject.chapters.reduce((sum, c) => sum + c.questions.length, 0)}問 </div> </div> {expandedSubjects[subject.id] && ( <div className={styles.subjectContent}> {subject.chapters.map(chapter => ( <div key={chapter.id} className={styles.chapterAccordion}> <div className={styles.chapterHeader} onClick={() => toggleChapter(chapter.id)}> <div className={`${styles.chapterChevron} ${expandedChapters[chapter.id] ? styles.chapterChevronOpen : ''}`}> <ChevronRight size={16} /> </div> <h4 className={styles.chapterTitle}>{chapter.name}</h4> <div className={styles.chapterCountBadge}> {chapter.questions.length}問 </div> </div> {expandedChapters[chapter.id] && ( <div className={styles.questionCardList}> {chapter.questions.map(question => { const understandingStyle = getUnderstandingStyle(question.understanding); const cardBorderColorStyle = { borderLeftColor: subjectColorMap[subject.name || "未分類"] || subjectColorMap["未分類"] }; return ( <div key={question.id} className={styles.questionCard} style={cardBorderColorStyle}> {bulkEditMode && ( <input type="checkbox" className={styles.questionCheckbox} checked={selectedQuestions.includes(question.id)} onChange={() => toggleQuestionSelection(question.id)} /> )} <div className={styles.questionId} title={question.id}> {question.id} </div> <div className={styles.statusGrid}> <div className={styles.statusItem} title="次回予定日"> <Clock size={14} /> <span>{formatDate(question.nextDate)}</span> </div> <div className={styles.statusItem} title="復習間隔"> <CalendarIcon size={14} /> <span>{question.interval}</span> </div> <div className={`${styles.statusItem} ${styles.understandingBadge} ${styles[understandingStyle.bgClass.replace('bg-','understandingBadge')]}`} title={`理解度: ${question.understanding}`}> {React.cloneElement(understandingStyle.icon, { size: 14})} <span className={styles[understandingStyle.textClass.replace('text-','understandingText')]}> {question.understanding.includes(':') ? question.understanding.split(':')[0] : question.understanding} </span> </div> <div className={styles.statusItem} title={`正解率: ${question.correctRate}% (${question.answerCount}回)`}> <div className={styles.rateBarContainer}><div className={styles.rateBar}><div className={`${styles.rateBarInner} ${getCorrectRateColor(question.correctRate).replace('bg-','rateBarColor')}`} style={{ width: `${question.correctRate}%` }}></div></div></div> <span className={styles.rateText}>{question.correctRate}%</span> </div> </div> <button onClick={() => setEditingQuestion(question)} className={styles.editButton} title="編集"> <Edit size={16}/> </button> </div> ); })} </div> )} </div> ))} </div> )} </div> ); })}
            </div>
        )}

        {/* 一括編集用カレンダーモーダル (変更なし) */}
        {bulkEditMode && showCalendarModal && ( /* ... */ )}
    </div> // 全体コンテナ end
  );
};

export default RedesignedAllQuestionsView;
