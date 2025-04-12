// src/RedesignedAllQuestionsView.jsx (CSS Modules + カード形式 + エラー修正 全文)
import React, { useState, useMemo } from 'react'; // ★ useMemo をインポート
import {
  Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info,
  ChevronRight, ChevronDown, ChevronUp, X as XIcon
} from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar'; // BulkEdit用
// CSSモジュールをインポート
import styles from './RedesignedAllQuestionsView.module.css';
import datePickerStyles from './DatePickerCalendarModal.module.css'; // BulkEditモーダル用

// 科目色定義
const subjectColorMap = {
    "経営管理論": "#a5b4fc", // indigo-300
    "運営管理": "#6ee7b7", // emerald-300
    "経済学": "#fca5a5", // red-300
    "経営情報システム": "#93c5fd", // blue-300
    "経営法務": "#c4b5fd", // violet-300
    "中小企業経営・中小企業政策": "#fcd34d", // amber-300
    "過去問題集": "#94a3b8", // slate-400
    "未分類": "#d1d5db", // gray-300
};
const getSubjectColorClass = (subjectName) => {
    // この関数は色コードを返すように変更 (インラインスタイル用)
    return subjectColorMap[subjectName || "未分類"] || subjectColorMap["未分類"];
};

// 理解度スタイル取得関数
const getUnderstandingStyle = (understanding) => {
  const iconSize = "w-3.5 h-3.5";
  if (understanding === '理解○') {
    return { icon: <CheckCircle className={`${iconSize} text-green-600`} />, textClass: styles.understandingTextGreen || 'understandingTextGreen', bgClass: styles.understandingBadgeGreen || 'understandingBadgeGreen'};
  } else if (understanding?.startsWith('曖昧△')) {
    return { icon: <AlertTriangle className={`${iconSize} text-yellow-600`} />, textClass: styles.understandingTextYellow || 'understandingTextYellow', bgClass: styles.understandingBadgeYellow || 'understandingBadgeYellow'};
  } else if (understanding === '理解できていない×') {
    return { icon: <XCircle className={`${iconSize} text-red-600`} />, textClass: styles.understandingTextRed || 'understandingTextRed', bgClass: styles.understandingBadgeRed || 'understandingBadgeRed'};
  } else {
    return { icon: <Info className={`${iconSize} text-gray-500`} />, textClass: styles.understandingTextGray || 'understandingTextGray', bgClass: styles.understandingBadgeGray || 'understandingBadgeGray'};
  }
};

