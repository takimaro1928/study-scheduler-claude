// src/RedesignedAllQuestionsView.jsx (イベント伝播停止を追加 - 完全版)
import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info,
  ChevronRight, ChevronDown, ChevronUp, X as XIcon
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ja } from 'date-fns/locale';
import styles from './RedesignedAllQuestionsView.module.css';
import datePickerStyles from './DatePickerCalendarModal.module.css';

// --- ヘルパー関数 ---
const subjectColorMap = {
    "経営管理論": "#a5b4fc", "運営管理": "#6ee7b7", "経済学": "#fca5a5",
    "経営情報システム": "#93c5fd", "経営法務": "#c4b5fd",
    "中小企業経営・中小企業政策": "#fcd34d", "過去問題集": "#94a3b8", "未分類": "#d1d5db",
};
// 色コードを返す関数 (CSS Module クラスではなく色コードを返すように)
const getSubjectColorCode = (subjectName) => {
    return subjectColorMap[subjectName || "未分類"] || subjectColorMap["未分類"];
};
// 理解度スタイル取得関数
const getUnderstandingStyle = (understanding) => {
    const iconSize = "w-3.5 h-3.5"; // アイコンサイズ統一
    const understandingKey = understanding?.startsWith('曖昧△') ? '曖昧△' : understanding;
    let styleKey = 'Gray'; // デフォルト
    if (understandingKey === '理解○') styleKey = 'Green';
    else if (understandingKey === '曖昧△') styleKey = 'Yellow';
    else if (understandingKey === '理解できていない×') styleKey = 'Red';

    // CSS Modulesのクラス名を返すように（CSSファイルに定義がある前提）
    const iconComponent = { 'Green': CheckCircle, 'Yellow': AlertTriangle, 'Red': XCircle, 'Gray': Info }[styleKey];
    const textClass = styles[`understandingText${styleKey}`] || ''; // Fallbackなし
    const bgClass = styles[`understandingBadge${styleKey}`] || ''; // Fallbackなし
    const iconClass = `${iconSize} ${styles[`icon${styleKey}`] || ''}`; // Fallbackなし

    // 意図通りにアイコンがレンダリングされない可能性があったため修正
    return { icon: iconComponent ? React.createElement(iconComponent, { className: iconClass }) : null, textClass, bgClass };
};
// 正解率バーの色取得関数 (CSS Moduleクラス名を返す)
const getCorrectRateColorClass = (rate) => {
  if (rate === null || typeof rate === 'undefined' || rate < 0) return styles.rateBarColorGray || "bg-gray-300";
  if (rate >= 80) return styles.rateBarColorGreen || "bg-green-500";
  if (rate >= 60) return styles.rateBarColorLime || "bg-lime-500";
  if (rate >= 40) return styles.rateBarColorYellow || "bg-yellow-500";
  if (rate >= 20) return styles.rateBarColorOrange || "bg-orange-500";
  return styles.rateBarColorRed || "bg-red-500";
};
// --- ヘルパー関数ここまで ---


