import React, { useState, useEffect } from 'react';
import { Calendar, Clock, List, ChevronRight, ChevronLeft, ChevronDown, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// 初期データの作成
const generateInitialData = () => {
  const subjects = [
    {
      id: 1,
      name: "経営管理論",
      chapters: [
        { id: 101, name: "企業活動と経営戦略の全体概要 Q1-1", questions: generateQuestions('1-1', 1, 2) },
        { id: 102, name: "事業戦略（競争戦略） Q1-2", questions: generateQuestions('1-2', 1, 16) },
        { id: 103, name: "企業戦略（成長戦略） Q1-3", questions: generateQuestions('1-3', 1, 27) },
        { id: 104, name: "技術経営 Q1-4", questions: generateQuestions('1-4', 1, 14) },
        { id: 105, name: "企業の社会的責任（CSR）とコーポレートガバナンス Q1-5", questions: generateQuestions('1-5', 1, 5) },
        // 他の章も同様に追加
      ]
    },
    {
      id: 2,
      name: "運営管理",
      chapters: [
        { id: 201, name: "生産管理概論 Q1-1", questions: generateQuestions('1-1', 1, 10) },
        { id: 202, name: "生産のプランニング Q1-2", questions: generateQuestions('1-2', 1, 52) },
        // 他の章も同様に追加
      ]
    },
    // 他の科目も同様に追加
    {
      id: 6,
      name: "中小企業経営・中小企業政策",
      chapters: [
        { id: 601, name: "後日追加予定", questions: [] },
      ]
    }
  ];
  
  return subjects;
};

// 問題データを生成する関数
function generateQuestions(prefix, start, end) {
  const questions = [];
  for (let i = start; i <= end; i++) {
    const today = new Date();
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
    
    questions.push({
      id: `${prefix}-${i}`,
      number: i,
      correctRate: Math.floor(Math.random() * 100),
      lastAnswered: new Date(today.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      nextDate: nextDate,
      interval: ['1日', '3日', '7日', '14日', '1ヶ月', '2ヶ月'][Math.floor(Math.random() * 6)],
      answerCount: Math.floor(Math.random() * 10),
      understanding: ['理解○', '曖昧△', '理解できていない×'][Math.floor(Math.random() * 3)],
    });
  }
  return questions;
}

// アプリケーションのメインコンポーネント
function App() {
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    // 初期データの読み込み
    const initialData = generateInitialData();
    setSubjects(initialData);
    
    // 初期状態で最初の科目を展開
    const initialExpandedSubjects = {};
    initialData.forEach(subject => {
      initialExpandedSubjects[subject.id] = false;
    });
    initialExpandedSubjects[1] = true; // 最初の科目だけ展開
    setExpandedSubjects(initialExpandedSubjects);
  }, []);

  // 今日の問題を取得
  const getTodayQuestions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const questions = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        chapter.questions.forEach(question => {
          const nextDate = new Date(question.nextDate);
          nextDate.setHours(0, 0, 0, 0);
          if (nextDate.getTime() === today.getTime()) {
            questions.push({
              ...question,
              subjectName: subject.name,
              chapterName: chapter.name
            });
          }
        });
      });
    });
    
    return questions;
  };

  // 特定の日付の問題を取得
  const getQuestionsForDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const questions = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        chapter.questions.forEach(question => {
          const nextDate = new Date(question.nextDate);
          nextDate.setHours(0, 0, 0, 0);
          if (nextDate.getTime() === targetDate.getTime()) {
            questions.push({
              ...question,
              subjectName: subject.name,
              chapterName: chapter.name
            });
          }
        });
      });
    });
    
    return questions;
  };

  // 科目の展開/折りたたみを切り替える
  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // 章の展開/折りたたみを切り替える
  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // 問題の解答を記録する
  const recordAnswer = (questionId, isCorrect, understanding) => {
    setSubjects(prevSubjects => {
      const newSubjects = [...prevSubjects];
      
      for (const subject of newSubjects) {
        for (const chapter of subject.chapters) {
          const questionIndex = chapter.questions.findIndex(q => q.id === questionId);
          
          if (questionIndex !== -1) {
            const question = {...chapter.questions[questionIndex]};
            
            // 正解/不正解に基づいて次回の日付と間隔を更新
            const today = new Date();
            let nextDate = new Date();
            let newInterval = '';
            
            if (isCorrect) {
              // 正解の場合、間隔を延長
              switch(question.interval) {
                case '1日': 
                  nextDate.setDate(today.getDate() + 3);
                  newInterval = '3日';
                  break;
                case '3日': 
                  nextDate.setDate(today.getDate() + 7);
                  newInterval = '7日';
                  break;
                case '7日': 
                  nextDate.setDate(today.getDate() + 14);
                  newInterval = '14日';
                  break;
                case '14日': 
                  nextDate.setMonth(today.getMonth() + 1);
                  newInterval = '1ヶ月';
                  break;
                case '1ヶ月': 
                  nextDate.setMonth(today.getMonth() + 2);
                  newInterval = '2ヶ月';
                  break;
                case '2ヶ月':
                default:
                  nextDate.setMonth(today.getMonth() + 2);
                  newInterval = '2ヶ月';
                  break;
              }
            } else {
              // 不正解の場合、翌日に設定
              nextDate.setDate(today.getDate() + 1);
              newInterval = '1日';
            }
            
            // 問題の状態を更新
            chapter.questions[questionIndex] = {
              ...question,
              lastAnswered: today,
              nextDate: nextDate,
              interval: newInterval,
              answerCount: question.answerCount + 1,
              understanding: understanding,
              correctRate: isCorrect 
                ? Math.round((question.correctRate * question.answerCount + 100) / (question.answerCount + 1))
                : Math.round((question.correctRate * question.answerCount) / (question.answerCount + 1)),
            };
            
            return newSubjects;
          }
        }
      }
      
      return prevSubjects;
    });
  };

  // 問題の編集を保存
  const saveQuestionEdit = (questionData) => {
    setSubjects(prevSubjects => {
      const newSubjects = [...prevSubjects];
      
      for (const subject of newSubjects) {
        for (const chapter of subject.chapters) {
          const questionIndex = chapter.questions.findIndex(q => q.id === questionData.id);
          
          if (questionIndex !== -1) {
            chapter.questions[questionIndex] = {
              ...questionData
            };
            return newSubjects;
          }
        }
      }
      
      return prevSubjects;
    });
    
    setEditingQuestion(null);
  };

  // 一括編集の保存
  const saveBulkEdit = (date) => {
    setSubjects(prevSubjects => {
      const newSubjects = [...prevSubjects];
      
      selectedQuestions.forEach(questionId => {
        for (const subject of newSubjects) {
          for (const chapter of subject.chapters) {
            const questionIndex = chapter.questions.findIndex(q => q.id === questionId);
            
            if (questionIndex !== -1) {
              chapter.questions[questionIndex] = {
                ...chapter.questions[questionIndex],
                nextDate: new Date(date)
              };
              break;
            }
          }
        }
      });
      
      return newSubjects;
    });
    
    setBulkEditMode(false);
    setSelectedQuestions([]);
  };

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

  // 日付のフォーマット
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };

  // 今日のコンポーネント
  const TodayView = () => {
    const todayQuestions = getTodayQuestions();
    
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          今日解く問題（{formatDate(new Date())}）
        </h2>
        
        {todayQuestions.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800">今日解く問題はありません。おつかれさまでした！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayQuestions.map(question => (
              <div key={question.id} className="bg-white p-5 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{question.subjectName} &gt; {question.chapterName}</div>
                    <div className="font-medium text-lg mb-3 text-gray-800">問題 {question.id}</div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                      <div>正答率: <span className="font-medium">{question.correctRate}%</span></div>
                      <div>回答回数: <span className="font-medium">{question.answerCount}回</span></div>
                      <div>前回解答: <span className="font-medium">{formatDate(question.lastAnswered)}</span></div>
                      <div>理解度: <span className="font-medium">{question.understanding}</span></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
                    <button 
                      onClick={() => recordAnswer(question.id, true, '理解○')}
                      className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> 理解○
                    </button>
                    <button 
                      onClick={() => recordAnswer(question.id, true, '曖昧△')}
                      className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" /> 曖昧△
                    </button>
                    <button 
                      onClick={() => recordAnswer(question.id, false, '理解できていない×')}
                      className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> 理解×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 全問題一覧コンポーネント
  const AllQuestionsView = () => {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <List className="w-5 h-5 mr-2" />
            全問題一覧
          </h2>
          <button 
            onClick={() => setBulkEditMode(!bulkEditMode)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              bulkEditMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            {bulkEditMode ? '選択モードを終了' : '一括編集'}
          </button>
        </div>
        
        {bulkEditMode && selectedQuestions.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 mb-3">{selectedQuestions.length}個の問題を選択中</p>
            <div className="flex flex-wrap gap-2">
              <input 
                type="date" 
                className="border border-gray-300 rounded-lg p-2"
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
              <button 
                onClick={() => saveBulkEdit(selectedDate)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                一括設定
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-lg shadow border border-gray-100">
              <div 
                className="flex items-center bg-gray-50 p-3 rounded-t-lg cursor-pointer border-b border-gray-200"
                onClick={() => toggleSubject(subject.id)}
              >
                <div className="mr-2 text-gray-500">
                  {expandedSubjects[subject.id] ? 
                    <ChevronDown className="w-5 h-5" /> : 
                    <ChevronRight className="w-5 h-5" />
                  }
                </div>
                <h3 className="font-bold text-gray-800">{subject.name}</h3>
              </div>
              
              {expandedSubjects[subject.id] && (
                <div className="p-3">
                  {subject.chapters.map(chapter => (
                    <div key={chapter.id} className="mb-3 last:mb-0">
                      <div 
                        className="flex items-center bg-white p-2 rounded cursor-pointer border border-gray-200 hover:bg-gray-50"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <div className="mr-2 text-gray-500">
                          {expandedChapters[chapter.id] ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </div>
                        <h4 className="text-gray-700">{chapter.name}</h4>
                      </div>
                      
                      {expandedChapters[chapter.id] && chapter.questions.length > 0 && (
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                              <tr>
                                {bulkEditMode && (
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    選択
                                  </th>
                                )}
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  問題ID
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  正答率
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  解答回数
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  前回解答日
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  次回予定日
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  間隔
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  理解度
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  操作
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {chapter.questions.map(question => (
                                <tr key={question.id} className="hover:bg-gray-50">
                                  {bulkEditMode && (
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <input 
                                        type="checkbox" 
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        checked={selectedQuestions.includes(question.id)}
                                        onChange={() => toggleQuestionSelection(question.id)}
                                      />
                                    </td>
                                  )}
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{question.id}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{question.correctRate}%</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{question.answerCount}回</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{formatDate(question.lastAnswered)}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{formatDate(question.nextDate)}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{question.interval}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{question.understanding}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <button 
                                      onClick={() => setEditingQuestion(question)}
                                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                      編集
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      {expandedChapters[chapter.id] && chapter.questions.length === 0 && (
                        <div className="mt-2 p-3 text-gray-500 text-center bg-gray-50 rounded-lg">
                          問題がありません
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 問題編集モーダル */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-gray-800">問題編集</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">問題ID</label>
                  <div className="mt-1 text-gray-800 font-medium">{editingQuestion.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">正答率 (%)</label>
                  <input 
                    type="number" 
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
                    value={editingQuestion.correctRate}
                    onChange={(e) => setEditingQuestion({...editingQuestion, correctRate: parseInt(e.target.value, 10)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">解答回数</label>
                  <input 
                    type="number" 
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
                    value={editingQuestion.answerCount}
                    onChange={(e) => setEditingQuestion({...editingQuestion, answerCount: parseInt(e.target.value, 10)})}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">前回解答日</label>
                  <input 
                    type="date" 
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
                    value={new Date(editingQuestion.lastAnswered).toISOString().split('T')[0]}
                    onChange={(e) => setEditingQuestion({...editingQuestion, lastAnswered: new Date(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">次回予定日</label>
                  <input 
                    type="date" 
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
                    value={new Date(editingQuestion.nextDate).toISOString().split('T')[0]}
                    onChange={(e) => setEditingQuestion({...editingQuestion, nextDate: new Date(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">間隔</label>
                  <select 
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
                    value={editingQuestion.interval}
                    onChange={(e) => setEditingQuestion({...editingQuestion, interval: e.target.value})}
                  >
                    <option value="1日">1日</option>
                    <option value="3日">3日</option>
                    <option value="7日">7日</option>
                    <option value="14日">14日</option>
                    <option value="1ヶ月">1ヶ月</option>
                    <option value="2ヶ月">2ヶ月</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">理解度</label>
                  <select 
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
                    value={editingQuestion.understanding}
                    onChange={(e) => setEditingQuestion({...editingQuestion, understanding: e.target.value})}
                  >
                    <option value="理解○">理解○</option>
                    <option value="曖昧△">曖昧△</option>
                    <option value="理解できていない×">理解できていない×</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  onClick={() => saveQuestionEdit(editingQuestion)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // スケジュール一覧コンポーネント
  const ScheduleView = () => {
    const [viewMode, setViewMode] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    // 月を変更
    const changeMonth = (offset) => {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + offset);
      setCurrentMonth(newMonth);
    };
    
    // 月のカレンダーデータを生成
    const getCalendarData = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const daysInMonth = lastDay.getDate();
      const startDayOfWeek = firstDay.getDay();
      
      const calendar = [];
      let day = 1;
      
      for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
          if ((i === 0 && j < startDayOfWeek) || day > daysInMonth) {
            week.push(null);
          } else {
            const currentDate = new Date(year, month, day);
            const questionsForDay = getQuestionsForDate(currentDate);
            week.push({
              day,
              date: currentDate,
              questions: questionsForDay
            });
            day++;
          }
        }
        calendar.push(week);
        if (day > daysInMonth) break;
      }
      
      return calendar;
    };
    
    // リスト表示
    const renderListView = () => {
      const nextDates = [];
      const uniqueDates = new Set();
      
      subjects.forEach(subject => {
        subject.chapters.forEach(chapter => {
          chapter.questions.forEach(question => {
            const dateStr = formatDate(question.nextDate);
            if (!uniqueDates.has(dateStr)) {
              uniqueDates.add(dateStr);
              nextDates.push({
                date: new Date(question.nextDate),
                dateStr,
                count: 1
              });
            } else {
              const index = nextDates.findIndex(d => d.dateStr === dateStr);
              if (index !== -1) {
                nextDates[index].count++;
              }
            }
          });
        });
      });
      
      // 日付順にソート
      nextDates.sort((a, b) => a.date - b.date);
      
      return (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
          <h3 className="text-lg font-medium mb-4 text-gray-800">解答予定日リスト</h3>
          {nextDates.length === 0 ? (
            <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">予定がありません。</p>
          ) : (
            <div className="space-y-2">
              {nextDates.map((dateInfo, index) => {
                const isToday = new Date().toDateString() === dateInfo.date.toDateString();
                const isPast = dateInfo.date < new Date() && !isToday;
                
                return (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg flex justify-between items-center border ${
                      isToday 
                        ? 'bg-blue-50 border-blue-200 text-blue-800' 
                        : isPast
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="font-medium">{dateInfo.dateStr}</div>
                    <div className="bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                      {dateInfo.count}問
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };
    
    // カレンダー表示
    const renderCalendarView = () => {
      const calendar = getCalendarData(currentMonth);
      const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
      
      return (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-medium text-gray-800">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`text-center py-2 font-medium text-sm rounded-t-lg ${
                  index === 0 ? 'text-red-500 bg-red-50' : 
                  index === 6 ? 'text-blue-500 bg-blue-50' : 
                  'text-gray-600 bg-gray-50'
                }`}
              >
                {day}
              </div>
            ))}
            
            {calendar.flat().map((dayData, index) => {
              const isToday = dayData && dayData.date.toDateString() === new Date().toDateString();
              const hasQuestions = dayData && dayData.questions.length > 0;
              
              return (
                <div 
                  key={index} 
                  className={`min-h-24 border p-1 rounded-lg ${
                    !dayData ? 'bg-gray-50 border-gray-100' :
                    isToday ? 'bg-blue-50 border-blue-200' :
                    hasQuestions ? 'bg-white border-gray-200' :
                    'bg-white border-gray-100'
                  }`}
                >
                  {dayData && (
                    <>
                      <div className={`text-right mb-1 font-medium ${
                        isToday ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {dayData.day}
                      </div>
                      {hasQuestions && (
                        <div className="bg-indigo-100 text-indigo-800 p-1 rounded-lg text-xs font-medium text-center shadow-sm">
                          {dayData.questions.length}問
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    };
    
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            問題スケジュール一覧
          </h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors`}
            >
              リスト表示
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors`}
            >
              カレンダー表示
            </button>
          </div>
        </div>
        
        {viewMode === 'list' ? renderListView() : renderCalendarView()}
      </div>
    );
  };
  
  // ナビゲーションコンポーネント
  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around p-2 z-10">
      <button 
        onClick={() => setActiveTab('today')}
        className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'today' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'} transition-colors`}
      >
        <Clock className="h-6 w-6" />
        <span className="text-xs mt-1 font-medium">今日</span>
      </button>
      <button 
        onClick={() => setActiveTab('schedule')}
        className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'schedule' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'} transition-colors`}
      >
        <Calendar className="h-6 w-6" />
        <span className="text-xs mt-1 font-medium">スケジュール</span>
      </button>
      <button 
        onClick={() => setActiveTab('all')}
        className={`flex flex-col items-center p-2 rounded-lg ${activeTab === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'} transition-colors`}
      >
        <List className="h-6 w-6" />
        <span className="text-xs mt-1 font-medium">全問題</span>
      </button>
    </nav>
  );

  // メインビュー
  const MainView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView />;
      case 'schedule':
        return <ScheduleView />;
      case 'all':
        return <AllQuestionsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">学習スケジュール管理</h1>
          <p className="text-sm opacity-90">暗記曲線に基づく効率的な学習を実現</p>
        </div>
      </header>
      
      <MainView />
      
      <Navigation />
    </div>
  );
}

export default App;