// 正解率バーの色取得関数 (CSS Module クラス名を返すように)
const getCorrectRateColorClass = (rate) => {
  if (rate >= 80) return styles.rateBarColorGreen || "rateBarColorGreen";
  if (rate >= 60) return styles.rateBarColorLime || "rateBarColorLime";
  if (rate >= 40) return styles.rateBarColorYellow || "rateBarColorYellow";
  if (rate >= 20) return styles.rateBarColorOrange || "rateBarColorOrange";
  return styles.rateBarColorRed || "rateBarColorRed";
};


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
  selectedDate, // BulkEdit用日付
  setSelectedDate // BulkEdit用日付Setter
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
          if (filters.understanding !== 'all') {
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


  // 全選択/全解除
  const toggleSelectAllForSubject = (subject) => {
    const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions.map(q => q.id));
    const allCurrentlySelected = allQuestionIdsInSubject.length > 0 && allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));
    if (allCurrentlySelected) {
      setSelectedQuestions(prev => prev.filter(id => !allQuestionIdsInSubject.includes(id)));
    } else {
      setSelectedQuestions(prev => [...new Set([...prev, ...allQuestionIdsInSubject])]);
    }
  };

  // ★★★ executeBulkEdit 関数定義 ★★★
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
    // className を styles オブジェクトから参照
    <div className={styles.container}>
      {/* 上部コントロール */}
      <div className={styles.controlsContainer}>
          <div className={styles.searchBox}>
              <input type="text" placeholder="問題IDで検索..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div className={styles.searchIcon}><Search size={18}/></div>
              {searchTerm && ( <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton}> <XIcon size={18} /> </button> )}
          </div>
          <div className={styles.controlButtons}>
              <button onClick={() => setShowFilters(!showFilters)} className={styles.controlButton}> <Filter size={16} /> フィルター {showFilters ? <ChevronUp size={16} style={{marginLeft: '4px'}} /> : <ChevronDown size={16} style={{marginLeft: '4px'}} />} </button>
              <button onClick={() => setBulkEditMode(!bulkEditMode)} className={`${styles.controlButton} ${ bulkEditMode ? styles.bulkEditButtonActive : styles.bulkEditButtonInactive }`}> {bulkEditMode ? '選択終了' : '一括編集'} </button>
          </div>
      </div>

      {/* 詳細フィルターパネル */}
      {showFilters && (
          <div className={styles.filterPanel}>
              <div className={styles.filterGrid}>
                  <div> <label className={styles.filterLabel}>理解度</label> <select className={styles.filterSelect} value={filters.understanding} onChange={(e) => setFilters({...filters, understanding: e.target.value})}> <option value="all">すべて</option> <option value="理解○">理解○</option> <option value="曖昧△">曖昧△</option> <option value="理解できていない×">理解できていない×</option> </select> </div>
                  <div> <label className={styles.filterLabel}>正解率</label> <select className={styles.filterSelect} value={filters.correctRate} onChange={(e) => setFilters({...filters, correctRate: e.target.value})}> <option value="all">すべて</option> <option value="high">高い (80%↑)</option> <option value="medium">中間 (50-79%)</option> <option value="low">低い (↓50%)</option> </select> </div>
                  <div> <label className={styles.filterLabel}>復習間隔</label> <select className={styles.filterSelect} value={filters.interval} onChange={(e) => setFilters({...filters, interval: e.target.value})}> <option value="all">すべて</option> <option value="1日">1日</option> <option value="3日">3日</option> <option value="7日">7日</option> <option value="14日">14日</option> <option value="1ヶ月">1ヶ月</option> <option value="2ヶ月">2ヶ月</option> <option value="8日">8日(曖昧)</option> </select> </div>
              </div>
              <div className={styles.filterActions}> <button onClick={() => setFilters({ understanding: 'all', correctRate: 'all', interval: 'all' })} className={styles.filterResetButton}> リセット </button> </div>
          </div>
      )}

       {/* 一括編集時の操作パネル */}
       {bulkEditMode && (
          <div className={styles.bulkEditPanel}>
              <p className={styles.bulkEditText}> {selectedQuestions.length > 0 ? `${selectedQuestions.length} 件の問題を選択中` : "問題を選択してください"} </p>
              <button onClick={() => setShowCalendarModal(true)} disabled={selectedQuestions.length === 0} className={styles.bulkEditButton}> <CalendarIcon size={16} /> 日付を一括設定 </button>
          </div>
       )}

      {/* 問題リスト (アコーディオン + カード) */}
      {filteredSubjects.length === 0 ? ( <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-200"> <p className="text-gray-500">表示できる問題がありません</p> </div> ) : (
        <div className={styles.listContainer}>
          {filteredSubjects.map(subject => {
            const subjectColorValue = getSubjectColorClass(subject.name); // 色コードを取得
            const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions.map(q => q.id));
            const isAllSelectedInSubject = allQuestionIdsInSubject.length > 0 && allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));

            return (
              <div key={subject.id} className={styles.subjectAccordion}>
                {/* 科目ヘッダー (インラインスタイルで色指定) */}
                <div className={styles.subjectHeader} style={{ borderLeftColor: subjectColorValue }} onClick={() => toggleSubject(subject.id)}>
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
                           <div className={`${styles.chapterChevron} ${expandedChapters[chapter.id] ? styles.chapterChevronOpen : ''}`}> <ChevronRight size={16} /> </div>
                           <h4 className={styles.chapterTitle}>{chapter.name}</h4>
                           <div className={styles.chapterCountBadge}> {chapter.questions.length}問 </div>
                        </div>
                        {/* 章の中の問題カードリスト */}
                        {expandedChapters[chapter.id] && (
                          <div className={styles.questionCardList}>
                            {chapter.questions.map(question => {
                              const understandingStyle = getUnderstandingStyle(question.understanding);
                              const cardBorderColorStyle = { borderLeftColor: subjectColorValue }; // 科目色

                              return (
                                // 問題カード
                                <div key={question.id} className={styles.questionCard} style={cardBorderColorStyle}>
                                  {bulkEditMode && ( <input type="checkbox" className={styles.questionCheckbox} checked={selectedQuestions.includes(question.id)} onChange={() => toggleQuestionSelection(question.id)} /> )}
                                  <div className={styles.questionId} title={question.id}> {question.id} </div>
                                  {/* ステータス情報 */}
                                  <div className={styles.statusGrid}>
                                      <div className={styles.statusItem} title="次回予定日"> <Clock size={14} /> <span>{formatDate(question.nextDate)}</span> </div>
                                      <div className={styles.statusItem} title="復習間隔"> <CalendarIcon size={14} /> <span>{question.interval}</span> </div>
                                      {/* 理解度バッジはクラス名を組み立てて適用 */}
                                      <div className={`${styles.statusItem} ${styles.understandingBadge} ${understandingStyle.bgClass}`} title={`理解度: ${question.understanding}`}>
                                          {React.cloneElement(understandingStyle.icon, { size: 14, className: 'mr-1 flex-shrink-0' })}
                                          <span className={understandingStyle.textClass}> {question.understanding.includes(':') ? question.understanding.split(':')[0] : question.understanding} </span>
                                      </div>
                                      {/* 正解率 */}
                                      <div className={styles.statusItem} title={`正解率: ${question.correctRate}% (${question.answerCount}回)`}>
                                          <div className={styles.rateBarContainer}><div className={styles.rateBar}><div className={`${styles.rateBarInner} ${getCorrectRateColorClass(question.correctRate)}`} style={{ width: `${question.correctRate}%` }}></div></div></div>
                                          <span className={styles.rateText}>{question.correctRate}%</span>
                                      </div>
                                  </div>
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

      {/* 一括編集用カレンダーモーダル */}
      {bulkEditMode && showCalendarModal && (
         <>
             <div className={datePickerStyles.overlay} onClick={() => setShowCalendarModal(false)} />
             <div className={datePickerStyles.modal}>
                <button onClick={() => setShowCalendarModal(false)} className={datePickerStyles.closeButton}> <XIcon size={18} /> </button>
                <div className={datePickerStyles.calendarContainer}>
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={ja} // 日本語化
                        showOutsideDays fixedWeeks
                        captionLayout="dropdown-buttons"
                        fromYear={new Date().getFullYear() - 1}
                        toYear={new Date().getFullYear() + 2}
                        // modifiersStyles prop は react-day-picker v8 では styles prop に変わった可能性
                        // style または className での指定を検討 (DatePickerCalendarModal.module.css で :global 使用)
                        // styles={{ selected: { backgroundColor: '#4f46e5', color: 'white' } }}
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
