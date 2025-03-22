import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, List, Grid, Home } from 'lucide-react';

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
        { id: 106, name: "組織構造論 Q2-1", questions: generateQuestions('2-1', 1, 18) },
        { id: 107, name: "組織行動論 Q2-2", questions: generateQuestions('2-2', 1, 21) },
        { id: 108, name: "人的資源管理 Q2-3", questions: generateQuestions('2-3', 1, 12) },
        { id: 109, name: "マーケティングの基礎概念 Q3-1", questions: generateQuestions('3-1', 1, 2) },
        { id: 110, name: "マーケティングマネジメント戦略の展開 Q3-2", questions: generateQuestions('3-2', 1, 5) },
        { id: 111, name: "マーケティングリサーチ Q3-3", questions: generateQuestions('3-3', 1, 4) },
        { id: 112, name: "消費者購買行動と組織購買行動 Q3-4", questions: generateQuestions('3-4', 1, 8) },
        { id: 113, name: "製品戦略 Q3-5", questions: generateQuestions('3-5', 1, 13) },
        { id: 114, name: "価格戦略 Q3-6", questions: generateQuestions('3-6', 1, 8) },
        { id: 115, name: "チャネル・物流戦略 Q3-7", questions: generateQuestions('3-7', 1, 7) },
        { id: 116, name: "プロモーション戦略 Q3-8", questions: generateQuestions('3-8', 1, 7) },
        { id: 117, name: "関係性マーケティングとデジタルマーケティング Q3-9", questions: generateQuestions('3-9', 1, 4) },
      ]
    },
    {
      id: 2,
      name: "運営管理",
      chapters: [
        { id: 201, name: "生産管理概論 Q1-1", questions: generateQuestions('1-1', 1, 10) },
        { id: 202, name: "生産のプランニング Q1-2", questions: generateQuestions('1-2', 1, 52) },
        { id: 203, name: "生産のオペレーション Q1-3", questions: generateQuestions('1-3', 1, 35) },
        { id: 204, name: "製造業における情報システム Q1-4", questions: generateQuestions('1-4', 1, 6) },
        { id: 205, name: "店舗・商業集積 Q2-1", questions: generateQuestions('2-1', 1, 9) },
        { id: 206, name: "商品仕入・販売（マーチャンダイジング） Q2-2", questions: generateQuestions('2-2', 1, 23) },
        { id: 207, name: "物流・輸配送管理 Q2-3", questions: generateQuestions('2-3', 1, 18) },
        { id: 208, name: "販売流通情報システム Q2-4", questions: generateQuestions('2-4', 1, 17) },
      ]
    },
    {
      id: 3,
      name: "経済学",
      chapters: [
        { id: 301, name: "企業行動の分析 Q1", questions: generateQuestions('1', 1, 19) },
        { id: 302, name: "消費者行動の分析 Q2", questions: generateQuestions('2', 1, 22) },
        { id: 303, name: "市場均衡と厚生分析 Q3", questions: generateQuestions('3', 1, 23) },
        { id: 304, name: "不完全競争 Q4", questions: generateQuestions('4', 1, 15) },
        { id: 305, name: "市場の失敗と政府の役割 Q5", questions: generateQuestions('5', 1, 15) },
        { id: 306, name: "国民経済計算と主要経済指標 Q6", questions: generateQuestions('6', 1, 13) },
        { id: 307, name: "財市場の分析 Q7", questions: generateQuestions('7', 1, 11) },
        { id: 308, name: "貨幣市場とIS-LM分析 Q8", questions: generateQuestions('8', 1, 14) },
        { id: 309, name: "雇用と物価水準 Q9", questions: generateQuestions('9', 1, 8) },
        { id: 310, name: "消費、投資、財政金融政策に関する理論 Q10", questions: generateQuestions('10', 1, 11) },
        { id: 311, name: "国際マクロ経済 Q11", questions: generateQuestions('11', 1, 6) },
        { id: 312, name: "景気循環と経済成長 Q12", questions: generateQuestions('12', 1, 3) },
      ]
    },
    {
      id: 4,
      name: "経営情報システム",
      chapters: [
        { id: 401, name: "情報技術に関する基礎知識 Q1", questions: generateQuestions('1', 1, 178) },
        { id: 402, name: "ソフトウェア開発 Q2", questions: generateQuestions('2', 1, 38) },
        { id: 403, name: "経営情報管理 Q3", questions: generateQuestions('3', 1, 35) },
        { id: 404, name: "統計解析 Q4", questions: generateQuestions('4', 1, 9) },
      ]
    },
    {
      id: 5,
      name: "経営法務",
      chapters: [
        { id: 501, name: "民法その他の知識 Q1", questions: generateQuestions('1', 1, 54) },
        { id: 502, name: "会社法等に関する知識 Q2", questions: generateQuestions('2', 1, 123) },
        { id: 503, name: "資本市場に関する知識 Q3", questions: generateQuestions('3', 1, 12) },
        { id: 504, name: "倒産等に関する知識 Q4", questions: generateQuestions('4', 1, 16) },
        { id: 505, name: "知的財産権等に関する知識 Q5", questions: generateQuestions('5', 1, 107) },
        { id: 506, name: "その他経営法務に関する知識 Q6", questions: generateQuestions('6', 1, 19) },
      ]
    },
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
    nextDate.setDate(today.getDate() + Math.floor(Math.random() * 30)); // ランダムな次回日付
    
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

