// src/RedesignedAllQuestionsView.jsx (useMemoインポート + executeBulkEdit関数 定義済み)
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ 必ずファイルの中身全体をこのコードで置き換えてください！ ★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

import React, { useState, useMemo } from 'react'; // ★★★ useMemo をインポート ★★★
import {
  Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info,
  ChevronRight, ChevronDown, ChevronUp, X as XIcon
} from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar'; // BulkEdit用 (もし存在すれば)
// CSSモジュールをインポート (これらは別途作成・定義が必要です)
import styles from './RedesignedAllQuestionsView.module.css';
import datePickerStyles from './DatePickerCalendarModal.module.css';

// --- ヘルパー関数等 (変更なし) ---
const subjectColorMap = { "経営管理論": "#a5b4fc", "運営管理": "#6ee7b7", "経済学": "#fca5a5", "経営情報システム": "#93c5fd", "経営法務": "#c4b5fd", "中小企業経営・中小企業政策": "#fcd34d", "過去問題集": "#94a3b8", "未分類": "#d1d5db", };
const getSubjectColorClass = (subjectName) => { return subjectColorMap[subjectName || "未分類"] || subjectColorMap["未分類"]; };
const getUnderstandingStyle = (understanding) => { const iconSize = "w-3.5 h-3.5"; if (understanding === '理解○') { return { icon: <CheckCircle className={`${iconSize} text-green-600`} />, textClass: 'text-green-700', bgClass: 'bg-green-50' }; } else if (understanding?.startsWith('曖昧△')) { return { icon: <AlertTriangle className={`${iconSize} text-yellow-600`} />, textClass: 'text-yellow-700', bgClass: 'bg-yellow-50' }; } else if (understanding === '理解できていない×') { return { icon: <XCircle className={`${iconSize} text-red-600`} />, textClass: 'text-red-700', bgClass: 'bg-red-50' }; } else { return { icon: <Info className={`${iconSize} text-gray-500`} />, textClass: 'text-gray-600', bgClass: 'bg-gray-50' }; } };
const getCorrectRateColor = (rate) => { if (rate >= 80) return "bg-green-500"; if (rate >= 60) return "bg-lime-500"; if (rate >= 40) return "bg-yellow-500"; if (rate >= 20) return "bg-orange-500"; return "bg-red-500"; };

