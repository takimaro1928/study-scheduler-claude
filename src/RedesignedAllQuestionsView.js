// src/RedesignedAllQuestionsView.jsx (Syntax Error Fix)
import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info,
  ChevronRight, ChevronDown, ChevronUp, X as XIcon
} from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar'; // 注意: このコンポーネントが必要です
// CSSモジュール
import styles from './RedesignedAllQuestionsView.module.css';
import datePickerStyles from './DatePickerCalendarModal.module.css';

// 科目色定義
const subjectColorMap = { "経営管理論": "#a5b4fc", "運営管理": "#6ee7b7", "経済学": "#fca5a5", "経営情報システム": "#93c5fd", "経営法務": "#c4b5fd", "中小企業経営・中小企業政策": "#fcd34d", "過去問題集": "#94a3b8", "未分類": "#d1d5db", };
const getSubjectColorClass = (subjectName) => { return subjectColorMap[subjectName || "未分類"] || subjectColorMap["未分類"]; };
// 理解度スタイル取得関数
const getUnderstandingStyle = (understanding) => { const iconSize = "w-3.5 h-3.5"; if (understanding === '理解○') { return { icon: <CheckCircle className={`${iconSize} text-green-600`} />, textClass: styles.understandingTextGreen || 'understandingTextGreen', bgClass: styles.understandingBadgeGreen || 'understandingBadgeGreen'}; } else if (understanding?.startsWith('曖昧△')) { return { icon: <AlertTriangle className={`${iconSize} text-yellow-600`} />, textClass: styles.understandingTextYellow || 'understandingTextYellow', bgClass: styles.understandingBadgeYellow || 'understandingBadgeYellow'}; } else if (understanding === '理解できていない×') { return { icon: <XCircle className={`${iconSize} text-red-600`} />, textClass: styles.understandingTextRed || 'understandingTextRed', bgClass: styles.understandingBadgeRed || 'understandingBadgeRed'}; } else { return { icon: <Info className={`${iconSize} text-gray-500`} />, textClass: styles.understandingTextGray || 'understandingTextGray', bgClass: styles.understandingBadgeGray || 'understandingBadgeGray'}; } };
// 正解率バーの色取得関数
const getCorrectRateColor = (rate) => { if (rate >= 80) return styles.rateBarColorGreen || "rateBarColorGreen"; if (rate >= 60) return styles.rateBarColorLime || "rateBarColorLime"; if (rate >= 40) return styles.rateBarColorYellow || "rateBarColorYellow"; if (rate >= 20) return styles.rateBarColorOrange || "rateBarColorOrange"; return styles.rateBarColorRed || "rateBarColorRed"; };