// メインコンポーネント
const App = () => {
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
    
    // 初期状態ですべての科目を展開
    const initialExpandedSubjects = {};
    initialData.forEach(subject => {
      initialExpandedSubjects[subject.id] = true;
    });
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
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 今日のコンポーネント
  const TodayView = () => {
    const todayQuestions = getTodayQuestions();
    
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">今日解く問題（{formatDate(new Date())}）</h2>
        {todayQuestions.length === 0 ? (
          <p className="text-gray-500">今日解く問題はありません。</p>
        ) : (
          <div className="space-y-4">
            {todayQuestions.map(question => (
              <div key={question.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">{question.subjectName} > {question.chapterName}</div>
                    <div className="font-medium">問題 {question.id}</div>
                    <div className="mt-2 text-sm">
                      <span className="mr-4">正答率: {question.correctRate}%</span>
                      <span>回答回数: {question.answerCount}回</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => recordAnswer(question.id, true, '理解○')}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      ⚪ 理解○
                    </button>
                    <button 
                      onClick={() => recordAnswer(question.id, true, '曖昧△')}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      ⚪ 曖昧△
                    </button>
                    <button 
                      onClick={() => recordAnswer(question.id, false, '理解できていない×')}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      × 理解×
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
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">全問題一覧</h2>
          <button 
            onClick={() => setBulkEditMode(!bulkEditMode)}
            className={`px-3 py-1 rounded ${bulkEditMode ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
          >
            {bulkEditMode ? '選択モードを終了' : '一括編集モード'}
          </button>
        </div>
        
        {bulkEditMode && selectedQuestions.length > 0 && (
          <div className="mb-4 p-3 bg-blue-100 rounded">
            <p>{selectedQuestions.length}個の問題を選択中</p>
            <div className="flex mt-2">
              <input 
                type="date" 
                className="border p-1 rounded mr-2"
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
              <button 
                onClick={() => saveBulkEdit(selectedDate)}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                一括設定
              </button>
            </div>
          </div>
        )}
        
        {subjects.map(subject => (
          <div key={subject.id} className="mb-4">
            <div 
              className="flex items-center bg-gray-200 p-2 rounded cursor-pointer"
              onClick={() => toggleSubject(subject.id)}
            >
              <div className="mr-2">
                {expandedSubjects[subject.id] ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </div>
              <h3 className="font-bold">{subject.name}</h3>
            </div>
            
            {expandedSubjects[subject.id] && (
              <div className="ml-6 mt-2">
                {subject.chapters.map(chapter => (
                  <div key={chapter.id} className="mb-2">
                    <div 
                      className="flex items-center bg-gray-100 p-2 rounded cursor-pointer"
                      onClick={() => toggleChapter(chapter.id)}
                    >
                      <div className="mr-2">
                        {expandedChapters[chapter.id] ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </div>
                      <h4>{chapter.name}</h4>
                    </div>
                    
                    {expandedChapters[chapter.id] && chapter.questions.length > 0 && (
                      <div className="ml-6 mt-2">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {bulkEditMode && (
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  選択
                                </th>
                              )}
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                問題ID
                              </th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                正答率
                              </th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                解答回数
                              </th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                前回解答日
                              </th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                次回予定日
                              </th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                間隔
                              </th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                理解度
                              </th>
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {chapter.questions.map(question => (
                              <tr key={question.id}>
                                {bulkEditMode && (
                                  <td className="px-2 py-1 whitespace-nowrap">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedQuestions.includes(question.id)}
                                      onChange={() => toggleQuestionSelection(question.id)}
                                    />
                                  </td>
                                )}
                                <td className="px-2 py-1 whitespace-nowrap">{question.id}</td>
                                <td className="px-2 py-1 whitespace-nowrap">{question.correctRate}%</td>
                                <td className="px-2 py-1 whitespace-nowrap">{question.answerCount}回</td>
                                <td className="px-2 py-1 whitespace-nowrap">{formatDate(question.lastAnswered)}</td>
                                <td className="px-2 py-1 whitespace-nowrap">{formatDate(question.nextDate)}</td>
                                <td className="px-2 py-1 whitespace-nowrap">{question.interval}</td>
                                <td className="px-2 py-1 whitespace-nowrap">{question.understanding}</td>
                                <td className="px-2 py-1 whitespace-nowrap">
                                  <button 
                                    onClick={() => setEditingQuestion(question)}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
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
                      <div className="ml-6 mt-2 text-gray-500">
                        問題がありません
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* 問題編集モーダル */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded p-6 max-w-2xl w-full">
              <h3 className="text-lg font-bold mb-4">問題編集</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">問題ID</label>
                  <div className="mt-1">{editingQuestion.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">正答率 (%)</label>
                  <input 
                    type="number" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={editingQuestion.answerCount}
                    onChange={(e) => setEditingQuestion({...editingQuestion, answerCount: parseInt(e.target.value, 10)})}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">前回解答日</label>
                  <input 
                    type="date" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={new Date(editingQuestion.lastAnswered).toISOString().split('T')[0]}
                    onChange={(e) => setEditingQuestion({...editingQuestion, lastAnswered: new Date(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">次回予定日</label>
                  <input 
                    type="date" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={new Date(editingQuestion.nextDate).toISOString().split('T')[0]}
                    onChange={(e) => setEditingQuestion({...editingQuestion, nextDate: new Date(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">間隔</label>
                  <select 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  キャンセル
                </button>
                <button 
                  onClick={() => saveQuestionEdit(editingQuestion)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
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
        <div>
          <h3 className="text-lg font-medium mb-3">解答予定日リスト</h3>
          {nextDates.length === 0 ? (
            <p className="text-gray-500">予定がありません。</p>
          ) : (
            <div className="space-y-2">
              {nextDates.map((dateInfo, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded flex justify-between ${
                    new Date().toDateString() === dateInfo.date.toDateString() 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{dateInfo.dateStr}</div>
                  <div>{dateInfo.count}問</div>
                </div>
              ))}
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
        <div>
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-1 rounded hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-medium">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            <button 
              onClick={() => changeMonth(1)}
              className="p-1 rounded hover:bg-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className="text-center py-2 font-medium bg-gray-100"
              >
                {day}
              </div>
            ))}
            
            {calendar.flat().map((dayData, index) => (
              <div 
                key={index} 
                className={`min-h-24 border p-1 ${
                  dayData 
                    ? dayData.date.toDateString() === new Date().toDateString()
                      ? 'bg-blue-50'
                      : ''
                    : 'bg-gray-50'
                }`}
              >
                {dayData && (
                  <>
                    <div className="text-right mb-1">{dayData.day}</div>
                    {dayData.questions.length > 0 && (
                      <div className="bg-blue-100 p-1 rounded text-sm">
                        {dayData.questions.length}問
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    return (
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">問題スケジュール一覧</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              リスト表示
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded ${viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2">
      <button 
        onClick={() => setActiveTab('today')}
        className={`flex flex-col items-center p-2 ${activeTab === 'today' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">今日</span>
      </button>
      <button 
        onClick={() => setActiveTab('schedule')}
        className={`flex flex-col items-center p-2 ${activeTab === 'schedule' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Calendar className="h-6 w-6" />
        <span className="text-xs mt-1">スケジュール</span>
      </button>
      <button 
        onClick={() => setActiveTab('all')}
        className={`flex flex-col items-center p-2 ${activeTab === 'all' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <List className="h-6 w-6" />
        <span className="text-xs mt-1">全問題</span>
      </button>
    </div>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">学習スケジュール管理</h1>
        <p className="text-sm">暗記曲線に基づく効率的な学習を実現</p>
      </header>
      
      <MainView />
      
      <Navigation />
    </div>
  );
};

// ChevronDown コンポーネント
const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// ChevronRight コンポーネント
const ChevronRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default App;
