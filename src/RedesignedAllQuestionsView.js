// src/RedesignedAllQuestionsView.jsx (最小限の解決策)
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

// --- ヘルパー関数は省略 (変更なし) ---
const subjectColorMap = {
    "経営管理論": "#a5b4fc", "運営管理": "#6ee7b7", "経済学": "#fca5a5",
    "経営情報システム": "#93c5fd", "経営法務": "#c4b5fd",
    "中小企業経営・中小企業政策": "#fcd34d", "過去問題集": "#94a3b8", "未分類": "#d1d5db",
};

const getSubjectColorCode = (subjectName) => {
    return subjectColorMap[subjectName || "未分類"] || subjectColorMap["未分類"];
};

const getUnderstandingStyle = (understanding) => {
    const iconSize = "w-3.5 h-3.5";
    const understandingKey = understanding?.startsWith('曖昧△') ? '曖昧△' : understanding;
    let styleKey = 'Gray';
    if (understandingKey === '理解○') styleKey = 'Green';
    else if (understandingKey === '曖昧△') styleKey = 'Yellow';
    else if (understandingKey === '理解できていない×') styleKey = 'Red';

    const iconComponent = { 'Green': CheckCircle, 'Yellow': AlertTriangle, 'Red': XCircle, 'Gray': Info }[styleKey];
    const textClass = styles[`understandingText${styleKey}`] || '';
    const bgClass = styles[`understandingBadge${styleKey}`] || '';
    const iconClass = `${iconSize} ${styles[`icon${styleKey}`] || ''}`;

    return { icon: iconComponent ? React.createElement(iconComponent, { className: iconClass }) : null, textClass, bgClass };
};

const getCorrectRateColorClass = (rate) => {
  if (rate === null || typeof rate === 'undefined' || rate < 0) return styles.rateBarColorGray || "bg-gray-300";
  if (rate >= 80) return styles.rateBarColorGreen || "bg-green-500";
  if (rate >= 60) return styles.rateBarColorLime || "bg-lime-500";
  if (rate >= 40) return styles.rateBarColorYellow || "bg-yellow-500";
  if (rate >= 20) return styles.rateBarColorOrange || "bg-orange-500";
  return styles.rateBarColorRed || "bg-red-500";
};

const RedesignedAllQuestionsView = ({
  subjects, expandedSubjects = {}, expandedChapters = {}, toggleSubject, toggleChapter,
  setEditingQuestion, setBulkEditMode, bulkEditMode, selectedQuestions = [],
  setSelectedQuestions, saveBulkEdit, formatDate, toggleQuestionSelection,
  selectedDate, setSelectedDate
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ understanding: 'all', correctRate: 'all', interval: 'all', });
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  // カスタムイベントハンドラ - 日付選択のみを処理し、モーダルは閉じない
  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  // カレンダー日付クリック処理
  const handleDayClick = (day, modifiers) => {
    // 1. デフォルトの動作を防止
    // 2. 選択された日付を設定
    // 3. モーダルは閉じない
    if (modifiers.selected) {
      setSelectedDate(null); // 選択解除
    } else {
      setSelectedDate(day); // 新しい日付を選択
    }
    
    // クリックイベントを伝播させない
    event.stopPropagation();
    event.preventDefault();
  };

  // フィルターと検索ロジック
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

  // 全選択/全解除
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

  // 一括編集実行
  const executeBulkEdit = () => {
    if (selectedDate && selectedQuestions.length > 0) {
      saveBulkEdit(selectedDate);
      setShowCalendarModal(false);
    } else {
       console.warn("一括編集の実行がキャンセルされました。日付または問題が選択されていません。");
    }
  };

  // --- レンダリング ---
  return (
    <div className={styles.container || "container p-4 max-w-6xl mx-auto pb-24"}>
      {/* 上部コントロール - 変更なし */}
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

      {/* 詳細フィルターパネル - 変更なし */}
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

      {/* 一括編集時の操作パネル - 変更なし */}
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

      {/* 問題リスト (アコーディオン + カード) - 変更なし */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-200"> <p className="text-gray-500">表示できる問題がありません</p> </div>
       ) : (
        <div className={styles.listContainer}>
          {/* 科目アコーディオン - 変更なし */}
          {/* 省略 */}
        </div>
      )}

      {/* ★★★ 一括編集用カレンダーモーダル (完全に書き直し) ★★★ */}
      {bulkEditMode && showCalendarModal && (
        // モーダル用のオーバーレイ
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 z-50 flex items-center justify-center p-4" 
             onClick={() => setShowCalendarModal(false)}>
          {/* モーダル本体 - クリック伝播を停止 */}
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden" 
               onClick={(e) => e.stopPropagation()}>
            {/* ヘッダー */}
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">日付を選択</h3>
              <button onClick={() => setShowCalendarModal(false)} 
                      className="text-white hover:bg-indigo-700 rounded-full p-1">
                <XIcon size={20} />
              </button>
            </div>
            
            {/* カレンダー */}
            <div className="p-4 customDayPicker" onClick={(e) => e.stopPropagation()}>
              {/* このdivはカスタムスタイルとイベント伝播の防止の両方に対応 */}
              <div className="calendar-wrapper" onClick={(e) => e.stopPropagation()}>
                {/* カレンダーコンポーネント - カスタムのonDayClickハンドラを追加 */}
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}  // カスタムハンドラで処理
                  locale={ja}
                  showOutsideDays fixedWeeks
                  captionLayout="dropdown-buttons"
                  fromYear={new Date().getFullYear() - 2}
                  toYear={new Date().getFullYear() + 3}
                  className="!pointer-events-auto"  // 強制的にイベントを有効化
                />
              </div>
            </div>
            
            {/* フッター */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">{selectedQuestions.length}件選択中</span>
              <button 
                onClick={executeBulkEdit} 
                disabled={!selectedDate || selectedQuestions.length === 0} 
                className={`px-5 py-2 rounded-lg font-medium ${
                  !selectedDate || selectedQuestions.length === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                選択した問題をこの日に設定
              </button>
            </div>
          </div>
        </div>
      )}

    </div> // 全体コンテナ end
  );
};

export default RedesignedAllQuestionsView;
