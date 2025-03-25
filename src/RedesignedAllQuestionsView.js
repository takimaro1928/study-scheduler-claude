import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Info, Edit, Clock, Calendar, X,
  ChevronRight, ChevronUp, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar';

/**
 * もともとのロジックや状態管理をすべてこのコンポーネントに内包。
 * "subjects" や "expandedSubjects" などの props もそのまま利用します。
 * 機能を変えず、レイアウトと見た目のみ大きく変更。
 */
const BigLayoutAllQuestionsView = ({
  // 以下は従来通り
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
  saveBulkEdit,
}) => {
  // ====== 以下、もともとの state や関数 ======
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    understanding: 'all',
    correctRate: 'all',
    interval: 'all',
  });
  const [expandedDetails, setExpandedDetails] = useState({});
  const [editingInlineQuestions, setEditingInlineQuestions] = useState({});
  const [editFormData, setEditFormData] = useState({});
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // アイコン共通スタイル
  const iconStyle = "w-5 h-5";

  // 期間フィルターのロジック（従来通り）
  const getFilteredData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekLater = new Date(today);  oneWeekLater.setDate(today.getDate() + 7);
    const oneMonthLater = new Date(today); oneMonthLater.setMonth(today.getMonth() + 1);

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
        }).filter(ch => ch.questions.length > 0);
        return { ...subject, chapters: filteredChapters };
      }).filter(sb => sb.chapters.length > 0);
    }
    return filteredSubjects;
  };

  // 詳細フィルター
  const applyDetailedFilters = (questions) => {
    return questions.filter(question => {
      // 理解度フィルター
      if (filters.understanding !== 'all' && !question.understanding.startsWith(filters.understanding)) {
        return false;
      }
      // 正解率フィルター
      if (filters.correctRate !== 'all') {
        if (filters.correctRate === 'high' && question.correctRate < 80) {
          return false;
        } else if (filters.correctRate === 'medium' && (question.correctRate < 50 || question.correctRate >= 80)) {
          return false;
        } else if (filters.correctRate === 'low' && question.correctRate >= 50) {
          return false;
        }
      }
      // 復習間隔
      if (filters.interval !== 'all' && question.interval !== filters.interval) {
        return false;
      }
      return true;
    });
  };

  const filteredSubjects = getFilteredData().filter(subject => {
    return subject.chapters.some(chapter => 
      chapter.questions.some(question => 
        searchTerm === '' || question.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  // 一括編集関連
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // 詳細展開/折りたたみ
  const toggleDetails = (questionId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    // インライン編集中なら閉じる
    if (editingInlineQuestions[questionId]) {
      setEditingInlineQuestions(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // インライン編集（省略・従来通り）
  const [editFormDataBackup, setEditFormDataBackup] = useState({});
  const toggleInlineEdit = (question) => {
    // ... 省略: 従来ロジックをそのまま
  };
  const saveInlineEdit = (questionId) => { /* ... */ };
  const cancelInlineEdit = (questionId) => { /* ... */ };
  const updateFormValue = (questionId, field, value) => { /* ... */ };

  // 一括編集用カレンダー
  const showBulkEditCalendar = () => {
    setShowCalendarModal(true);
  };
  const handleDateSelection = (date) => {
    setSelectedDate(date);
  };
  const executeBulkEdit = () => {
    if (selectedDate && selectedQuestions.length > 0) {
      saveBulkEdit(selectedDate);
      setShowCalendarModal(false);
      showNotification(`${selectedQuestions.length}件の問題を${formatDate(selectedDate)}に設定しました`);
      setBulkEditMode(false);
      setSelectedQuestions([]);
    }
  };

  // 通知
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // 日付フォーマット
  const formatDateForInput = (date) => { /* ... */ };
  const formatDate = (date) => { /* ... */ };

  // 理解度アイコン
  const getUnderstandingStyle = (understanding) => {
    // ... 従来通り
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

  // 正解率バーの色
  const getCorrectRateColor = (rate) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-lime-500";
    if (rate >= 40) return "bg-yellow-500";
    if (rate >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // ============================
  // レイアウトを大きく変更
  // ============================
  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* ---------- サイドナビ ---------- */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 p-4">
        {/* アプリロゴ / タイトル（仮） */}
        <div className="text-xl font-bold text-indigo-600 mb-6">
          学習スケジュール
        </div>
        {/* ナビメニュー（仮） */}
        <nav className="flex flex-col gap-3">
          <button className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <span className="font-medium">ホーム</span>
          </button>
          <button className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <span className="font-medium">今日の問題</span>
          </button>
          <button className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <span className="font-medium">スケジュール</span>
          </button>
          <button className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <span className="font-medium">全問題一覧</span>
          </button>
          <button className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
            <span className="font-medium">設定</span>
          </button>
        </nav>
      </aside>

      {/* ---------- メインコンテナ（ヘッダー＋コンテンツ） ---------- */}
      <div className="flex-1 flex flex-col">
        
        {/* ---------- ヘッダー ---------- */}
        <header className="h-16 flex items-center justify-between bg-white border-b border-gray-200 px-4">
          {/* 検索バー */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="問題を検索..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className={`${iconStyle} text-gray-400 absolute top-1/2 left-2 transform -translate-y-1/2`} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className={`${iconStyle}`} />
              </button>
            )}
          </div>
          
          {/* フィルター＆一括編集ボタン */}
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              <Filter className={`${iconStyle} mr-2`} />
              フィルター
            </button>
            
            {bulkEditMode ? (
              <button 
                onClick={() => setBulkEditMode(false)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                選択モード終了
              </button>
            ) : (
              <button 
                onClick={() => setBulkEditMode(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                一括編集
              </button>
            )}
          </div>
        </header>

        {/* ---------- フィルターパネル（ヘッダー下） ---------- */}
        {showFilters && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 理解度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">理解度</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={filters.understanding}
                  onChange={(e) => setFilters({...filters, understanding: e.target.value})}
                >
                  <option value="all">すべて</option>
                  <option value="理解○">理解○</option>
                  <option value="曖昧△">曖昧△</option>
                  <option value="理解できていない×">理解できていない×</option>
                </select>
              </div>
              
              {/* 正解率 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">正解率</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={filters.correctRate}
                  onChange={(e) => setFilters({...filters, correctRate: e.target.value})}
                >
                  <option value="all">すべて</option>
                  <option value="high">高い (80%以上)</option>
                  <option value="medium">中間 (50-80%)</option>
                  <option value="low">低い (50%未満)</option>
                </select>
              </div>
              
              {/* 復習間隔 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">復習間隔</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
            <div className="mt-3 text-right">
              <button 
                onClick={() => setFilters({ understanding: 'all', correctRate: 'all', interval: 'all' })}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700"
              >
                フィルターをリセット
              </button>
            </div>
          </div>
        )}

        {/* ---------- タブ（全て/今日/今週/今月） ---------- */}
        <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-200">
          {['all','today','week','month'].map(key => {
            const label = key === 'all' ? '全て' 
                          : key === 'today' ? '今日' 
                          : key === 'week' ? '今週' : '今月';
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === key ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ---------- メイン表示エリア ---------- */}
        <main className="flex-1 p-4 overflow-auto">
          
          {/* 一括編集中のバナー */}
          {bulkEditMode && selectedQuestions.length > 0 && (
            <div className="bg-indigo-50 p-4 mb-4 rounded-lg border border-indigo-200 shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-indigo-800 font-medium">
                  {selectedQuestions.length}個の問題を選択中
                </p>
                <button 
                  onClick={showBulkEditCalendar}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Calendar className={`${iconStyle} inline-block mr-1`} />
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
                    <div 
                      className="mr-3 text-gray-500 transition-transform duration-200"
                      style={{ transform: expandedSubjects[subject.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <ChevronRight className={`${iconStyle}`} />
                    </div>
                    <h3 className="font-bold text-gray-800">{subject.name}</h3>
                    <div className="ml-3 text-sm bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                      {subject.chapters.reduce((sum, c) => sum + c.questions.length, 0)}問
                    </div>
                  </div>
                  
                  {/* 科目の中身 */}
                  {expandedSubjects[subject.id] && (
                    <div className="p-4">
                      {subject.chapters.map(chapter => {
                        // 章内のフィルタ
                        let filteredQuestions = chapter.questions.filter(q =>
                          searchTerm === '' || q.id.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        filteredQuestions = applyDetailedFilters(filteredQuestions);
                        if (filteredQuestions.length === 0) return null;

                        return (
                          <div key={chapter.id} className="mb-4 last:mb-0">
                            {/* 章ヘッダー */}
                            <div 
                              className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors"
                              onClick={() => toggleChapter(chapter.id)}
                            >
                              <div 
                                className="mr-2 text-gray-500 transition-transform duration-200"
                                style={{ transform: expandedChapters[chapter.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                              >
                                <ChevronRight className={`${iconStyle}`} />
                              </div>
                              <h4 className="text-gray-700 font-medium">{chapter.name}</h4>
                              <div className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                {filteredQuestions.length}問
                              </div>
                            </div>

                            {/* 章内の問題一覧 */}
                            {expandedChapters[chapter.id] && (
                              <div className="mt-3 pl-4 space-y-2">
                                {filteredQuestions.map(question => {
                                  const understandingStyle = getUnderstandingStyle(question.understanding);
                                  return (
                                    <div 
                                      key={question.id}
                                      className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors overflow-hidden"
                                    >
                                      {/* 問題行 */}
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
                                        {/* 詳細ボタン */}
                                        <button
                                          onClick={() => toggleDetails(question.id)}
                                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
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
                                        >
                                          <Edit className={`${iconStyle}`} />
                                        </button>
                                      </div>

                                      {/* 詳細表示 */}
                                      {expandedDetails[question.id] && !editingInlineQuestions[question.id] && (
                                        <div className="border-t border-gray-200 p-3 bg-gray-50 animate-fadeIn">
                                          {/* 省略: 従来通りの詳細情報表示 */}
                                        </div>
                                      )}

                                      {/* インライン編集フォーム */}
                                      {editingInlineQuestions[question.id] && (
                                        <div className="border-t border-gray-200 p-3 bg-gray-50 animate-fadeIn">
                                          {/* 省略: 従来通りのインライン編集フォーム */}
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
        </main>
      </div>

      {/* ============ カレンダーモーダル ============ */}
      {showCalendarModal && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowCalendarModal(false)} />
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-300"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'auto',
              minWidth: '500px',
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
            <div className="p-4 scale-125 transform origin-top bg-white border border-gray-200 rounded-md">
              <DatePickerCalendar
                selectedDate={selectedDate}
                onChange={handleDateSelection}
              />
            </div>
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
                  className={`px-4 py-2 rounded-md font-bold ${
                    selectedDate
                      ? 'bg-purple-700 text-white hover:bg-purple-800'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  一括設定
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============ 通知 ============ */}
      {notification && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          {notification}
        </div>
      )}
    </div>
  );
};

export default BigLayoutAllQuestionsView;