const RedesignedAllQuestionsView = ({
  subjects, expandedSubjects, expandedChapters, toggleSubject, toggleChapter,
  setEditingQuestion, setBulkEditMode, bulkEditMode, selectedQuestions,
  setSelectedQuestions, saveBulkEdit, formatDate, toggleQuestionSelection,
  selectedDate, setSelectedDate
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
          if (searchTerm && !question.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          if (filters.understanding !== 'all') { if (typeof question.understanding !== 'string' || !question.understanding.startsWith(filters.understanding)) return false; }
          const rate = question.correctRate ?? -1;
          if (filters.correctRate === 'high' && rate < 80) return false;
          if (filters.correctRate === 'medium' && (rate < 50 || rate >= 80)) return false;
          if (filters.correctRate === 'low' && rate >= 50) return false;
          if (filters.interval !== 'all' && question.interval !== filters.interval) return false;
          return true;
        });
        return { ...chapter, questions: filteredQuestions };
      }).filter(chapter => chapter.questions.length > 0);
      return { ...subject, chapters: chaptersWithFilteredQuestions };
    }).filter(subject => subject.chapters.length > 0);
  }, [subjects, searchTerm, filters]);

  // 全選択/全解除
  const toggleSelectAllForSubject = (subject) => { /* ... */ };
  // executeBulkEdit
  const executeBulkEdit = () => { /* ... */ };

  // --- レンダリング ---
  return (
    <div className={styles.container}>
      {/* 上部コントロール */}
      <div className={styles.controlsContainer}>
         <div className={styles.searchBox}> <input type="text" placeholder="問題IDで検索..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> <div className={styles.searchIcon}><Search size={18}/></div> {searchTerm && ( <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton}> <XIcon size={18} /> </button> )} </div>
         <div className={styles.controlButtons}> <button onClick={() => setShowFilters(!showFilters)} className={styles.controlButton}> <Filter size={16} /> フィルター {showFilters ? <ChevronUp size={16} style={{marginLeft: '4px'}} /> : <ChevronDown size={16} style={{marginLeft: '4px'}} />} </button> <button onClick={() => setBulkEditMode(!bulkEditMode)} className={`${styles.controlButton} ${ bulkEditMode ? styles.bulkEditButtonActive : styles.bulkEditButtonInactive }`}> {bulkEditMode ? '選択終了' : '一括編集'} </button> </div>
      </div>

      {/* 詳細フィルターパネル */}
      {showFilters && ( <div className={styles.filterPanel}> {/* ... フィルター内容 ... */} </div> )}

      {/* 一括編集時の操作パネル */}
      {bulkEditMode && ( <div className={styles.bulkEditPanel}> {/* ... 操作パネル内容 ... */} </div> )}

      {/* 問題リスト (アコーディオン + カード) */}
      {/* ★★★ ここの条件分岐のJSX構造を修正 ★★★ */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-200">
            <p className="text-gray-500">表示できる問題がありません</p>
        </div>
      ) : (
        // 問題がある場合のJSXは必ず一つの親要素で囲む（ここでは div）
        <div className={styles.listContainer}>
          {filteredSubjects.map(subject => {
            const subjectColorValue = getSubjectColorClass(subject.name);
            const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions.map(q => q.id));
            const isAllSelectedInSubject = allQuestionIdsInSubject.length > 0 && allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));
            return (
              <div key={subject.id} className={styles.subjectAccordion}>
                {/* 科目ヘッダー */}
                <div className={styles.subjectHeader} style={{ borderLeftColor: subjectColorValue }} onClick={() => toggleSubject(subject.id)}>
                    {/* ... ヘッダー内容 ... */}
                     {bulkEditMode && ( <input type="checkbox" className={styles.subjectCheckbox} checked={isAllSelectedInSubject} onChange={() => toggleSelectAllForSubject(subject)} onClick={(e) => e.stopPropagation()} /> )}
                     <div className={`${styles.subjectChevron} ${expandedSubjects[subject.id] ? styles.subjectChevronOpen : ''}`}> <ChevronRight size={18} /> </div>
                     <h3 className={styles.subjectTitle}>{subject.name}</h3>
                     <div className={styles.subjectCountBadge}> {subject.chapters.reduce((sum, c) => sum + c.questions.length, 0)}問 </div>
                </div>
                {/* 科目の中身 */}
                {expandedSubjects[subject.id] && (
                  <div className={styles.subjectContent}>
                    {subject.chapters.map(chapter => (
                      <div key={chapter.id} className={styles.chapterAccordion}>
                        {/* 章ヘッダー */}
                        <div className={styles.chapterHeader} onClick={() => toggleChapter(chapter.id)}>
                            {/* ... ヘッダー内容 ... */}
                             <div className={`${styles.chapterChevron} ${expandedChapters[chapter.id] ? styles.chapterChevronOpen : ''}`}> <ChevronRight size={16} /> </div>
                             <h4 className={styles.chapterTitle}>{chapter.name}</h4>
                             <div className={styles.chapterCountBadge}> {chapter.questions.length}問 </div>
                        </div>
                        {/* 章の中の問題カードリスト */}
                        {expandedChapters[chapter.id] && (
                          <div className={styles.questionCardList}>
                            {chapter.questions.map(question => {
                              const understandingStyle = getUnderstandingStyle(question.understanding);
                              const cardBorderColorStyle = { borderLeftColor: subjectColorValue };
                              return (
                                // 問題カード
                                <div key={question.id} className={styles.questionCard} style={cardBorderColorStyle}>
                                    {/* ... カード内容 ... */}
                                     {bulkEditMode && ( <input type="checkbox" className={styles.questionCheckbox} checked={selectedQuestions.includes(question.id)} onChange={() => toggleQuestionSelection(question.id)} /> )}
                                     <div className={styles.questionId} title={question.id}> {question.id} </div>
                                     <div className={styles.statusGrid}> <div className={styles.statusItem} title="次回予定日"> <Clock size={14} /> <span>{formatDate(question.nextDate)}</span> </div> <div className={styles.statusItem} title="復習間隔"> <CalendarIcon size={14} /> <span>{question.interval}</span> </div> <div className={`${styles.statusItem} ${styles.understandingBadge} ${understandingStyle.bgClass}`} title={`理解度: ${question.understanding}`}> {React.cloneElement(understandingStyle.icon, { size: 14})} <span className={understandingStyle.textClass}> {question.understanding.includes(':') ? question.understanding.split(':')[0] : question.understanding} </span> </div> <div className={styles.statusItem} title={`正解率: ${question.correctRate}% (${question.answerCount}回)`}> <div className={styles.rateBarContainer}><div className={styles.rateBar}><div className={`${styles.rateBarInner} ${getCorrectRateColorClass(question.correctRate)}`} style={{ width: `${question.correctRate}%` }}></div></div></div> <span className={styles.rateText}>{question.correctRate}%</span> </div> </div>
                                     <button onClick={() => setEditingQuestion(question)} className={styles.editButton} title="編集"> <Edit size={16}/> </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div> // 科目アコーディオン end
            );
          })}
        </div> // 問題リスト全体 end
      )}

      {/* 一括編集用カレンダーモーダル (変更なし) */}
      {bulkEditMode && showCalendarModal && ( /* ... モーダルJSX ... */ )}

    </div> // 全体コンテナ end
  );
};

export default RedesignedAllQuestionsView;
