// RedesignedAllQuestionsView.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, Info, Edit, Clock, Calendar, Check, X,
  ChevronRight, ChevronDown, ChevronUp, AlertTriangle,
  CheckCircle, XCircle
} from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar';

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
  selectedDate,
  setSelectedDate,
  saveBulkEdit
}) => {
  // 状態管理
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    understanding: 'all',
    correctRate: 'all',
    interval: 'all',
  });
  
  // 展開状態の管理
  const [expandedDetails, setExpandedDetails] = useState({});
  const [editingInlineQuestions, setEditingInlineQuestions] = useState({});
  
  // インライン編集用の一時データ
  const [editFormData, setEditFormData] = useState({});
  
  // カレンダーモーダル
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  // 通知
  const [notification, setNotification] = useState(null);

  // 共通のアイコンスタイルを定義
  const iconStyle = "w-5 h-5"; // すべてのアイコンに適用する基本サイズ
  
  // 表示タブの状態
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'week', 'month'
  
  // 日付によるフィルター関数
  const getFilteredData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);
    
    let filteredSubjects = [...subjects];
    
    if (activeTab !== 'all') {
      filteredSubjects = subjects.map(subject => {
        const filteredChapters = subject.chapters.map(chapter => {
          const filteredQuestions = chapter.questions.filter(question => {
            const nextDate = new Date(question.nextDate);
            nextDate.setHours(0, 0, 0, 0);
            
            if (activeTab === 'today') {
              return nextDate.getTime() === today.getTime();
            } else if (activeTab === 'week') {
              return nextDate >= today && nextDate <= oneWeekLater;
            } else if (activeTab === 'month') {
              return nextDate >= today && nextDate <= oneMonthLater;
            }
            return true;
          });
          
          return { ...chapter, questions: filteredQuestions };
        }).filter(chapter => chapter.questions.length > 0);
        
        return { ...subject, chapters: filteredChapters };
      }).filter(subject => subject.chapters.length > 0);
    }
    
    return filteredSubjects;
  };

  // 詳細フィルターを適用する
  const applyDetailedFilters = (questions) => {
    return questions.filter(question => {
      // 理解度フィルター
      if (filters.understanding !== 'all' && 
          !question.understanding.startsWith(filters.understanding)) {
        return false;
      }
      
      // 正解率フィルター
      if (filters.correctRate !== 'all') {
        if (filters.correctRate === 'high' && question.correctRate < 80) {
          return false;
        } else if (filters.correctRate === 'medium' && 
                 (question.correctRate < 50 || question.correctRate >= 80)) {
          return false;
        } else if (filters.correctRate === 'low' && question.correctRate >= 50) {
          return false;
        }
      }
      
      // 間隔フィルター
      if (filters.interval !== 'all' && question.interval !== filters.interval) {
        return false;
      }
      
      return true;
    });
  };

  // 検索フィルタリングを適用
  const filteredSubjects = getFilteredData().filter(subject => {
    return subject.chapters.some(chapter => 
      chapter.questions.some(question => 
        searchTerm === '' || question.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  // 問題を選択/選択解除
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // 問題の詳細を展開/折りたたみ
  const toggleDetails = (questionId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    
    // 編集中の場合は編集モードを解除
    if (editingInlineQuestions[questionId]) {
      setEditingInlineQuestions(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
  };
  
  // インライン編集を開始/終了
  const toggleInlineEdit = (question) => {
    const questionId = question.id;
    
    // 編集開始時にフォームデータを初期化
    if (!editingInlineQuestions[questionId]) {
      setEditFormData({
        ...editFormData,
        [questionId]: {
          ...question,
          nextDateStr: formatDateForInput(question.nextDate)
        }
      });
    }
    
    setEditingInlineQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    
    // 詳細が展開されていなければ展開する
    if (!expandedDetails[questionId]) {
      setExpandedDetails(prev => ({
        ...prev,
        [questionId]: true
      }));
    }
  };
  
  // インライン編集内容を保存
  const saveInlineEdit = (questionId) => {
    // 実際の保存処理（親コンポーネントのメソッドを呼び出す）
    // saveQuestionEdit(editFormData[questionId]);
    console.log("Save inline edit:", editFormData[questionId]);
    
    // 編集モードを終了
    setEditingInlineQuestions(prev => ({
      ...prev,
      [questionId]: false
    }));
    
    // 成功通知を表示
    showNotification("問題情報を更新しました");
  };
  
  // インライン編集をキャンセル
  const cancelInlineEdit = (questionId) => {
    setEditingInlineQuestions(prev => ({
      ...prev,
      [questionId]: false
    }));
  };
  
  // インライン編集フォームの値を更新
  const updateFormValue = (questionId, field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };
  
// 一括編集用のカレンダーモーダルを表示
const showBulkEditCalendar = () => {
  setShowCalendarModal(true);
};

// 日付選択処理を独立した関数として定義 - 絶対に閉じないバージョン
const handleDateSelection = (date) => {
  // デバッグ用ログ
  console.log("日付選択:", date);
  
  // 日付のみ更新して、モーダルは閉じない
  setSelectedDate(date);
  
  // モーダルが閉じないよう、ここでは他の処理は行わない
};
  
  // 一括編集を実行
  const executeBulkEdit = () => {
    if (selectedDate && selectedQuestions.length > 0) {
      // デバッグ用ログ
      console.log(`${selectedQuestions.length}個の問題を${formatDate(selectedDate)}に設定します`, selectedQuestions);
      
      // 親コンポーネントの関数を呼び出す
      saveBulkEdit(selectedDate);
      
      // モーダルを閉じる
      setShowCalendarModal(false);
      
      // 成功通知を表示
      showNotification(`${selectedQuestions.length}件の問題を${formatDate(selectedDate)}に設定しました`);
      
      // 選択モードを終了
      setBulkEditMode(false);
      setSelectedQuestions([]);
    }
  };
  
  // 通知を表示
  const showNotification = (message) => {
    setNotification(message);
    
    // 3秒後に通知を消す
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // フォーム用に日付をYYYY-MM-DD形式に変換
  const formatDateForInput = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };
  
  // 表示用に日付をYYYY/MM/DD形式に変換
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };
　
  // 問題の理解度に基づくスタイルとアイコンを取得
  const getUnderstandingStyle = (understanding) => {
    if (understanding === '理解○') {
      return {
        icon: <CheckCircle className={`${iconStyle} text-green-600`} />,
        className: 'bg-green-100 text-green-800 border-green-300',
      };
    } else if (understanding.startsWith('曖昧△')) {
      return {
        icon: <AlertTriangle className={`${iconStyle} text-yellow-600`} />,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      };
    } else {
      return {
        icon: <XCircle className={`${iconStyle} text-red-600`} />,
        className: 'bg-red-100 text-red-800 border-red-300',
      };
    }
  };
  
  // 正解率に基づく色を取得
  const getCorrectRateColor = (rate) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-lime-500";
    if (rate >= 40) return "bg-yellow-500";
    if (rate >= 20) return "bg-orange-500";
    return "bg-red-500";
  };
  
  return (
    <div className="p-4 max-w-5xl mx-auto pb-24">
      {/* 上部操作パネル */}
      <div className="flex flex-col gap-5 mb-6">
        {/* ヘッダーと検索 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="問題を検索..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl w-full shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className={`${iconStyle}`} />
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className={`${iconStyle}`} />
              </button>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-300 bg-white rounded-xl hover:bg-gray-50 flex items-center shadow-sm flex-grow md:flex-grow-0 justify-center"
            >
              <Filter className={`${iconStyle} mr-2`} />
              フィルター
            </button>
            
            {bulkEditMode ? (
              <button 
                onClick={() => setBulkEditMode(false)}
                className="px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center shadow-sm flex-grow md:flex-grow-0 justify-center"
              >
                選択モード終了
              </button>
            ) : (
              <button 
                onClick={() => setBulkEditMode(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center shadow-sm flex-grow md:flex-grow-0 justify-center"
              >
                一括編集
              </button>
            )}
          </div>
        </div>
        
        {/* 詳細フィルターパネル */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 理解度フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">理解度</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={filters.understanding}
                  onChange={(e) => setFilters({...filters, understanding: e.target.value})}
                >
                  <option value="all">すべて</option>
                  <option value="理解○">理解○</option>
                  <option value="曖昧△">曖昧△</option>
                  <option value="理解できていない×">理解できていない×</option>
                </select>
              </div>
              
              {/* 正解率フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">正解率</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={filters.correctRate}
                  onChange={(e) => setFilters({...filters, correctRate: e.target.value})}
                >
                  <option value="all">すべて</option>
                  <option value="high">高い (80%以上)</option>
                  <option value="medium">中間 (50-80%)</option>
                  <option value="low">低い (50%未満)</option>
                </select>
              </div>
              
              {/* 間隔フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">復習間隔</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={filters.interval}
                  onChange={(e) => setFilters({...filters, interval: e.target.value})}
                >
                  <option value="all">すべて</option>
                  <option value="1日">1日</option>
                  <option value="3日">3日</option>
                  <option value="7日">7日</option>
                  <option value="14日">14日</option>
                  <option value="1ヶ月">1ヶ月</option>
                  <option value="2ヶ月">2ヶ月</option>
                </select>
              </div>
            </div>
            
            {/* リセットボタン */}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => {
                  setFilters({
                    understanding: 'all',
                    correctRate: 'all',
                    interval: 'all',
                  });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                フィルターをリセット
              </button>
            </div>
          </div>
        )}
        
        {/* 期間タブ */}
        <div className="flex rounded-xl bg-gray-100 p-1 shadow-sm gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            } transition-all`}
          >
            全て
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'today' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            } transition-all`}
          >
            今日
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            } transition-all`}
          >
            今週
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            } transition-all`}
          >
            今月
          </button>
        </div>
      </div>
      
      {/* 一括編集時の選択状態表示 */}
      {bulkEditMode && selectedQuestions.length > 0 && (
        <div className="bg-indigo-50 p-4 mb-4 rounded-xl border border-indigo-200 shadow-sm animate-fadeIn">
          <div className="flex justify-between items-center">
            <p className="text-indigo-800 font-medium">
              {selectedQuestions.length}個の問題を選択中
            </p>
            <button 
              onClick={showBulkEditCalendar}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-sm flex items-center hover:bg-indigo-700 transition-colors"
            >
              <Calendar className={`${iconStyle} mr-2`} />
              日付を選択
            </button>
          </div>
        </div>
      )}
      
      {/* 問題一覧 */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-200">
          <p className="text-gray-500">表示できる問題がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* 科目ヘッダー */}
              <div 
                className="flex items-center p-4 cursor-pointer border-b border-gray-200"
                onClick={() => toggleSubject(subject.id)}
              >
                <div className="mr-3 text-gray-500 transition-transform duration-200" style={{ 
                  transform: expandedSubjects[subject.id] ? 'rotate(90deg)' : 'rotate(0deg)' 
                }}>
                  <ChevronRight className={`${iconStyle}`} />
                </div>
                <h3 className="font-bold text-gray-800">{subject.name}</h3>
                <div className="ml-3 text-sm bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                  {subject.chapters.reduce((sum, chapter) => sum + chapter.questions.length, 0)}問
                </div>
              </div>
              
              {/* 科目の中身 */}
              {expandedSubjects[subject.id] && (
                <div className="p-4">
                  {subject.chapters.map(chapter => {
                    // 章内の問題をフィルタリング
                    let filteredQuestions = chapter.questions.filter(question => 
                      searchTerm === '' || question.id.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    // 詳細フィルタを適用
                    filteredQuestions = applyDetailedFilters(filteredQuestions);

                    if (filteredQuestions.length === 0) return null;

                    return (
                      <div key={chapter.id} className="mb-4 last:mb-0">
                        {/* 章ヘッダー */}
                        <div 
                          className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors"
                          onClick={() => toggleChapter(chapter.id)}
                        >
                          <div className="mr-2 text-gray-500 transition-transform duration-200" style={{ 
                            transform: expandedChapters[chapter.id] ? 'rotate(90deg)' : 'rotate(0deg)' 
                          }}>
                            <ChevronRight className={`${iconStyle}`} />
                          </div>
                          <h4 className="text-gray-700 font-medium">{chapter.name}</h4>
                          <div className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                            {filteredQuestions.length}問
                          </div>
                        </div>
                        
                        {/* 章内の問題一覧 */}
                        {expandedChapters[chapter.id] && filteredQuestions.length > 0 && (
                          <div className="mt-3 pl-4 space-y-2">
                            {filteredQuestions.map(question => {
                              const understandingStyle = getUnderstandingStyle(question.understanding);
                              
                              return (
                                <div key={question.id} className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors overflow-hidden">
                                  {/* 問題行（常に表示） */}
                                  <div className="p-3 flex flex-wrap items-center gap-2 bg-white">
                                    {bulkEditMode && (
                                      <div className="flex items-center mr-1">
                                        <input 
                                          type="checkbox" 
                                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                          checked={selectedQuestions.includes(question.id)}
                                          onChange={() => toggleQuestionSelection(question.id)}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* 詳細情報アイコン */}
                                    <button
                                      onClick={() => toggleDetails(question.id)}
                                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                      title={expandedDetails[question.id] ? "詳細を閉じる" : "詳細を表示"}
                                    >
                                      {expandedDetails[question.id] ? (
                                        <ChevronUp className={`${iconStyle}`} />
                                      ) : (
                                        <Info className={`${iconStyle}`} />
                                      )}
                                    </button>
                                    
                                    {/* 問題ID */}
                                    <div className="font-medium text-gray-800 flex-grow">
                                      {searchTerm ? (
                                        <span dangerouslySetInnerHTML={{
                                          __html: question.id.replace(
                                            new RegExp(searchTerm, 'gi'),
                                            match => `<span class="bg-yellow-200">${match}</span>`
                                          )
                                        }} />
                                      ) : (
                                        question.id
                                      )}
                                    </div>
                                    
                                    {/* 理解度バッジ */}
                                    <div className={`flex items-center text-xs px-2 py-1 rounded-full border ${understandingStyle.className}`}>
                                      {understandingStyle.icon}
                                      <span className="ml-1">
                                        {question.understanding.includes(':') 
                                          ? question.understanding.split(':')[0] 
                                          : question.understanding}
                                      </span>
                                    </div>
                                    
                                    {/* 次回予定日 */}
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className={`${iconStyle} mr-1`} />
                                      {formatDate(question.nextDate)}
                                    </div>
                                    
                                    {/* 編集ボタン */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleInlineEdit(question);
                                      }}
                                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors ml-auto"
                                      title="編集"
                                    >
                                      <Edit className={`${iconStyle}`} />
                                    </button>
                                  </div>
                                  
                                  {/* 問題詳細（展開時表示） */}
                                  {expandedDetails[question.id] && !editingInlineQuestions[question.id] && (
                                    <div className="border-t border-gray-200 p-3 bg-gray-50 animate-fadeIn">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <div className="text-xs text-gray-500 mb-1">解答回数</div>
                                          <div className="font-medium">{question.answerCount}回</div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-500 mb-1">最終解答日</div>
                                          <div className="font-medium">{formatDate(question.lastAnswered)}</div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-500 mb-1">復習間隔</div>
                                          <div className="font-medium">{question.interval}</div>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3">
                                        <div className="text-xs text-gray-500 mb-1">正解率</div>
                                        <div className="flex items-center">
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                              className={`h-2 rounded-full ${getCorrectRateColor(question.correctRate)}`}
                                              style={{ width: `${question.correctRate}%` }}
                                            ></div>
                                          </div>
                                          <span className="ml-2 text-sm font-medium">{question.correctRate}%</span>
                                        </div>
                                      </div>
                                      
                                      {question.understanding.includes(':') && (
                                        <div className="mt-3">
                                          <div className="text-xs text-gray-500 mb-1">理解度メモ</div>
                                          <div className="text-sm p-2 bg-white rounded border border-gray-200">
                                            {question.understanding.split(':')[1]}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* インライン編集フォーム */}
                                  {editingInlineQuestions[question.id] && (
                                    <div className="border-t border-gray-200 p-3 bg-gray-50 animate-fadeIn">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* 次回予定日 */}
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            次回予定日
                                          </label>
                                          <input
                                            type="date"
                                            value={editFormData[question.id]?.nextDateStr || ''}
                                            onChange={(e) => updateFormValue(question.id, 'nextDateStr', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                          />
                                        </div>
                                        
                                        {/* 復習間隔 */}
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            復習間隔
                                          </label>
                                          <select
                                            value={editFormData[question.id]?.interval || ''}
                                            onChange={(e) => updateFormValue(question.id, 'interval', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                          >
                                            <option value="1日">1日</option>
                                            <option value="3日">3日</option>
                                            <option value="7日">7日</option>
                                            <option value="14日">14日</option>
                                            <option value="1ヶ月">1ヶ月</option>
                                            <option value="2ヶ月">2ヶ月</option>
                                          </select>
                                        </div>
                                        
                                        {/* メモ */}
                                        <div className="md:col-span-2">
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            メモ
                                          </label>
                                          <textarea
                                            placeholder="メモを入力..."
                                            value={editFormData[question.id]?.memo || ''}
                                            onChange={(e) => updateFormValue(question.id, 'memo', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-20"
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* ボタン */}
                                      <div className="flex justify-end gap-2 mt-4">
                                        <button
                                          onClick={() => cancelInlineEdit(question.id)}
                                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                          キャンセル
                                        </button>
                                        <button
                                          onClick={() => saveInlineEdit(question.id)}
                                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                          保存
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
　{/* カレンダーモーダル - 背景ぼかしなし・見やすいカレンダー */}
{showCalendarModal && (
  <>
    {/* 透明なオーバーレイ - クリックでカレンダーを閉じるためだけのもの */}
    <div 
      className="fixed inset-0 z-40" 
      onClick={() => setShowCalendarModal(false)}
    />
    
    {/* カレンダー本体 - 見やすさを重視 */}
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-300" 
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'auto',
        minWidth: '700px',  // ここを400pxから700pxに変更
        maxWidth: '90vw',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
      }}
    >
      <button 
        onClick={() => setShowCalendarModal(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 z-10"
      >
        <X className="w-5 h-5" />
      </button>
      
      {/* DatePickerCalendarコンポーネント - スケールを大きく */}
      <div className="p-3 transform" style={{ transform: 'scale(2.0)', transformOrigin: 'top center', margin: '20px 0 160px 0' }}>
        <DatePickerCalendar
          selectedDate={selectedDate}
          onChange={handleDateSelection}
        />
      </div>
      
      {/* ボタン部分 */}
      <div className="flex justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="text-sm text-gray-600 font-medium">
          {selectedQuestions.length}個の問題を選択中
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCalendarModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 font-medium"
          >
            キャンセル
          </button>
          <button 
            onClick={executeBulkEdit}
            disabled={!selectedDate}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              selectedDate ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'
            }`}
          >
            一括設定
          </button>
        </div>
      </div>
    </div>
  </>
)}
      
      {/* 通知 */}
      {notification && (
        <div className="fixed bottom-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          {notification}
        </div>
      )}
    </div>
  );
};

export default RedesignedAllQuestionsView;
