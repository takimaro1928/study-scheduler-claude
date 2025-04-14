// src/RedesignedAllQuestionsView.js
// 【完全版・省略なし】一括編集パネルUI変更、項目別設定ボタン追加

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info,
  ChevronRight, ChevronDown, ChevronUp, X as XIcon, Hash, Check, RefreshCw 
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ja } from 'date-fns/locale';
import styles from './RedesignedAllQuestionsView.module.css'; // CSS Modulesをインポート
import datePickerStyles from './DatePickerCalendarModal.module.css'; // 日付ピッカーモーダル用

// --- ヘルパー関数 (変更なし) ---
const subjectColorMap = { /* ... */ };
const getSubjectColorCode = (subjectName) => { /* ... */ };
const getUnderstandingStyle = (understanding) => { /* ... */ };
const getCorrectRateColorClass = (rate) => { /* ... */ };
// --- ここまで ヘルパー関数 (内容は以前の完全版と同じはず) ---
// (念のため、これらの関数の完全なコードが必要な場合は再度お申し付けください)

// --- 新しいヘルパー関数: 曖昧理由リスト ---
const ambiguousReasons = [
  '偶然正解した', '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった', '合っていたが、別の理由を思い浮かべていた',
  '自信はなかったけど、これかなとは思っていた', '問題を覚えてしまっていた', 'その他'
];


