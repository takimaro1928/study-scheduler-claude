// src/RedesignedAllQuestionsView.jsx
import React, { useState } from 'react';
import {
  Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info,
  ChevronRight, ChevronDown, ChevronUp, X as XIcon // XIconを追加
} from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar'; // BulkEdit用

// 科目色定義 (ScheduleViewと共通化推奨)
const subjectColorMap = {
    "経営管理論": "border-indigo-400",
    "運営管理": "border-emerald-400",
    "経済学": "border-red-400",
    "経営情報システム": "border-blue-400",
    "経営法務": "border-purple-400",
    "中小企業経営・中小企業政策": "border-amber-400",
    "過去問題集": "border-slate-400",
    "未分類": "border-gray-400",
};
const getSubjectColorClass = (subjectName) => {
    return subjectColorMap[subjectName || "未分類"] || subjectColorMap["未分類"];
};

// 理解度スタイル取得関数 (App.jsから移動 or 共通化推奨)
const getUnderstandingStyle = (understanding) => {
  const iconSize = "w-4 h-4"; // アイコンサイズ統一
  if (understanding === '理解○') {
    return { icon: <CheckCircle className={`${iconSize} text-green-600`} />, textClass: 'text-green-700', bgClass: 'bg-green-50' };
  } else if (understanding.startsWith('曖昧△')) {
    return { icon: <AlertTriangle className={`${iconSize} text-yellow-600`} />, textClass: 'text-yellow-700', bgClass: 'bg-yellow-50' };
  } else if (understanding === '理解できていない×') {
    return { icon: <XCircle className={`${iconSize} text-red-600`} />, textClass: 'text-red-700', bgClass: 'bg-red-50' };
  } else { // 未解答など
    return { icon: <Info className={`${iconSize} text-gray-500`} />, textClass: 'text-gray-600', bgClass: 'bg-gray-50' };
  }
};

// 正解率バーの色取得関数 (App.jsから移動 or 共通化推奨)
const getCorrectRateColor = (rate) => {
  if (rate >= 80) return "bg-green-500";
  if (rate >= 60) return "bg-lime-500";
  if (rate >= 40) return "bg-yellow-500";
  if (rate >= 20) return "bg-orange-500";
  return "bg-red-500";
};