const RedesignedAllQuestionsView = ({
  subjects, expandedSubjects = {}, expandedChapters = {}, toggleSubject, toggleChapter,
  setEditingQuestion, setBulkEditMode, bulkEditMode, selectedQuestions = [],
  setSelectedQuestions, saveBulkEdit, formatDate, toggleQuestionSelection,
  selectedDate, setSelectedDate // App.js から受け取る Props
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ understanding: 'all', correctRate: 'all', interval: 'all', });
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  // ★ インライン編集関連の state は削除済み (ユーザー提供コードに元々なかったか確認)

  // フィルターと検索ロジック (ユーザー提供コードの useMemo)
  const filteredSubjects = useMemo(() => {
     if (!Array.isArray(subjects)) return []; // 安全対策
    return subjects.map(subject => {
       if (!subject || !Array.isArray(subject.chapters)) return { ...subject, chapters: [] }; // 安全対策
      const chaptersWithFilteredQuestions = subject.chapters.map(chapter => {
         if (!chapter || !Array.isArray(chapter.questions)) return { ...chapter, questions: [] }; // 安全対策
        const filteredQuestions = chapter.questions.filter(question => {
          if (typeof question !== 'object' || question === null || !question.id) return false; // 安全対策
          if (searchTerm && !question.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          if (filters.understanding !== 'all') { const understandingValue = question.understanding || ''; if (!understandingValue.startsWith(filters.understanding)) return false; }
          const rate = question.correctRate ?? -1;
          if (filters.correctRate === 'high' && rate < 80) return false;
          if (filters.correctRate === 'medium' && (rate < 50 || rate >= 80)) return false;
          if (filters.correctRate === 'low' && rate >= 50) return false;
          if (filters.interval !== 'all' && question.interval !== filters.interval) return false;
          return true;
        });
        return { ...chapter, questions: filteredQuestions };
      }).filter(chapter => chapter && chapter.questions.length > 0); // 安全対策
      return { ...subject, chapters: chaptersWithFilteredQuestions };
    }).filter(subject => subject && subject.chapters.length > 0); // 安全対策
  }, [subjects, searchTerm, filters]);

  // 全選択/全解除 (ユーザー提供コードのロジック)
  const toggleSelectAllForSubject = (subject) => {
     if (!subject || !Array.isArray(subject.chapters)) return;
     const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions?.map(q => q.id) || []);
     if(allQuestionIdsInSubject.length === 0) return;
     const allCurrentlySelected = allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));
     if (allCurrentlySelected) {
       setSelectedQuestions(prev => prev.filter(id => !allQuestionIdsInSubject.includes(id)));
     } else {
       setSelectedQuestions(prev => [...new Set([...prev, ...allQuestionIdsInSubject])]);
     }
  };

  // 一括編集実行 (ユーザー提供コードのロジック)
  const executeBulkEdit = () => {
    if (selectedDate && selectedQuestions.length > 0) {
      saveBulkEdit(selectedDate); // App.jsの関数呼び出し
      setShowCalendarModal(false);
      // 一括編集モード解除や選択解除は saveBulkEdit 側で行う想定 (App.jsへ移動)
      // setBulkEditMode(false);
      // setSelectedQuestions([]);
    } else {
       console.warn("一括編集の実行がキャンセルされました。日付または問題が選択されていません。");
    }
  };


  // --- レンダリング ---
  return (
    // CSS Module クラスを適用 (フォールバックも一応残す)
    <div className={styles.container || "container p-4 max-w-6xl mx-auto pb-24"}>
      {/* 上部コントロール */}
      <div className={styles.controlsContainer || "flex flex-col md:flex-row gap-3 md:gap-4 mb-6 items-center"}>
          <div className={styles.searchBox || "relative flex-grow w-full md:max-w-xs"}>
            <input type="text" placeholder="問題IDで検索..." className={styles.searchInput || "pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <div className={styles.searchIcon || "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"}><Search size={18}/></div>
            {searchTerm && ( <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton || "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"}> <XIcon size={18} /> </button> )}
          </div>
          <div className={styles.controlButtons || "flex gap-3 w-full md:w-auto"}>
            <button onClick={() => setShowFilters(!showFilters)} className={styles.controlButton || "px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 flex items-center shadow-sm text-gray-700 font-medium text-sm w-full justify-center md:w-auto"}>
              <Filter size={16} className="mr-2" /> フィルター {showFilters ? <ChevronUp size={16} style={{marginLeft: '4px'}} /> : <ChevronDown size={16} style={{marginLeft: '4px'}} />}
            </button>
            <button onClick={() => setBulkEditMode(!bulkEditMode)} className={`${styles.controlButton || "controlButton"} ${ bulkEditMode ? (styles.bulkEditButtonActive || "bg-red-100 text-red-700 border-red-200") : (styles.bulkEditButtonInactive || "bg-indigo-50 text-indigo-700 border-indigo-200") }`}>
              {bulkEditMode ? '選択終了' : '一括編集'}
            </button>
          </div>
      </div>

      {/* 詳細フィルターパネル */}
      {showFilters && (
        <div className={styles.filterPanel || "bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 animate-fadeIn"}>
          <div className={styles.filterGrid || "grid grid-cols-1 md:grid-cols-3 gap-4"}>
            <div>
              <label className={styles.filterLabel || "block text-xs font-medium text-gray-600 mb-1"}>理解度</label>
              <select className={styles.filterSelect || "w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"} value={filters.understanding} onChange={(e) => setFilters({...filters, understanding: e.target.value})}>
                <option value="all">すべて</option> <option value="理解○">理解○</option> <option value="曖昧△">曖昧△</option> <option value="理解できていない×">理解できていない×</option>
              </select>
            </div>
            <div>
              <label className={styles.filterLabel || "block text-xs font-medium text-gray-600 mb-1"}>正解率</label>
              <select className={styles.filterSelect || "w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"} value={filters.correctRate} onChange={(e) => setFilters({...filters, correctRate: e.target.value})}>
                <option value="all">すべて</option> <option value="high">高い (80%↑)</option> <option value="medium">中間 (50-79%)</option> <option value="low">低い (↓50%)</option>
              </select>
            </div>
            <div>
              <label className={styles.filterLabel || "block text-xs font-medium text-gray-600 mb-1"}>復習間隔</label>
              <select className={styles.filterSelect || "w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"} value={filters.interval} onChange={(e) => setFilters({...filters, interval: e.target.value})}>
                <option value="all">すべて</option> <option value="1日">1日</option> <option value="3日">3日</option> <option value="7日">7日</option> <option value="14日">14日</option> <option value="1ヶ月">1ヶ月</option> <option value="2ヶ月">2ヶ月</option> <option value="8日">8日(曖昧)</option>
              </select>
            </div>
          </div>
          <div className={styles.filterActions || "mt-4 flex justify-end"}>
            <button onClick={() => setFilters({ understanding: 'all', correctRate: 'all', interval: 'all' })} className={styles.filterResetButton || "px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-xs font-medium"}> リセット </button>
          </div>
        </div>
      )}

      {/* 一括編集時の操作パネル */}
      {bulkEditMode && (
        <div className={styles.bulkEditPanel || "bg-indigo-50 p-3 sm:p-4 mb-4 rounded-lg border border-indigo-200 shadow-sm animate-fadeIn flex flex-col sm:flex-row justify-between items-center gap-3"}>
          <p className={styles.bulkEditText || "text-indigo-800 font-medium text-sm"}>
            {selectedQuestions.length > 0 ? `${selectedQuestions.length} 件の問題を選択中` : "問題を選択してください"}
          </p>
          <button onClick={() => setShowCalendarModal(true)} disabled={selectedQuestions.length === 0} className={styles.bulkEditButton || "px-4 py-2 rounded-md font-medium shadow-sm flex items-center text-sm bg-indigo-600 text-white hover:bg-indigo-700"}>
            <CalendarIcon size={16} /> 日付を一括設定
          </button>
        </div>
      )}

      {/* 問題リスト (アコーディオン + カード) */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-200"> <p className="text-gray-500">表示できる問題がありません</p> </div>
       ) : (
        <div className={styles.listContainer}>
          {filteredSubjects.map(subject => {
            const subjectColorValue = getSubjectColorCode(subject.name);
            const allQuestionIdsInSubject = subject.chapters?.flatMap(ch => ch.questions?.map(q => q.id) || []) || [];
            const isAllSelectedInSubject = allQuestionIdsInSubject.length > 0 && allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));

            return (
              <div key={subject.id} className={styles.subjectAccordion}>
                {/* 科目ヘッダー */}
                <div className={styles.subjectHeader} style={{ borderLeftColor: subjectColorValue }} onClick={() => toggleSubject(subject.id)}>
                    {bulkEditMode && ( <input type="checkbox" className={styles.subjectCheckbox} checked={isAllSelectedInSubject} onChange={() => toggleSelectAllForSubject(subject)} onClick={(e) => e.stopPropagation()} /> )}
                   <div className={`${styles.subjectChevron} ${expandedSubjects?.[subject.id] ? styles.subjectChevronOpen : ''}`}> <ChevronRight size={18} /> </div>
                   <h3 className={styles.subjectTitle}>{subject.name}</h3>
                   <div className={styles.subjectCountBadge}> {subject.chapters?.reduce((sum, c) => sum + (c.questions?.length || 0), 0) || 0}問 </div>
                </div>
                {/* 科目の中身 */}
                {expandedSubjects?.[subject.id] && (
                  <div className={styles.subjectContent}>
                    {subject.chapters.map(chapter => (
                      <div key={chapter.id} className={styles.chapterAccordion}>
                        {/* 章ヘッダー */}
                        <div className={styles.chapterHeader} onClick={() => toggleChapter(chapter.id)}>
                           <div className={`${styles.chapterChevron} ${expandedChapters?.[chapter.id] ? styles.chapterChevronOpen : ''}`}> <ChevronRight size={16} /> </div>
                           <h4 className={styles.chapterTitle}>{chapter.name}</h4>
                           <div className={styles.chapterCountBadge}> {chapter.questions?.length || 0}問 </div>
                        </div>
                        {/* 章の中の問題をカード形式 */}
                        {expandedChapters?.[chapter.id] && (
                          <div className={styles.questionCardList}>
                            {chapter.questions.map(question => {
                              const understandingStyle = getUnderstandingStyle(question.understanding);
                              const cardBorderColorStyle = { borderLeftColor: subjectColorValue };

                              return (
                                // 問題カード
                                <div key={question.id} className={styles.questionCard} style={cardBorderColorStyle}>
                                  {bulkEditMode && ( <input type="checkbox" className={styles.questionCheckbox} checked={selectedQuestions.includes(question.id)} onChange={() => toggleQuestionSelection(question.id)} /> )}
                                  {/* 問題ID */}
                                  <div className={styles.questionId} title={question.id}> {question.id} </div>
                                  {/* ステータス情報 */}
                                  <div className={styles.statusGrid}>
                                      <div className={styles.statusItem} title="次回予定日"> <Clock size={14} /> <span>{formatDate(question.nextDate)}</span> </div>
                                      <div className={styles.statusItem} title="復習間隔"> <CalendarIcon size={14} /> <span>{question.interval}</span> </div>
                                      <div className={`${styles.statusItem} ${styles.understandingBadge} ${understandingStyle.bgClass}`} title={`理解度: ${question.understanding}`}>
                                          {understandingStyle.icon}
                                          <span className={understandingStyle.textClass}> {question.understanding?.includes(':') ? question.understanding.split(':')[0] : question.understanding} </span>
                                      </div>
                                      <div className={styles.statusItem} title={`正解率: ${question.correctRate}% (${question.answerCount || 0}回)`}>
                                          <div className={styles.rateBarContainer}><div className={styles.rateBar}><div className={`${styles.rateBarInner} ${getCorrectRateColorClass(question.correctRate ?? 0)}`} style={{ width: `${question.correctRate ?? 0}%` }}></div></div></div>
                                          <span className={styles.rateText}>{question.correctRate ?? 0}%</span>
                                      </div>
                                  </div>
                                  {/* 編集ボタン */}
                                  <button onClick={() => setEditingQuestion(question)} className={styles.editButton} title="編集"> <Edit size={16}/> </button>
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

      {/* ★★★ 一括編集用カレンダーモーダル ★★★ */}
      {bulkEditMode && showCalendarModal && (
         <>
             {/* オーバーレイ: 外側クリックで閉じる */}
             <div className={datePickerStyles.overlay} onClick={() => setShowCalendarModal(false)} />
             {/* モーダル本体: クリックイベントの伝播を停止 */}
             {/* ↓↓↓ ここが修正点です ↓↓↓ */}
             <div className={datePickerStyles.modal} onClick={(e) => e.stopPropagation()}>
                {/* ↑↑↑ ここが修正点です ↑↑↑ */}
                <button onClick={() => setShowCalendarModal(false)} className={datePickerStyles.closeButton}> <XIcon size={18} /> </button>
                <div className={datePickerStyles.calendarContainer}>
                    <DayPicker
                        mode="single"
                        required
                        selected={selectedDate}
                        onSelect={(date) => { // 日付選択時にモーダルは閉じない
                            if (date) {
                                setSelectedDate(date);
                            } else {
                                setSelectedDate(null);
                            }
                        }}
                        locale={ja}
                        showOutsideDays fixedWeeks
                        captionLayout="dropdown-buttons"
                        fromYear={new Date().getFullYear() - 2}
                        toYear={new Date().getFullYear() + 3}
                    />
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