const RedesignedAllQuestionsView = ({
  subjects, expandedSubjects = {}, expandedChapters = {}, toggleSubject, toggleChapter,
  setEditingQuestion, setBulkEditMode, bulkEditMode, selectedQuestions = [],
  setSelectedQuestions,
  // saveBulkEdit, // 古い関数は使わない
  saveBulkEditItems, // ★ App.jsから新しい一括編集関数を受け取る
  formatDate, toggleQuestionSelection,
  // selectedDate, setSelectedDate // 日付選択はコンポーネント内で管理
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ understanding: 'all', correctRate: 'all', interval: 'all', });

  // ★★★ 一括編集用のStateを追加 ★★★
  const [bulkNextDate, setBulkNextDate] = useState(null);
  const [bulkLastAnswered, setBulkLastAnswered] = useState(null);
  const [bulkAnswerCount, setBulkAnswerCount] = useState(''); // 文字列で管理し、保存時に数値変換
  const [bulkInterval, setBulkInterval] = useState('1日'); // デフォルト値
  const [bulkUnderstanding, setBulkUnderstanding] = useState('理解○'); // デフォルト値
  const [isBulkAmbiguousReasonOpen, setIsBulkAmbiguousReasonOpen] = useState(false);
  const [bulkAmbiguousReason, setBulkAmbiguousReason] = useState(ambiguousReasons[0]); // デフォルト理由

  // ★ 日付ピッカーモーダル管理用のState
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState(null); // 'nextDate' or 'lastAnswered'
  const datePickerRef = useRef(null);

  // フィルターと検索ロジック (変更なし)
  const filteredSubjects = useMemo(() => {
     if (!Array.isArray(subjects)) return [];
    return subjects.map(subject => {
       if (!subject || !Array.isArray(subject.chapters)) return { ...subject, chapters: [] };
      const chaptersWithFilteredQuestions = subject.chapters.map(chapter => {
         if (!chapter || !Array.isArray(chapter.questions)) return { ...chapter, questions: [] };
        const filteredQuestions = chapter.questions.filter(question => {
          if (typeof question !== 'object' || question === null || !question.id) return false;
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
      }).filter(chapter => chapter && chapter.questions.length > 0);
      return { ...subject, chapters: chaptersWithFilteredQuestions };
    }).filter(subject => subject && subject.chapters.length > 0);
  }, [subjects, searchTerm, filters]);

  // 全選択/全解除 (変更なし)
  const toggleSelectAllForSubject = (subject) => {
     if (!subject || !Array.isArray(subject.chapters)) return;
     const allQuestionIdsInSubject = subject.chapters?.flatMap(ch => ch.questions?.map(q => q.id) || []) || [];
     if(allQuestionIdsInSubject.length === 0) return;
     const allCurrentlySelected = allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));
     if (allCurrentlySelected) {
       setSelectedQuestions(prev => prev.filter(id => !allQuestionIdsInSubject.includes(id)));
     } else {
       setSelectedQuestions(prev => [...new Set([...prev, ...allQuestionIdsInSubject])]);
     }
  };

  // --- ★★★ 一括編集実行ハンドラ ★★★ ---
  const handleBulkEdit = (field, value) => {
    if (selectedQuestions.length === 0) {
        alert('一括編集する問題を選択してください。');
        return;
    }

    let itemsToUpdate = {};
    let confirmed = false;

    if (field === 'nextDate' || field === 'lastAnswered') {
        if (!value) { alert('日付を選択してください。'); return; }
        // DateオブジェクトをISO文字列に変換して渡す
        itemsToUpdate[field] = value.toISOString();
        confirmed = true; // 日付は選択されたら即時反映
    } else if (field === 'answerCount') {
        const count = parseInt(value, 10);
        if (isNaN(count) || count < 0) { alert('解答回数には0以上の半角数字を入力してください。'); return; }
        itemsToUpdate[field] = count;
        confirmed = true;
    } else if (field === 'interval') {
        itemsToUpdate[field] = value;
        confirmed = true;
    } else if (field === 'understanding') {
        // 理解度の場合は、現在の bulkUnderstanding State を使う
        const understandingValue = bulkUnderstanding === '曖昧△'
            ? `曖昧△:${bulkAmbiguousReason}` // 理由を付加
            : bulkUnderstanding; // 理解○
        itemsToUpdate[field] = understandingValue;
        confirmed = true;
         // 曖昧理由リストを閉じる
        setIsBulkAmbiguousReasonOpen(false);
    }

    if (confirmed && Object.keys(itemsToUpdate).length > 0) {
      console.log("Calling saveBulkEditItems with:", itemsToUpdate);
      saveBulkEditItems(itemsToUpdate); // App.js の関数を呼び出し
      // 成功したら入力値をリセット（任意）
      // if (field === 'nextDate') setBulkNextDate(null);
      // if (field === 'lastAnswered') setBulkLastAnswered(null);
      // if (field === 'answerCount') setBulkAnswerCount('');
    }
  };
  // --- ここまで一括編集ハンドラ ---

  // --- 日付ピッカー関連 ---
  const openDatePicker = (target) => {
    setDatePickerTarget(target);
    setIsDatePickerOpen(true);
  };

  const handleDateSelect = (date) => {
    if (date && datePickerTarget) {
      if (datePickerTarget === 'nextDate') {
        setBulkNextDate(date);
      } else if (datePickerTarget === 'lastAnswered') {
        setBulkLastAnswered(date);
      }
    }
    setIsDatePickerOpen(false);
    setDatePickerTarget(null);
  };

  // モーダル外クリック検出用のイベントハンドラ
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
        setDatePickerTarget(null);
      }
    }
    if (isDatePickerOpen) { document.addEventListener('mousedown', handleClickOutside); }
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [isDatePickerOpen]);
  // --- ここまで日付ピッカー関連 ---

  // --- 理解度一括設定関連 ---
   const handleBulkUnderstandingChange = (value) => {
       setBulkUnderstanding(value);
       if (value === '理解○') {
           setIsBulkAmbiguousReasonOpen(false);
       } else {
           // 曖昧ボタンクリックでリスト開閉
           setIsBulkAmbiguousReasonOpen(prev => !prev);
       }
   };
   const handleBulkReasonSelect = (reason) => {
       setBulkAmbiguousReason(reason);
       setIsBulkAmbiguousReasonOpen(false);
       // 理解度ステートも '曖昧△' にする（もし理解○が選択されていた場合のため）
       setBulkUnderstanding('曖昧△');
   };
  // --- ここまで理解度一括設定関連 ---


  // --- レンダリング ---
  return (
    <div className={styles.container}>
      {/* 上部コントロール (変更なし) */}
      <div className={styles.controlsContainer}>
          <div className={styles.searchBox}>
            <input type="text" placeholder="問題IDで検索..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <div className={styles.searchIcon}><Search size={18}/></div>
            {searchTerm && ( <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton}> <XIcon size={18} /> </button> )}
          </div>
          <div className={styles.controlButtons}>
            <button onClick={() => setShowFilters(!showFilters)} className={styles.controlButton}>
              <Filter size={16} className="mr-2" /> フィルター {showFilters ? <ChevronUp size={16} style={{marginLeft: '4px'}} /> : <ChevronDown size={16} style={{marginLeft: '4px'}} />}
            </button>
            <button onClick={() => setBulkEditMode(!bulkEditMode)} className={`${styles.controlButton} ${ bulkEditMode ? styles.bulkEditButtonActive : styles.bulkEditButtonInactive }`}>
              {bulkEditMode ? '選択終了' : '一括編集'}
            </button>
          </div>
      </div>

      {/* 詳細フィルターパネル (変更なし) */}
      {showFilters && ( /* ... */ )}

      {/* ★★★ 一括編集パネル UI 大幅変更 ★★★ */}
      {bulkEditMode && (
        <div className={styles.bulkEditPanel}>
          <p className={styles.bulkPanelTitle}>一括編集 ({selectedQuestions.length}件選択中)</p>
          <div className={styles.bulkEditGrid}>

            {/* --- 次回解答日 設定 --- */}
            <div className={styles.bulkEditItem}>
              <label className={styles.bulkEditLabel}>次回解答日</label>
              <div className={styles.bulkEditInputGroup}>
                <input
                  type="text"
                  readOnly
                  value={bulkNextDate ? formatDate(bulkNextDate) : '日付未選択'}
                  onClick={() => openDatePicker('nextDate')}
                  className={styles.bulkDateInput}
                  placeholder="日付を選択"
                />
                <button onClick={() => openDatePicker('nextDate')} className={styles.bulkCalendarButton}>
                  <CalendarIcon size={16} />
                </button>
                <button
                  onClick={() => handleBulkEdit('nextDate', bulkNextDate)}
                  disabled={!bulkNextDate || selectedQuestions.length === 0}
                  className={styles.bulkSetButton}
                >
                  設定
                </button>
              </div>
            </div>

            {/* --- 最終解答日 設定 --- */}
            <div className={styles.bulkEditItem}>
              <label className={styles.bulkEditLabel}>最終解答日</label>
              <div className={styles.bulkEditInputGroup}>
                <input
                  type="text"
                  readOnly
                  value={bulkLastAnswered ? formatDate(bulkLastAnswered) : '日付未選択'}
                  onClick={() => openDatePicker('lastAnswered')}
                  className={styles.bulkDateInput}
                  placeholder="日付を選択"
                />
                <button onClick={() => openDatePicker('lastAnswered')} className={styles.bulkCalendarButton}>
                  <CalendarIcon size={16} />
                </button>
                <button
                  onClick={() => handleBulkEdit('lastAnswered', bulkLastAnswered)}
                  disabled={!bulkLastAnswered || selectedQuestions.length === 0}
                  className={styles.bulkSetButton}
                >
                  設定
                </button>
              </div>
            </div>

            {/* --- 解答回数 設定 --- */}
            <div className={styles.bulkEditItem}>
              <label className={styles.bulkEditLabel}>解答回数</label>
              <div className={styles.bulkEditInputGroup}>
                 <input
                   type="number"
                   min="0"
                   value={bulkAnswerCount}
                   onChange={(e) => setBulkAnswerCount(e.target.value)}
                   placeholder="回数"
                   className={styles.bulkNumberInput}
                 />
                <button
                  onClick={() => handleBulkEdit('answerCount', bulkAnswerCount)}
                  disabled={bulkAnswerCount === '' || selectedQuestions.length === 0}
                  className={styles.bulkSetButton}
                >
                  設定
                </button>
              </div>
            </div>

            {/* --- 復習間隔 設定 --- */}
            <div className={styles.bulkEditItem}>
              <label className={styles.bulkEditLabel}>復習間隔</label>
              <div className={styles.bulkEditInputGroup}>
                <select
                  value={bulkInterval}
                  onChange={(e) => setBulkInterval(e.target.value)}
                  className={styles.bulkSelectInput}
                >
                  <option value="1日">1日</option>
                  <option value="3日">3日</option>
                  <option value="7日">7日</option>
                  <option value="8日">8日 (曖昧)</option>
                  <option value="14日">14日</option>
                  <option value="1ヶ月">1ヶ月</option>
                  <option value="2ヶ月">2ヶ月</option>
                </select>
                <button
                  onClick={() => handleBulkEdit('interval', bulkInterval)}
                  disabled={selectedQuestions.length === 0}
                  className={styles.bulkSetButton}
                >
                  設定
                </button>
              </div>
            </div>

             {/* --- 理解度 設定 --- */}
             <div className={styles.bulkEditItem}>
               <label className={styles.bulkEditLabel}>理解度</label>
               <div className={styles.bulkEditInputGroup}>
                 {/* 理解度選択ボタン */}
                 <div className={styles.bulkUnderstandingButtons}>
                    <button
                        type="button"
                        onClick={() => handleBulkUnderstandingChange('理解○')}
                        className={`${styles.bulkUndButton} ${bulkUnderstanding === '理解○' ? styles.bulkUndButtonActiveGreen : ''}`}
                    >
                        <Check size={14}/> 理解○
                    </button>
                     <div style={{ position: 'relative' }}> {/* ドロップダウン用 */}
                         <button
                           type="button"
                           onClick={() => handleBulkUnderstandingChange('曖昧△')}
                           className={`${styles.bulkUndButton} ${bulkUnderstanding === '曖昧△' ? styles.bulkUndButtonActiveAmber : ''}`}
                         >
                           <AlertTriangle size={14}/> 曖昧△
                           <ChevronDown size={14} className={`${styles.bulkChevron} ${isBulkAmbiguousReasonOpen ? styles.bulkChevronOpen : ''}`} />
                         </button>
                         {/* 曖昧理由ドロップダウン */}
                         {isBulkAmbiguousReasonOpen && (
                             <div className={styles.bulkReasonDropdown}>
                                 {ambiguousReasons.map(reason => (
                                     <button
                                         key={reason}
                                         type="button"
                                         onClick={() => handleBulkReasonSelect(reason)}
                                         className={styles.bulkReasonItem}
                                     >
                                         {reason}
                                     </button>
                                 ))}
                             </div>
                         )}
                     </div>
                 </div>
                 {/* 設定ボタン */}
                 <button
                   onClick={() => handleBulkEdit('understanding', bulkUnderstanding)} // 値はStateから取る
                   disabled={selectedQuestions.length === 0}
                   className={styles.bulkSetButton}
                 >
                   設定
                 </button>
               </div>
               {/* 選択中理由表示 (曖昧選択時) */}
               {bulkUnderstanding === '曖昧△' && (
                   <div className={styles.bulkSelectedReason}>
                       理由: {bulkAmbiguousReason}
                   </div>
               )}
             </div>

          </div> {/* bulkEditGrid */}
        </div> // bulkEditPanel
      )}
      {/* ★★★ ここまで一括編集パネル ★★★ */}


      {/* 問題リスト (アコーディオン + カード) (変更なし) */}
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
                                  <div className={styles.questionId} title={question.id}> {question.id} </div>
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
              </div>
            );
          })}
        </div>
      )}

      {/* --- 日付選択モーダル --- */}
      {isDatePickerOpen && (
          <div className={datePickerStyles.overlay}>
            <div ref={datePickerRef} className={datePickerStyles.modal}>
               <button
                   onClick={() => { setIsDatePickerOpen(false); setDatePickerTarget(null); }}
                   className={datePickerStyles.closeButton}
               >
                   <XIcon size={18} />
               </button>
               <div className={datePickerStyles.calendarContainer}>
                   <DayPicker
                       mode="single"
                       required
                       selected={datePickerTarget === 'nextDate' ? bulkNextDate : bulkLastAnswered}
                       onSelect={handleDateSelect}
                       locale={ja}
                       showOutsideDays
                       fixedWeeks
                       captionLayout="dropdown-buttons"
                       fromYear={new Date().getFullYear() - 5} // 選択範囲を調整
                       toYear={new Date().getFullYear() + 5}
                   />
               </div>
               {/* フッターは不要なら削除 */}
            </div>
          </div>
      )}

    </div> // container end
  );
};

export default RedesignedAllQuestionsView;

// --- 省略したヘルパー関数 (参考) ---
/*
const subjectColorMap = { ... };
const getSubjectColorCode = (subjectName) => { ... };
const getUnderstandingStyle = (understanding) => { ... };
const getCorrectRateColorClass = (rate) => { ... };
*/