const RedesignedAllQuestionsView = ({
  subjects,
  expandedSubjects,
  expandedChapters,
  toggleSubject,
  toggleChapter,
  setEditingQuestion, // Modalを開くための関数
  setBulkEditMode,
  bulkEditMode,
  selectedQuestions,
  setSelectedQuestions, // App.jsから渡すように変更
  saveBulkEdit,
  formatDate,            // App.jsから渡す
  toggleQuestionSelection // App.jsから渡す
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    understanding: 'all',
    correctRate: 'all',
    interval: 'all',
  });
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [bulkEditSelectedDate, setBulkEditSelectedDate] = useState(new Date()); // 一括編集用日付state

  // フィルターと検索ロジック (少し効率化)
  const filteredSubjects = useMemo(() => {
    return subjects.map(subject => {
      const chaptersWithFilteredQuestions = subject.chapters.map(chapter => {
        const filteredQuestions = chapter.questions.filter(question => {
          // Search Term Filter
          if (searchTerm && !question.id.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
          // Detailed Filters
          // Understanding
          if (filters.understanding !== 'all' && !question.understanding?.startsWith(filters.understanding)) {
             return false;
          }
          // Correct Rate
          const rate = question.correctRate ?? -1; // null/undefinedを-1扱い
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
      }).filter(chapter => chapter.questions.length > 0); // フィルター後、問題が残っている章のみ

      return { ...subject, chapters: chaptersWithFilteredQuestions };
    }).filter(subject => subject.chapters.length > 0); // フィルター後、章が残っている科目のみ
  }, [subjects, searchTerm, filters]);


  // 全選択/全解除
  const toggleSelectAllForSubject = (subject) => {
    const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions.map(q => q.id));
    const allCurrentlySelected = allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));

    if (allCurrentlySelected) {
      setSelectedQuestions(prev => prev.filter(id => !allQuestionIdsInSubject.includes(id)));
    } else {
      setSelectedQuestions(prev => [...new Set([...prev, ...allQuestionIdsInSubject])]);
    }
  };

  // --- レンダリング ---
  return (
    <div className="p-4 max-w-6xl mx-auto pb-24"> {/* max-width調整 */}
      {/* 上部コントロール */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 items-center">
        {/* 検索 */}
        <div className="relative flex-grow w-full md:max-w-xs">
           <input
             type="text" placeholder="問題IDで検索..."
             className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
             value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><Search size={18}/></div>
            {searchTerm && (
             <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"> <XIcon size={18} /> </button>
           )}
         </div>
         {/* フィルターボタン */}
        <button onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 flex items-center shadow-sm text-gray-700 font-medium text-sm w-full justify-center md:w-auto">
            <Filter size={16} className="mr-2" /> フィルター {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
        </button>
        {/* 一括編集ボタン */}
        <button onClick={() => setBulkEditMode(!bulkEditMode)}
                 className={`px-4 py-2 rounded-lg flex items-center shadow-sm font-medium text-sm w-full justify-center md:w-auto transition-colors ${
                     bulkEditMode ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                 }`}>
             {bulkEditMode ? '選択終了' : '一括編集'}
        </button>
      </div>

      {/* 詳細フィルターパネル */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 animate-fadeIn">
          {/* ... フィルターのセレクトボックス ... */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
               <label className="block text-xs font-medium text-gray-600 mb-1">理解度</label>
               <select className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       value={filters.understanding} onChange={(e) => setFilters({...filters, understanding: e.target.value})}>
                 <option value="all">すべて</option>
                 <option value="理解○">理解○</option>
                 <option value="曖昧△">曖昧△</option>
                 <option value="理解できていない×">理解できていない×</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-600 mb-1">正解率</label>
               <select className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       value={filters.correctRate} onChange={(e) => setFilters({...filters, correctRate: e.target.value})}>
                 <option value="all">すべて</option>
                 <option value="high">高い (80%↑)</option>
                 <option value="medium">中間 (50-79%)</option>
                 <option value="low">低い (↓50%)</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-600 mb-1">復習間隔</label>
               <select className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                       value={filters.interval} onChange={(e) => setFilters({...filters, interval: e.target.value})}>
                 <option value="all">すべて</option>
                 <option value="1日">1日</option> <option value="3日">3日</option> <option value="7日">7日</option>
                 <option value="14日">14日</option> <option value="1ヶ月">1ヶ月</option> <option value="2ヶ月">2ヶ月</option>
                 <option value="8日">8日(曖昧)</option> {/* 曖昧用も追加 */}
               </select>
             </div>
           </div>
            <div className="mt-4 flex justify-end">
             <button onClick={() => setFilters({ understanding: 'all', correctRate: 'all', interval: 'all' })}
                     className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-xs font-medium">
               リセット
             </button>
           </div>
        </div>
      )}

       {/* 一括編集時の操作パネル */}
       {bulkEditMode && (
          <div className="bg-indigo-50 p-3 sm:p-4 mb-4 rounded-lg border border-indigo-200 shadow-sm animate-fadeIn flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-indigo-800 font-medium text-sm">
               {selectedQuestions.length} 件の問題を選択中
            </p>
            <button onClick={() => setShowCalendarModal(true)}
                    disabled={selectedQuestions.length === 0}
                    className={`px-4 py-2 rounded-md font-medium shadow-sm flex items-center text-sm ${
                        selectedQuestions.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}>
                <CalendarIcon size={16} className="mr-2" />
                日付を一括設定
            </button>
          </div>
       )}


      {/* 問題リスト (アコーディオン + カード) */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-200">
          <p className="text-gray-500">表示できる問題がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubjects.map(subject => {
            const subjectColorClass = getSubjectColorClass(subject.name);
            const allQuestionIdsInSubject = subject.chapters.flatMap(ch => ch.questions.map(q => q.id));
            const isAllSelectedInSubject = allQuestionIdsInSubject.length > 0 && allQuestionIdsInSubject.every(id => selectedQuestions.includes(id));

            return (
              <div key={subject.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* 科目ヘッダー */}
                <div className={`flex items-center p-3 cursor-pointer border-l-4 ${subjectColorClass} bg-gray-50 border-b border-gray-200`}
                     onClick={() => toggleSubject(subject.id)}>
                    {/* 一括編集チェックボックス（科目単位） */}
                    {bulkEditMode && (
                        <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-3 ml-1"
                               checked={isAllSelectedInSubject}
                               onChange={() => toggleSelectAllForSubject(subject)}
                               onClick={(e) => e.stopPropagation()} // ヘッダーのクリックイベントを伝播させない
                        />
                    )}
                   <div className="mr-2 text-gray-400 transition-transform duration-200"
                        style={{ transform: expandedSubjects[subject.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                     <ChevronRight size={18} />
                   </div>
                   <h3 className="font-semibold text-gray-700 text-sm sm:text-base flex-grow">{subject.name}</h3>
                   <div className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                     {subject.chapters.reduce((sum, c) => sum + c.questions.length, 0)}問
                   </div>
                </div>

                {/* 科目の中身 (展開時) */}
                {expandedSubjects[subject.id] && (
                  <div className="border-t border-gray-200"> {/* 上に線を追加 */}
                    {subject.chapters.map(chapter => (
                      <div key={chapter.id} className="border-b border-gray-100 last:border-b-0">
                        {/* 章ヘッダー */}
                        <div className="flex items-center p-3 pl-6 sm:pl-8 cursor-pointer hover:bg-gray-50 transition-colors"
                             onClick={() => toggleChapter(chapter.id)}>
                           <div className="mr-2 text-gray-400 transition-transform duration-200"
                                style={{ transform: expandedChapters[chapter.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                             <ChevronRight size={16} />
                           </div>
                           <h4 className="text-gray-600 font-medium text-sm flex-grow">{chapter.name}</h4>
                           <div className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                             {chapter.questions.length}問
                           </div>
                        </div>

                        {/* 章の中の問題カードリスト (展開時) */}
                        {expandedChapters[chapter.id] && (
                          <div className="px-4 py-3 sm:px-6 sm:py-4 space-y-3 bg-gray-50/50">
                            {chapter.questions.map(question => {
                              const understandingStyle = getUnderstandingStyle(question.understanding);
                              const colorClass = getSubjectColorClass(subject.name); // 科目色を取得

                              return (
                                // 問題カード
                                <div key={question.id} className={`bg-white rounded-md shadow-sm border border-gray-200 flex items-center p-3 gap-3 border-l-4 ${colorClass}`}>
                                  {/* チェックボックス (一括編集モード時) */}
                                  {bulkEditMode && (
                                    <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded flex-shrink-0"
                                           checked={selectedQuestions.includes(question.id)}
                                           onChange={() => toggleQuestionSelection(question.id)} />
                                  )}
                                  {/* 問題ID */}
                                  <div className="font-medium text-sm text-gray-700 flex-shrink-0 w-20 sm:w-24 whitespace-nowrap overflow-hidden text-ellipsis" title={question.id}>
                                      {question.id}
                                  </div>
                                  {/* ステータス情報 (Gridでレイアウト) */}
                                  <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-xs">
                                      {/* 次回予定日 */}
                                      <div className="flex items-center text-gray-600" title="次回予定日">
                                          <Clock size={14} className="mr-1 text-gray-400 flex-shrink-0"/>
                                          <span>{formatDate(question.nextDate)}</span>
                                      </div>
                                      {/* 間隔 */}
                                      <div className="flex items-center text-gray-600" title="復習間隔">
                                          <CalendarIcon size={14} className="mr-1 text-gray-400 flex-shrink-0"/>
                                          <span>{question.interval}</span>
                                      </div>
                                      {/* 理解度 */}
                                      <div className={`flex items-center rounded-full px-1.5 py-0.5 ${understandingStyle.bgClass} ${understandingStyle.textClass}`} title={`理解度: ${question.understanding}`}>
                                          {React.cloneElement(understandingStyle.icon, { size: 14, className: 'mr-1 flex-shrink-0' })}
                                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                             {question.understanding.includes(':') ? question.understanding.split(':')[0] : question.understanding}
                                          </span>
                                      </div>
                                      {/* 正解率 */}
                                      <div className="flex items-center text-gray-600" title={`正解率: ${question.correctRate}% (${question.answerCount}回)`}>
                                          <div className="w-10 sm:w-12 h-1.5 bg-gray-200 rounded-full mr-1 flex-shrink-0">
                                              <div className={`h-full rounded-full ${getCorrectRateColor(question.correctRate)}`}
                                                   style={{ width: `${question.correctRate}%` }}>
                                              </div>
                                          </div>
                                          <span>{question.correctRate}%</span>
                                      </div>
                                  </div>
                                  {/* 編集ボタン */}
                                  <button onClick={() => setEditingQuestion(question)}
                                          className="ml-2 p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0" title="編集">
                                      <Edit size={16}/>
                                  </button>
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
            <div className="fixed inset-0 z-40" onClick={() => setShowCalendarModal(false)} />
             <div className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-300"
                 style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'auto', minWidth: '320px', maxWidth: '90vw' }}>
                <button onClick={() => setShowCalendarModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 z-10"> <XIcon size={18} /> </button>
                {/* DatePickerCalendar は別途インポート・実装が必要 */}
                <DatePickerCalendar
                    selectedDate={bulkEditSelectedDate}
                    onChange={setBulkEditSelectedDate} // 日付選択でstateを更新
                />
                 <div className="flex justify-between items-center p-3 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm text-gray-600">{selectedQuestions.length}件選択中</span>
                    <button onClick={executeBulkEdit} disabled={!bulkEditSelectedDate || selectedQuestions.length === 0}
                            className={`px-4 py-2 rounded-md font-medium text-sm ${!bulkEditSelectedDate || selectedQuestions.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        選択した問題をこの日に設定
                    </button>
                 </div>
             </div>
         </>
       )}

      {/* 通知 (必要なら別途実装) */}
      {/* {notification && (...)} */}
    </div> // 全体コンテナ end
  );
};

export default RedesignedAllQuestionsView;
