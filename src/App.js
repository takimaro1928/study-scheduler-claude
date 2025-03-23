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
        { id: 117, name: "関係性マーケティングとデジタルマーケティング Q3-9", questions: generateQuestions('3-9', 1, 4) }
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
        { id: 208, name: "販売流通情報システム Q2-4", questions: generateQuestions('2-4', 1, 17) }
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
        { id: 312, name: "景気循環と経済成長 Q12", questions: generateQuestions('12', 1, 3) }
      ]
    },
    {
      id: 4,
      name: "経営情報システム",
      chapters: [
        { id: 401, name: "情報技術に関する基礎知識 Q1", questions: generateQuestions('1', 1, 178) },
        { id: 402, name: "ソフトウェア開発 Q2", questions: generateQuestions('2', 1, 38) },
        { id: 403, name: "経営情報管理 Q3", questions: generateQuestions('3', 1, 35) },
        { id: 404, name: "統計解析 Q4", questions: generateQuestions('4', 1, 9) }
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
        { id: 506, name: "その他経営法務に関する知識 Q6", questions: generateQuestions('6', 1, 19) }
      ]
    },
    {
      id: 6,
      name: "中小企業経営・中小企業政策",
      chapters: [
        { id: 601, name: "後日追加予定", questions: [] }
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
  const [ambiguousReason, setAmbiguousReason] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  
  // 問題の回答を記録する関数
  const recordCompleteAnswer = (questionId, isCorrect, understanding) => {
    // 正解/不正解と理解度を記録
    recordAnswer(questionId, isCorrect, understanding);
  }
  
  // 曖昧ボタンをクリックした時の処理
  const handleAmbiguousClick = (questionId) => {
    setSelectedQuestionId(questionId);
    setAmbiguousReason('show');
  }
  
  // 曖昧な理由を選択した時の処理
  const selectAmbiguousReason = (reason) => {
    // 曖昧な理由を含めて記録
    recordAnswer(selectedQuestionId, true, `曖昧△:${reason}`);
    setAmbiguousReason(null);
    setSelectedQuestionId(null);
  }
  
  return (
    <div className="p-4 w-full sm:w-10/12 md:w-8/12 lg:w-7/12 xl:w-6/12 mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center justify-center">
        <Clock className="w-5 h-5 mr-2" />
        今日解く問題（{formatDate(new Date())}）
      </h2>
      
      {todayQuestions.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 font-medium">今日解く問題はありません。おつかれさまでした！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {todayQuestions.map(question => (
            <div key={question.id} className="bg-white px-5 py-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              {/* 科目情報 */}
              <div className="text-xs text-gray-500 mb-1">{question.subjectName}</div>
              
              {/* 章と問題 */}
              <div className="font-bold text-lg text-gray-800 mb-2">{question.chapterName}</div>
              <div className="font-medium mb-4 inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">問題 {question.id}</div>
              
              {/* 解答結果ボタン - 正解/不正解 */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">解答結果:</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => recordCompleteAnswer(question.id, true, question.understanding)}
                    className="flex-1 py-3 bg-green-100 border border-green-500 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center font-medium"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> 正解 ⭕️
                  </button>
                  <button 
                    onClick={() => recordCompleteAnswer(question.id, false, question.understanding)}
                    className="flex-1 py-3 bg-red-100 border border-red-500 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center font-medium"
                  >
                    <XCircle className="w-5 h-5 mr-2" /> 不正解 ❌
                  </button>
                </div>
              </div>
              
              {/* 理解度ボタン */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">理解度:</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => recordCompleteAnswer(question.id, true, '理解○')}
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center font-medium"
                  >
                    理解できた
                  </button>
                  <button 
                    onClick={() => handleAmbiguousClick(question.id)}
                    className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center font-medium"
                  >
                    曖昧
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 曖昧理由選択モーダル */}
      {ambiguousReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">曖昧だった理由を選択してください</h3>
            <div className="space-y-3">
              <button 
                onClick={() => selectAmbiguousReason('他の選択肢の意味がわからなかった')}
                className="w-full py-3 px-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                他の選択肢の意味がわからなかった
              </button>
              <button 
                onClick={() => selectAmbiguousReason('たまたま当ててしまった')}
                className="w-full py-3 px-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                たまたま当ててしまった
              </button>
              <button 
                onClick={() => selectAmbiguousReason('合っていたけど違う答えを思い浮かべてた')}
                className="w-full py-3 px-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                合っていたけど違う答えを思い浮かべてた
              </button>
              <button 
                onClick={() => selectAmbiguousReason('その他')}
                className="w-full py-3 px-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                その他
              </button>
            </div>
            <button 
              onClick={() => setAmbiguousReason(null)}
              className="mt-4 w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 全問題一覧コンポーネント
const AllQuestionsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'week', 'month'

  // 検索かけたときのフィルター関数
  const filterSubjects = () => {
    return subjects.filter(subject => {
      // 科目内の問題をフィルタリング（検索語に一致するもののみ表示）
      const hasMatchingQuestions = subject.chapters.some(chapter => 
        chapter.questions.some(question => 
          searchTerm === '' || question.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      return searchTerm === '' || hasMatchingQuestions;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedQuestions([]);
    } else {
      const allQuestionIds = [];
      subjects.forEach(subject => {
        subject.chapters.forEach(chapter => {
          chapter.questions.forEach(question => {
            allQuestionIds.push(question.id);
          });
        });
      });
      setSelectedQuestions(allQuestionIds);
    }
    setSelectAll(!selectAll);
  };

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

  const filteredSubjects = getFilteredData().filter(subject => {
    // 検索フィルタリングも適用
    return subject.chapters.some(chapter => 
      chapter.questions.some(question => 
        searchTerm === '' || question.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <List className="w-5 h-5 mr-2" />
            全問題一覧
          </h2>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="問題IDで検索..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button 
              onClick={() => setBulkEditMode(!bulkEditMode)}
              className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                bulkEditMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors sm:w-auto w-full`}
            >
              {bulkEditMode ? '選択モード終了' : '一括編集'}
            </button>
          </div>
        </div>
        
        {/* タブフィルター */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            全て
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'today' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            今日
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            今週
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            今月
          </button>
        </div>
      </div>
      
      {bulkEditMode && selectedQuestions.length > 0 && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-indigo-800 font-medium">{selectedQuestions.length}個の問題を選択中</p>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-sm px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                {selectAll ? '全て解除' : '全て選択'}
              </button>
              <button
                onClick={() => setSelectedQuestions([])}
                className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
              >
                選択解除
              </button>
            </div>
          </div>
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
      
      {filteredSubjects.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-lg text-center">
          <p className="text-gray-500">表示できる問題がありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSubjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="flex items-center bg-gray-50 p-4 cursor-pointer border-b border-gray-200"
                onClick={() => toggleSubject(subject.id)}
              >
                <div className="mr-2 text-gray-500 transition-transform duration-200" style={{ 
                  transform: expandedSubjects[subject.id] ? 'rotate(90deg)' : 'rotate(0deg)' 
                }}>
                  <ChevronRight className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-800">{subject.name}</h3>
              </div>
              
              {expandedSubjects[subject.id] && (
                <div className="p-4">
                  {subject.chapters.map(chapter => {
                    // 章内の問題をフィルタリング
                    const filteredQuestions = chapter.questions.filter(question => 
                      searchTerm === '' || question.id.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredQuestions.length === 0) return null;

                    return (
                      <div key={chapter.id} className="mb-4 last:mb-0">
                        <div 
                          className="flex items-center bg-white p-3 rounded-lg cursor-pointer border border-gray-200 hover:bg-gray-50"
                          onClick={() => toggleChapter(chapter.id)}
                        >
                          <div className="mr-2 text-gray-500 transition-transform duration-200" style={{ 
                            transform: expandedChapters[chapter.id] ? 'rotate(90deg)' : 'rotate(0deg)' 
                          }}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                          <h4 className="text-gray-700 font-medium">{chapter.name}</h4>
                          {searchTerm && filteredQuestions.length > 0 && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              {filteredQuestions.length}件一致
                            </span>
                          )}
                        </div>
                        
                        {expandedChapters[chapter.id] && filteredQuestions.length > 0 && (
                          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {bulkEditMode && (
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                      <input 
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        checked={filteredQuestions.every(q => selectedQuestions.includes(q.id))}
                                        onChange={() => {
                                          const allIds = filteredQuestions.map(q => q.id);
                                          if (filteredQuestions.every(q => selectedQuestions.includes(q.id))) {
                                            setSelectedQuestions(prev => prev.filter(id => !allIds.includes(id)));
                                          } else {
                                            setSelectedQuestions(prev => [...new Set([...prev, ...allIds])]);
                                          }
                                        }}
                                      />
                                    </th>
                                  )}
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    問題ID
                                  </th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    解答回数
                                  </th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    次回予定日
                                  </th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    間隔
                                  </th>
                                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {filteredQuestions.map(question => (
                                  <tr key={question.id} className="hover:bg-gray-50">
                                    {bulkEditMode && (
                                      <td className="px-3 py-3 whitespace-nowrap">
                                        <input 
                                          type="checkbox" 
                                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                          checked={selectedQuestions.includes(question.id)}
                                          onChange={() => toggleQuestionSelection(question.id)}
                                        />
                                      </td>
                                    )}
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
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
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-800">{question.answerCount}回</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-800">{formatDate(question.nextDate)}</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-800">{question.interval}</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                      <button 
                                        onClick={() => setEditingQuestion(question)}
                                        className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 transition-colors"
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* 問題編集モーダル（既存のままだがスタイルを改良） */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">問題編集</h3>
            <div className="space-y-4">
              {/* モーダルの内容 */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// スケジュール一覧コンポーネント
const ScheduleView = () => {
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
  
  const calendar = getCalendarData(currentMonth);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const totalQuestionsThisMonth = calendar.flat().reduce((total, day) => {
    return total + (day?.questions?.length || 0);
  }, 0);
  
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          学習スケジュール
        </h2>
        
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
          今月の問題数: {totalQuestionsThisMonth}問
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h3 className="text-2xl font-bold text-gray-800">
            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
          </h3>
          <button 
            onClick={() => changeMonth(1)}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-3 mb-3">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`text-center py-2 font-bold text-sm rounded ${
                index === 0 ? 'text-red-500' : 
                index === 6 ? 'text-blue-500' : 
                'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3">
          {calendar.flat().map((dayData, index) => {
            const isToday = dayData && dayData.date.toDateString() === new Date().toDateString();
            const hasQuestions = dayData && dayData.questions.length > 0;
            
            return (
              <div 
                key={index} 
                className={`min-h-28 border p-2 rounded-xl ${
                  !dayData ? 'bg-gray-50 border-gray-100' :
                  isToday ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-400' :
                  hasQuestions ? 'bg-white border-indigo-200 hover:border-indigo-400 cursor-pointer' :
                  'bg-white border-gray-100'
                } transition-all`}
                onClick={() => {
                  if (dayData && hasQuestions) {
                    // ここで日付をクリックした時の詳細表示などの機能を追加できます
                    alert(`${formatDate(dayData.date)}の問題: ${dayData.questions.length}問`);
                  }
                }}
              >
                {dayData && (
                  <>
                    <div className={`text-right mb-1 font-medium ${
                      isToday ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {dayData.day}
                    </div>
                    {hasQuestions && (
                      <div className="flex flex-col gap-1">
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-bold text-center shadow-sm
                          ${dayData.questions.length > 5 
                            ? 'bg-red-500 text-white' 
                            : dayData.questions.length > 2 
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                          }
                        `}>
                          {dayData.questions.length}問
                        </div>
                        {dayData.questions.length <= 3 && dayData.questions.map((q, i) => (
                          <div key={i} className="text-xs text-gray-700 truncate bg-gray-50 px-2 py-1 rounded-md mt-1">
                            {q.id}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
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
