// App.js
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, List, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import DatePickerCalendar from './DatePickerCalendar';
import QuestionEditModal from './QuestionEditModal';
import BulkEditSection from './BulkEditSection';
import AmbiguousTrendsPage from './AmbiguousTrendsPage';
import { Info } from 'lucide-react';
import EnhancedAllQuestionsView from './EnhancedAllQuestionsView';
import SimplifiedAllQuestionsView from './SimplifiedAllQuestionsView';
import RedesignedAllQuestionsView from './RedesignedAllQuestionsView';
import TopNavigation from './components/TopNavigation';
import TodayView from './TodayView';


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
 // App.js の generateInitialData() 関数内のsubjects配列内にある既存の中小企業経営・政策のコードを
// 以下のコードで置き換えてください（id:1〜5の科目の後に配置します）

{
  id: 6,
  name: "中小企業経営・中小企業政策",
  chapters: [
    { id: 601, name: "中小企業経営/中小企業概論 Q1-1", questions: generateQuestions('1-1', 1, 31) },
    { id: 602, name: "中小企業経営/令和5年度の中小企業の動向 Q1-2", questions: generateQuestions('1-2', 1, 40) },
    { id: 603, name: "中小企業経営/環境変化に対応する中小企業 Q1-3", questions: generateQuestions('1-3', 1, 14) },
    { id: 604, name: "中小企業経営/経営課題に立ち向かう小規模業者業 Q1-4", questions: generateQuestions('1-4', 1, 32) },
    { id: 605, name: "中小企業政策/中小企業政策の基本 Q2-1", questions: generateQuestions('2-1', 1, 14) },
    { id: 606, name: "中小企業政策/中小企業施策 Q2-2", questions: generateQuestions('2-2', 1, 68) },
    { id: 607, name: "中小企業政策/中小企業政策の変遷 Q2-3", questions: generateQuestions('2-3', 1, 1) }
  ]
},
{
  id: 7,
  name: "過去問題集",
  chapters: [
    { id: 701, name: "企業経営理論 令和6年度", questions: generateQuestions('企業経営理論R6', 1, 40) },
    { id: 702, name: "企業経営理論 令和5年度", questions: generateQuestions('企業経営理論R5', 1, 37) },
    { id: 703, name: "企業経営理論 令和4年度", questions: generateQuestions('企業経営理論R4', 1, 37) },
    { id: 704, name: "企業経営理論 令和3年度", questions: generateQuestions('企業経営理論R3', 1, 38) },
    { id: 705, name: "企業経営理論 令和2年度", questions: generateQuestions('企業経営理論R2', 1, 36) },
    { id: 706, name: "運営管理 令和6年度", questions: generateQuestions('運営管理R6', 1, 41) },
    { id: 707, name: "運営管理 令和5年度", questions: generateQuestions('運営管理R5', 1, 37) },
    { id: 708, name: "運営管理 令和4年度", questions: generateQuestions('運営管理R4', 1, 39) },
    { id: 709, name: "運営管理 令和3年度", questions: generateQuestions('運営管理R3', 1, 41) },
    { id: 710, name: "運営管理 令和2年度", questions: generateQuestions('運営管理R2', 1, 42) },
    { id: 711, name: "経済学・経済政策 令和6年度", questions: generateQuestions('経済学R6', 1, 22) },
    { id: 712, name: "経済学・経済政策 令和5年度", questions: generateQuestions('経済学R5', 1, 22) },
    { id: 713, name: "経済学・経済政策 令和4年度", questions: generateQuestions('経済学R4', 1, 21) },
    { id: 714, name: "経済学・経済政策 令和3年度", questions: generateQuestions('経済学R3', 1, 23) },
    { id: 715, name: "経済学・経済政策 令和2年度", questions: generateQuestions('経済学R2', 1, 22) },
    { id: 716, name: "経営情報システム 令和6年度", questions: generateQuestions('経営情報R6', 1, 23) },
    { id: 717, name: "経営情報システム 令和5年度", questions: generateQuestions('経営情報R5', 1, 25) },
    { id: 718, name: "経営情報システム 令和4年度", questions: generateQuestions('経営情報R4', 1, 24) },
    { id: 719, name: "経営情報システム 令和3年度", questions: generateQuestions('経営情報R3', 1, 25) },
    { id: 720, name: "経営情報システム 令和2年度", questions: generateQuestions('経営情報R2', 1, 25) },
    { id: 721, name: "経営法務 令和6年度", questions: generateQuestions('経営法務R6', 1, 24) },
    { id: 722, name: "経営法務 令和5年度", questions: generateQuestions('経営法務R5', 1, 21) },
    { id: 723, name: "経営法務 令和4年度", questions: generateQuestions('経営法務R4', 1, 22) },
    { id: 724, name: "経営法務 令和3年度", questions: generateQuestions('経営法務R3', 1, 20) },
    { id: 725, name: "経営法務 令和2年度", questions: generateQuestions('経営法務R2', 1, 22) },
    { id: 726, name: "中小企業経営・政策 令和6年度", questions: generateQuestions('中小企業R6', 1, 11) },
    { id: 727, name: "中小企業経営・政策 令和5年度", questions: generateQuestions('中小企業R5', 1, 22) },
    { id: 728, name: "中小企業経営・政策 令和4年度", questions: generateQuestions('中小企業R4', 1, 22) },
    { id: 729, name: "中小企業経営・政策 令和3年度", questions: generateQuestions('中小企業R3', 1, 22) },
    { id: 730, name: "中小企業経営・政策 令和2年度", questions: generateQuestions('中小企業R2', 1, 22) }
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
　const [isNavOpen, setIsNavOpen] = useState(false);
  
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
　　　　　　// recordAnswer関数の修正
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
            // 曖昧と理解済みで分岐
            if (understanding.startsWith('曖昧△')) {
              // 曖昧な場合は理由に応じて日数を設定
              const reason = understanding.split(':')[1] || '';
              
              if (reason.includes('偶然正解')) {
                // 偶然正解した → 2日後
                nextDate.setDate(today.getDate() + 2);
                newInterval = '2日';
              } else if (reason.includes('他の選択肢の意味')) {
                // 正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった → 10日後
                nextDate.setDate(today.getDate() + 10);
                newInterval = '10日';
              } else if (reason.includes('別の理由を思い浮かべ') || reason.includes('合っていたが')) {
                // 合っていたが、別の理由を思い浮かべていた → 5日後
                nextDate.setDate(today.getDate() + 5);
                newInterval = '5日';
              } else {
                // その他 → 20日後
                nextDate.setDate(today.getDate() + 20);
                newInterval = '20日';
              }
            } else {
              // 理解済みの場合は従来の間隔延長ルール
              switch(question.interval) {
                case '1日': 
                case '2日': // 追加：「曖昧：偶然正解」からのパターン
                case '5日': // 追加：「曖昧：別の理由」からのパターン
                case '10日': // 追加：「曖昧：他の選択肢」からのパターン
                case '20日': // 追加：「曖昧：その他」からのパターン
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
    // ディープコピーを作成
    const newSubjects = JSON.parse(JSON.stringify(prevSubjects));
    
    selectedQuestions.forEach(questionId => {
      // 全ての科目と章を検索
      for (const subject of newSubjects) {
        for (const chapter of subject.chapters) {
          const questionIndex = chapter.questions.findIndex(q => q.id === questionId);
          
          if (questionIndex !== -1) {
            // 問題が見つかった場合、次回日付を更新
            chapter.questions[questionIndex].nextDate = new Date(date);
            // これ以上検索しない（各IDは一意なはず）
            break;
          }
        }
      }
    });
    
    return newSubjects;
  });
  
  // 関数内に移動
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
 　　// App.js内のTodayView関数コンポーネント
const TodayView = () => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  
  // 追加: 各問題の状態を管理する
  const [questionStates, setQuestionStates] = useState({});
  
  // 問題の回答を記録する関数
  const recordCompleteAnswer = (questionId, isCorrect, understanding) => {
    // 正解/不正解と理解度を記録
    recordAnswer(questionId, isCorrect, understanding);
    
    // 不正解の場合は状態をリセット
    if (!isCorrect) {
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { 
          showAnswered: false,
          showComprehension: false
        }
      }));
    }
  }
  
  // 正解・不正解ボタンを押したときの処理
  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      // 正解の場合: 理解度確認ボタンを表示
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { 
          showAnswered: true,
          showComprehension: true,
          opacity: 1 // 透明度を明示的に1に設定
        }
      }));
    } else {
      // 不正解の場合: 直接記録して次へ
      recordCompleteAnswer(questionId, false, '理解できていない×');
    }
  };
  
  // 曖昧ボタンをクリックした時の処理
  const handleAmbiguousClick = (questionId) => {
    // 同じボタンをもう一度クリックしたら閉じる
    if (expandedAmbiguousId === questionId) {
      setExpandedAmbiguousId(null);
    } else {
      setExpandedAmbiguousId(questionId);
    }
  }
  
  // 曖昧な理由を選択した時の処理
  const selectAmbiguousReason = (questionId, reason) => {
    // 曖昧な理由を含めて記録
    recordAnswer(questionId, true, `曖昧△:${reason}`);
    setExpandedAmbiguousId(null); // 選択後は閉じる
    
    // 状態をリセット
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: { 
        showAnswered: false,
        showComprehension: false
      }
    }));
  }
  
  // 理解済みボタンをクリックしたときの処理
  const handleUnderstandClick = (questionId) => {
    // 理解済みとして記録
    recordCompleteAnswer(questionId, true, '理解○');
    
    // 状態をリセット
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: { 
        showAnswered: false,
        showComprehension: false
      }
    }));
  }
  
  // 問題の初期状態を取得
  const getQuestionState = (questionId) => {
    return questionStates[questionId] || { 
      showAnswered: false,
      showComprehension: false
    };
  };
  
  return (
    <div className="p-6 w-full sm:w-10/12 md:w-8/12 lg:w-7/12 xl:w-6/12 mx-auto pb-20">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center justify-center">
        <Clock className="w-6 h-6 mr-3 text-indigo-500" />
        <span>今日解く問題</span>
        <span className="ml-3 text-lg bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
          {formatDate(new Date())}
        </span>
      </h2>
      
      {todayQuestions.length === 0 ? (
        <div className="card p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <p className="text-indigo-800 font-medium text-lg">今日解く問題はありません 🎉</p>
          <p className="text-indigo-600 mt-2">おつかれさまでした！</p>
        </div>
      ) : (
        <div className="space-y-8">
          {todayQuestions.map(question => {
            // 各問題の現在の状態を取得
            const questionState = getQuestionState(question.id);
            
            return (
              <div key={question.id} className="card p-6">
                {/* 科目情報 */}
                <div className="text-sm text-indigo-600 mb-1 font-medium">{question.subjectName}</div>
                
                {/* 章と問題 */}
                <div className="font-bold text-xl text-gray-800 mb-3">{question.chapterName}</div>
                <div className="inline-block bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-2 rounded-full text-indigo-700 font-medium shadow-sm mb-5 border border-indigo-100">
                  問題 {question.id}
                </div>
                
                {/* 解答結果ボタン - 正解/不正解 */}
                {!questionState.showAnswered && (
                  <div className="mb-5">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      解答結果
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleAnswerClick(question.id, true)}
                        className="flex-1 py-4 px-4 bg-white border-2 border-green-400 text-green-700 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center font-bold shadow-sm"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" /> 正解 ⭕️
                      </button>
                      <button 
                        onClick={() => handleAnswerClick(question.id, false)}
                        className="flex-1 py-4 px-4 bg-white border-2 border-red-400 text-red-700 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center font-bold shadow-sm"
                      >
                        <XCircle className="w-5 h-5 mr-2" /> 不正解 ❌
                      </button>
                    </div>
                  </div>
                )}
                
               {/* 理解度セクション - 正解ボタンを押した後に表示 */}
{questionState.showComprehension && (
  <div className="mb-5 animate-fadeIn" style={{opacity: 1}}>
    <div className="text-sm font-bold text-black mb-3 flex items-center">
      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
      理解度を選択してください
    </div>
    <div className="flex gap-3">
      <button 
        onClick={() => handleUnderstandClick(question.id)}
        className="flex-1 py-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
        style={{opacity: 1}}
      >
        <CheckCircle className="w-5 h-5 mr-2 text-black" />
        <span className="text-lg font-bold" style={{
          color: 'black', 
          opacity: 1,
          textShadow: '0 1px 3px rgba(255,255,255,0.5)'
        }}>理解済み（完全に定着）</span>
      </button>
      <button 
        onClick={() => handleAmbiguousClick(question.id)}
        className={`flex-1 py-4 ${
          expandedAmbiguousId === question.id 
            ? 'bg-gradient-to-br from-amber-500 to-yellow-600' 
            : 'bg-gradient-to-br from-amber-400 to-yellow-500'
        } rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center`}
        style={{opacity: 1}}
      >
        <AlertTriangle className="w-5 h-5 mr-2 text-black" />
        <span className="text-lg font-bold" style={{
          color: 'black', 
          opacity: 1,
          textShadow: '0 1px 3px rgba(255,255,255,0.5)'
        }}>曖昧（記憶の定着に疑問）</span>
        {expandedAmbiguousId === question.id ? ' 🔼' : ' 🔽'}
      </button>
    </div>
  </div>
)}

{/* 曖昧さの理由選択（ドロップダウン） */}
{expandedAmbiguousId === question.id && (
  <div className="mt-4 rounded-xl overflow-hidden border border-yellow-300 animate-fadeIn shadow-lg" style={{opacity: 1}}>
    <div className="bg-gradient-to-r from-amber-300 to-yellow-300 p-4">
      <div className="text-base font-bold text-black" style={{opacity: 1}}>曖昧だった理由を選択してください:</div>
    </div>
    <div className="divide-y divide-yellow-200 bg-white">
      <button 
        onClick={() => selectAmbiguousReason(question.id, '偶然正解した')}
        className="w-full py-4 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
        style={{opacity: 1}}
      >
        <div className="flex items-center">
          <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
          <span className="font-bold text-black" style={{opacity: 1}}>偶然正解した</span>
        </div>
        <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full" style={{opacity: 1}}>2日後</span>
      </button>
      <button 
        onClick={() => selectAmbiguousReason(question.id, '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった')}
        className="w-full py-4 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
        style={{opacity: 1}}
      >
        <div className="flex items-center flex-1 mr-2">
          <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></span>
          <span className="font-bold text-black" style={{opacity: 1}}>正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった</span>
        </div>
        <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full whitespace-nowrap" style={{opacity: 1}}>10日後</span>
      </button>
      <button 
        onClick={() => selectAmbiguousReason(question.id, '合っていたが、別の理由を思い浮かべていた')}
        className="w-full py-4 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
        style={{opacity: 1}}
      >
        <div className="flex items-center">
          <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
          <span className="font-bold text-black" style={{opacity: 1}}>合っていたが、別の理由を思い浮かべていた</span>
        </div>
        <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full" style={{opacity: 1}}>5日後</span>
      </button>
      <button 
        onClick={() => selectAmbiguousReason(question.id, 'その他')}
        className="w-full py-4 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
        style={{opacity: 1}}
      >
        <div className="flex items-center">
          <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
          <span className="font-bold text-black" style={{opacity: 1}}>その他</span>
        </div>
        <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full" style={{opacity: 1}}>20日後</span>
      </button>
    </div>
  </div>
)}

  // 全問題一覧コンポーネント
  const AllQuestionsView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectAll, setSelectAll] = useState(false);
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

    const filteredSubjects = getFilteredData().filter(subject => {
      // 検索フィルタリングも適用
      return subject.chapters.some(chapter => 
        chapter.questions.some(question => 
          searchTerm === '' || question.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    });

    const toggleSelectAll = () => {
      if (selectAll) {
        setSelectedQuestions([]);
      } else {
        const allQuestionIds = [];
        filteredSubjects.forEach(subject => {
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

    return (
      <div className="p-4 max-w-5xl mx-auto pb-20">
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
        
        {bulkEditMode && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
                <span className="text-sm font-medium text-gray-700">全て選択</span>
              </div>
              <span className="text-sm text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                {selectedQuestions.length}問選択中
              </span>
            </div>
          </div>
        )}
        
        {bulkEditMode && selectedQuestions.length > 0 && (
          <BulkEditSection
            selectedQuestions={selectedQuestions}
            setSelectedDate={setSelectedDate}
            selectedDate={selectedDate}
            saveBulkEdit={saveBulkEdit}
          />
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
                                      理解度
                                    </th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      正解率
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
                                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                          question.understanding === '理解○' ? 'bg-green-100 text-green-800' :
                                          question.understanding === '理解できていない×' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {question.understanding}
                                        </span>
                                      </td>
                                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                          <div 
                                            className={`h-2.5 rounded-full ${
                                              question.correctRate >= 80 ? 'bg-green-500' :
                                              question.correctRate >= 60 ? 'bg-lime-500' :
                                              question.correctRate >= 40 ? 'bg-yellow-500' :
                                              question.correctRate >= 20 ? 'bg-orange-500' :
                                              'bg-red-500'
                                            }`}
                                            style={{ width: `${question.correctRate}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1 block">{question.correctRate}%</span>
                                      </td>
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
    
    // 日付の問題を安全に取得
    const safeGetQuestionsForDate = (date) => {
      try {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        return getQuestionsForDate(normalizedDate) || [];
      } catch (error) {
        console.error("日付の問題取得エラー:", error);
        return [];
      }
    };
    
    // カレンダーデータ生成
    const getCalendarData = () => {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
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
              currentDate.setHours(0, 0, 0, 0);
              const questionsForDay = safeGetQuestionsForDate(currentDate);
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
      } catch (error) {
        console.error("カレンダー生成エラー:", error);
        return [];
      }
    };
    
    const calendar = getCalendarData();
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const totalQuestions = subjects.reduce((total, subject) => 
      total + subject.chapters.reduce((chTotal, chapter) => 
        chTotal + chapter.questions.length, 0), 0);
    
    return (
      <div className="p-4 max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            学習スケジュール
          </h2>
          
          <div className="flex items-center bg-white rounded-full shadow-sm px-2 py-1">
            <button 
              onClick={() => changeMonth(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-indigo-600" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-800 mx-2 min-w-28 text-center">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            
            <button 
              onClick={() => changeMonth(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-indigo-600" />
            </button>
            
            <div className="ml-3 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm">
              登録: {totalQuestions}問
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="grid grid-cols-7 gap-3 mb-3">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`text-center py-2 font-bold text-sm rounded-lg ${
                  index === 0 ? 'text-red-600 bg-red-50' : 
                  index === 6 ? 'text-blue-600 bg-blue-50' : 
                  'text-gray-700 bg-gray-50'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-3">
            {calendar.flat().map((dayData, index) => {
              if (!dayData) {
                return (
                  <div key={`empty-${index}`} className="aspect-square bg-gray-50 border border-gray-100 rounded-xl"></div>
                );
              }
              
              const isToday = dayData.date.toDateString() === new Date().toDateString();
              const questionCount = dayData.questions?.length || 0;
              
              // 問題数に応じたスタイル
              let badgeStyle = '';
              let badgeTextColor = 'text-gray-700';
              
              if (questionCount > 10) {
                badgeStyle = 'bg-red-500';
                badgeTextColor = 'text-white';
              } else if (questionCount > 5) {
                badgeStyle = 'bg-orange-500';
                badgeTextColor = 'text-white';
              } else if (questionCount > 0) {
                badgeStyle = 'bg-green-500';
                badgeTextColor = 'text-white';
              } else {
                badgeStyle = 'bg-gray-100';
                badgeTextColor = 'text-gray-400';
              }
              
              return (
                <div 
                  key={`day-${index}`} 
                  className={`relative flex flex-col p-2 rounded-xl border ${
                    isToday 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all'
                  }`}
                >
                  {/* 日付 */}
                  <div className={`text-right font-bold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                    {dayData.day}
                  </div>
                  
                  {/* 問題数 - 常に表示 */}
                  <div className="flex justify-center items-center h-16">
                    <div className={`
                      ${badgeStyle} ${badgeTextColor}
                      font-bold text-lg px-3 py-1.5 rounded-full shadow-sm
                      flex items-center justify-center min-w-10
                      ${questionCount > 10 ? 'animate-pulse' : ''}
                    `}>
                      {questionCount}<span className="ml-0.5">問</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

const MainView = () => {
  switch (activeTab) {
    case 'today':
      return <TodayView 
        getTodayQuestions={getTodayQuestions} 
        recordAnswer={recordAnswer} 
        formatDate={formatDate}
      />;
    case 'schedule':
      return <ScheduleView />;
    case 'all':
      return <RedesignedAllQuestionsView 
        subjects={subjects}
        expandedSubjects={expandedSubjects}
        expandedChapters={expandedChapters}
        toggleSubject={toggleSubject}
        toggleChapter={toggleChapter}
        setEditingQuestion={setEditingQuestion}
        setBulkEditMode={setBulkEditMode}
        bulkEditMode={bulkEditMode}
        selectedQuestions={selectedQuestions}
        setSelectedQuestions={setSelectedQuestions}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        saveBulkEdit={saveBulkEdit}
      />;
    case 'trends':
      return <AmbiguousTrendsPage subjects={subjects} />;
    default:
      return <TodayView 
        getTodayQuestions={getTodayQuestions} 
        recordAnswer={recordAnswer}
        formatDate={formatDate}
      />;
  }
};

// App.jsのreturn部分
return (
  <div className="min-h-screen bg-gray-50">
    <TopNavigation 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
    />
    
    {/* メインコンテンツ */}
    <div>
      {/* ヘッダー・タイトル部分 */}
      <div className="bg-indigo-600 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold tracking-tight text-white">学習スケジュール管理</h1>
          <p className="text-xs text-indigo-100 opacity-90 mt-1">暗記曲線に基づく効率的な学習を実現</p>
        </div>
      </div>
      
      <div className="p-4">
        <MainView />
        
        {/* 問題編集モーダル */}
        {editingQuestion && (
          <QuestionEditModal
            question={editingQuestion}
            onSave={saveQuestionEdit}
            onCancel={() => setEditingQuestion(null)}
          />
        )}
      </div>
    </div>
    
    {/* 通知エリア */}
    <div id="notification-area" className="fixed bottom-4 right-4 z-30"></div>
  </div>
);
}

export default App;