// --- コンポーネント本体 ---
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
  const filteredSubjects = useMemo(() => { // ★★★ useMemo 使用 ★★★
    // ... (フィルターロジックは変更なし、ただし understanding のチェックは安全なものに) ...
     return subjects.map(subject => {
      const chaptersWithFilteredQuestions = subject.chapters.map(chapter => {
        const filteredQuestions = chapter.questions.filter(question => {
          if (searchTerm && !question.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          if (filters.understanding !== 'all') {
              // understanding が文字列か確認してから startsWith
              if (typeof question.understanding !== 'string' || !question.understanding.startsWith(filters.understanding)) {
                  return false;
              }
          }
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

  // 全選択/全解除 (変更なし)
  const toggleSelectAllForSubject = (subject) => { /* ... */ };

  // ★★★ executeBulkEdit 関数を定義 ★★★
  const executeBulkEdit = () => {
    if (selectedDate && selectedQuestions.length > 0) {
      console.log(`${selectedQuestions.length}個の問題を${formatDate(selectedDate)}に設定します`, selectedQuestions);
      saveBulkEdit(selectedDate); // App.jsの関数を呼び出し
      setShowCalendarModal(false);
      setBulkEditMode(false);
      setSelectedQuestions([]);
    } else {
       console.warn("一括編集の実行がキャンセルされました。日付または問題が選択されていません。");
    }
  };

  // --- レンダリング ---
  return (
    <div className={styles.container || "container p-4 max-w-6xl mx-auto pb-24"}> {/* フォールバック追加 */}
      {/* 上部コントロール */}
      <div className={styles.controlsContainer || "flex flex-col md:flex-row gap-3 md:gap-4 mb-6 items-center"}>
          {/* 検索、フィルターボタン、一括編集ボタン */}
          <div className={styles.searchBox || "relative flex-grow w-full md:max-w-xs"}><input type="text" placeholder="問題IDで検索..." className={styles.searchInput || "pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><div className={styles.searchIcon || "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"}><Search size={18}/></div>{searchTerm && ( <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton || "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"}> <XIcon size={18} /> </button> )}</div>
          <div className={styles.controlButtons || "flex gap-3 w-full md:w-auto"}> <button onClick={() => setShowFilters(!showFilters)} className={styles.controlButton || "px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 flex items-center shadow-sm text-gray-700 font-medium text-sm w-full justify-center md:w-auto"}> <Filter size={16} className="mr-2" /> フィルター {showFilters ? <ChevronUp size={16} style={{marginLeft: '4px'}} /> : <ChevronDown size={16} style={{marginLeft: '4px'}} />} </button> <button onClick={() => setBulkEditMode(!bulkEditMode)} className={`${styles.controlButton || "controlButton"} ${ bulkEditMode ? (styles.bulkEditButtonActive || "bg-red-100 text-red-700 border-red-200") : (styles.bulkEditButtonInactive || "bg-indigo-50 text-indigo-700 border-indigo-200") }`}> {bulkEditMode ? '選択終了' : '一括編集'} </button></div>
      </div>

      {/* 詳細フィルターパネル */}
      {showFilters && ( <div className={styles.filterPanel || "bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 animate-fadeIn"}> {/* ...フィルターのJSX... */} <div className={styles.filterGrid || "grid grid-cols-1 md:grid-cols-3 gap-4"}> <div> <label className={styles.filterLabel || "block text-xs font-medium text-gray-600 mb-1"}>理解度</label> <select className={styles.filterSelect || "w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"} value={filters.understanding} onChange={(e) => setFilters({...filters, understanding: e.target.value})}> <option value="all">すべて</option> <option value="理解○">理解○</option> <option value="曖昧△">曖昧△</option> <option value="理解できていない×">理解できていない×</option> </select> </div> <div> <label className={styles.filterLabel || "block text-xs font-medium text-gray-600 mb-1"}>正解率</label> <select className={styles.filterSelect || "w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"} value={filters.correctRate} onChange={(e) => setFilters({...filters, correctRate: e.target.value})}> <option value="all">すべて</option> <option value="high">高い (80%↑)</option> <option value="medium">中間 (50-79%)</option> <option value="low">低い (↓50%)</option> </select> </div> <div> <label className={styles.filterLabel || "block text-xs font-medium text-gray-600 mb-1"}>復習間隔</label> <select className={styles.filterSelect || "w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"} value={filters.interval} onChange={(e) => setFilters({...filters, interval: e.target.value})}> <option value="all">すべて</option> <option value="1日">1日</option> <option value="3日">3日</option> <option value="7日">7日</option> <option value="14日">14日</option> <option value="1ヶ月">1ヶ月</option> <option value="2ヶ月">2ヶ月</option> <option value="8日">8日(曖昧)</option> </select> </div> </div> <div className={styles.filterActions || "mt-4 flex justify-end"}> <button onClick={() => setFilters({ understanding: 'all', correctRate: 'all', interval: 'all' })} className={styles.filterResetButton || "px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-xs font-medium"}> リセット </button> </div> </div> )}

      {/* 一括編集時の操作パネル */}
      {bulkEditMode && ( <div className={styles.bulkEditPanel || "bg-indigo-50 p-3 sm:p-4 mb-4 rounded-lg border border-indigo-200 shadow-sm animate-fadeIn flex flex-col sm:flex-row justify-between items-center gap-3"}> <p className={styles.bulkEditText || "text-indigo-800 font-medium text-sm"}> {selectedQuestions.length > 0 ? `${selectedQuestions.length} 件の問題を選択中` : "問題を選択してください"} </p> <button onClick={() => setShowCalendarModal(true)} disabled={selectedQuestions.length === 0} className={styles.bulkEditButton || "px-4 py-2 rounded-md font-medium shadow-sm flex items-center text-sm bg-indigo-600 text-white hover:bg-indigo-700"}> <CalendarIcon size={16} className="mr-2" /> 日付を一括設定 </button> </div> )}

      {/* 問題リスト (アコーディオン + カード) */}
      {filteredSubjects.length === 0 ? ( <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-200"> <p className="text-gray-500">表示できる問題がありません</p> </div> ) : (
        <div className={styles.listContainer || "space-y-4"}>
          {filteredSubjects.map(subject => {
            const subjectColorValue = subjectColorMap[subject.name || "未分類"] || subjectColorMap["未分類"];
            const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions.map(q => q.id));
            const isAllSelectedInSubject = allQuestionIdsInSubject.length > 0 && allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));

            return (
              <div key={subject.id} className={styles.subjectAccordion || "bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"}>
                {/* 科目ヘッダー */}
                <div className={styles.subjectHeader || "flex items-center p-3 cursor-pointer border-l-4 bg-gray-50 border-b border-gray-200"} style={{ borderLeftColor: subjectColorValue }} onClick={() => toggleSubject(subject.id)}>
                    {bulkEditMode && ( <input type="checkbox" className={styles.subjectCheckbox || "h-4 w-4 text-indigo-600 border-gray-300 rounded mr-3 ml-1 flex-shrink-0"} checked={isAllSelectedInSubject} onChange={() => toggleSelectAllForSubject(subject)} onClick={(e) => e.stopPropagation()} /> )}
                   <div className={`${styles.subjectChevron || "mr-2 text-gray-400 transition-transform duration-200"} ${expandedSubjects[subject.id] ? styles.subjectChevronOpen : ''}`}> <ChevronRight size={18} /> </div>
                   <h3 className={styles.subjectTitle || "font-semibold text-gray-700 text-sm sm:text-base flex-grow"}>{subject.name}</h3>
                   <div className={styles.subjectCountBadge || "ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium"}> {subject.chapters.reduce((sum, c) => sum + c.questions.length, 0)}問 </div>
                </div>
                {/* 科目の中身 */}
                {expandedSubjects[subject.id] && (
                  <div className={styles.subjectContent || "border-t border-gray-200"}>
                    {subject.chapters.map(chapter => (
                      <div key={chapter.id} className={styles.chapterAccordion || "border-b border-gray-100 last:border-b-0"}>
                        {/* 章ヘッダー */}
                        <div className={styles.chapterHeader || "flex items-center p-3 pl-6 sm:pl-8 cursor-pointer hover:bg-gray-50 transition-colors"} onClick={() => toggleChapter(chapter.id)}>
                           <div className={`${styles.chapterChevron || "mr-2 text-gray-400 transition-transform duration-200"} ${expandedChapters[chapter.id] ? styles.chapterChevronOpen : ''}`}> <ChevronRight size={16} /> </div>
                           <h4 className={styles.chapterTitle || "text-gray-600 font-medium text-sm flex-grow"}>{chapter.name}</h4>
                           <div className={styles.chapterCountBadge || "ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium"}> {chapter.questions.length}問 </div>
                        </div>
                        {/* 章の中の問題カードリスト */}
                        {expandedChapters[chapter.id] && (
                          <div className={styles.questionCardList || "px-3 py-3 sm:px-4 sm:py-4 space-y-3 bg-gray-50/30"}>
                            {chapter.questions.map(question => {
                              const understandingStyle = getUnderstandingStyle(question.understanding);
                              const cardBorderColorStyle = { borderLeftColor: subjectColorMap[subject.name || "未分類"] || subjectColorMap["未分類"] }; // インラインスタイルで色指定

                              return (
                                // 問題カード
                                <div key={question.id} className={styles.questionCard || "bg-white rounded-md shadow-sm border hover:shadow-md transition-shadow flex items-center p-3 gap-3 border-l-4"} style={cardBorderColorStyle}>
                                  {bulkEditMode && ( <input type="checkbox" className={styles.questionCheckbox || "h-4 w-4 text-indigo-600 border-gray-300 rounded flex-shrink-0"} checked={selectedQuestions.includes(question.id)} onChange={() => toggleQuestionSelection(question.id)} /> )}
                                  <div className={styles.questionId || "font-semibold text-sm text-gray-800 flex-shrink-0 w-20 sm:w-24 whitespace-nowrap overflow-hidden text-ellipsis"} title={question.id}> {question.id} </div>
                                  {/* ステータス情報 */}
                                  <div className={styles.statusGrid || "flex-grow grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 text-xs"}>
                                      <div className={styles.statusItem || "flex items-center text-gray-600"} title="次回予定日"> <Clock size={14} /> <span>{formatDate(question.nextDate)}</span> </div>
                                      <div className={styles.statusItem || "flex items-center text-gray-600"} title="復習間隔"> <CalendarIcon size={14} /> <span>{question.interval}</span> </div>
                                      <div className={`${styles.statusItem || "flex items-center"} ${styles.understandingBadge || "rounded-full px-1.5 py-0.5 w-fit"} ${styles[understandingStyle.bgClass.replace('bg-','understandingBadge')] || understandingStyle.bgClass}`} title={`理解度: ${question.understanding}`}> {React.cloneElement(understandingStyle.icon, { size: 14})} <span className={styles[understandingStyle.textClass.replace('text-','understandingText')] || understandingStyle.textClass}> {question.understanding.includes(':') ? question.understanding.split(':')[0] : question.understanding} </span> </div>
                                      <div className={styles.statusItem || "flex items-center text-gray-600"} title={`正解率: ${question.correctRate}% (${question.answerCount}回)`}> <div className={styles.rateBarContainer || "flex items-center"}><div className={styles.rateBar || "w-10 sm:w-12 h-1.5 bg-gray-200 rounded-full mr-1.5 flex-shrink-0 overflow-hidden"}><div className={`${styles.rateBarInner || "h-full rounded-full"} ${styles[getCorrectRateColor(question.correctRate).replace('bg-','rateBarColor')] || getCorrectRateColor(question.correctRate)}`} style={{ width: `${question.correctRate}%` }}></div></div></div> <span className={styles.rateText || "text-gray-600"}>{question.correctRate}%</span> </div>
                                  </div>
                                  <button onClick={() => setEditingQuestion(question)} className={styles.editButton || "ml-2 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0"} title="編集"> <Edit size={16}/> </button>
                                </div> // 問題カード end
                              );
                            })}
                          </div> // 問題カードリスト end
                        )}
                      </div> // 章 end
                    ))}
                  </div> // 科目の中身 end
                )}
              </div> // 科目アコーディオン end
            );
          })}
        </div> // 問題リスト全体 end
      )}

      {/* 一括編集用カレンダーモーダル (変更なし) */}
      {bulkEditMode && showCalendarModal && (
         <>
             <div className={datePickerStyles.overlay} onClick={() => setShowCalendarModal(false)} />
             <div className={datePickerStyles.modal}>
                <button onClick={() => setShowCalendarModal(false)} className={datePickerStyles.closeButton}> <XIcon size={18} /> </button>
                <div className={datePickerStyles.calendarContainer}>
                    <DatePickerCalendar selectedDate={selectedDate} onChange={setSelectedDate} />
                </div>
                 <div className={datePickerStyles.footer}>
                    <span>{selectedQuestions.length}件選択中</span>
                    <button onClick={executeBulkEdit} disabled={!selectedDate || selectedQuestions.length === 0} className={datePickerStyles.confirmButton}>
                        選択した問題をこの日に設定
                    </button>
                 </div>
             </div>
         </>
       )}

    </div> // 全体コンテナ end
  );
};

export default RedesignedAllQuestionsView;
