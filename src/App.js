// src/App.js
import React, { useState, useEffect } from 'react';
// ***修正点: 使用するアイコンを lucide-react からインポート***
import { Calendar, ChevronLeft, ChevronRight, List, Clock, Check, X, AlertTriangle, Info, Search, ChevronsUpDown } from 'lucide-react';
// 他のコンポーネントのインポートはそのまま
import DatePickerCalendar from './DatePickerCalendar';
import QuestionEditModal from './QuestionEditModal';
import BulkEditSection from './BulkEditSection';
import AmbiguousTrendsPage from './AmbiguousTrendsPage';
// import EnhancedAllQuestionsView from './EnhancedAllQuestionsView';
// import SimplifiedAllQuestionsView from './SimplifiedAllQuestionsView';
import RedesignedAllQuestionsView from './RedesignedAllQuestionsView'; // これを使う想定
import TopNavigation from './components/TopNavigation';
import TodayView from './TodayView'; // 外部ファイルからインポート

// ***修正点: generateQuestions で previousUnderstanding を初期化***
function generateQuestions(prefix, start, end) {
  const questions = [];
  for (let i = start; i <= end; i++) {
    const today = new Date();
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + Math.floor(Math.random() * 30)); // 仮の次回日付

    questions.push({
      id: `${prefix}-${i}`,
      number: i,
      correctRate: Math.floor(Math.random() * 100), // 仮の正解率
      lastAnswered: new Date(today.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // 仮の最終解答日
      nextDate: nextDate,
      interval: ['1日', '3日', '7日', '14日', '1ヶ月', '2ヶ月'][Math.floor(Math.random() * 6)], // 仮の間隔
      answerCount: Math.floor(Math.random() * 10), // 仮の解答回数
      understanding: ['理解○', '曖昧△', '理解できていない×'][Math.floor(Math.random() * 3)], // 仮の理解度
      previousUnderstanding: null, // ***追加: 前回の理解度（初期値はnull）***
    });
  }
  return questions;
}

// generateInitialData は generateQuestions を使うので変更なし
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
        { id: 201, name: "生産管理概論 Q1-1", questions: generateQuestions('2-1-1', 1, 10) }, //Prefix変更
        { id: 202, name: "生産のプランニング Q1-2", questions: generateQuestions('2-1-2', 1, 52) }, //Prefix変更
        { id: 203, name: "生産のオペレーション Q1-3", questions: generateQuestions('2-1-3', 1, 35) }, //Prefix変更
        { id: 204, name: "製造業における情報システム Q1-4", questions: generateQuestions('2-1-4', 1, 6) }, //Prefix変更
        { id: 205, name: "店舗・商業集積 Q2-1", questions: generateQuestions('2-2-1', 1, 9) }, //Prefix変更
        { id: 206, name: "商品仕入・販売（マーチャンダイジング） Q2-2", questions: generateQuestions('2-2-2', 1, 23) }, //Prefix変更
        { id: 207, name: "物流・輸配送管理 Q2-3", questions: generateQuestions('2-2-3', 1, 18) }, //Prefix変更
        { id: 208, name: "販売流通情報システム Q2-4", questions: generateQuestions('2-2-4', 1, 17) } //Prefix変更
      ]
    },
    {
      id: 3,
      name: "経済学",
      chapters: [
        { id: 301, name: "企業行動の分析 Q1", questions: generateQuestions('3-1', 1, 19) }, //Prefix変更
        { id: 302, name: "消費者行動の分析 Q2", questions: generateQuestions('3-2', 1, 22) }, //Prefix変更
        { id: 303, name: "市場均衡と厚生分析 Q3", questions: generateQuestions('3-3', 1, 23) }, //Prefix変更
        { id: 304, name: "不完全競争 Q4", questions: generateQuestions('3-4', 1, 15) }, //Prefix変更
        { id: 305, name: "市場の失敗と政府の役割 Q5", questions: generateQuestions('3-5', 1, 15) }, //Prefix変更
        { id: 306, name: "国民経済計算と主要経済指標 Q6", questions: generateQuestions('3-6', 1, 13) }, //Prefix変更
        { id: 307, name: "財市場の分析 Q7", questions: generateQuestions('3-7', 1, 11) }, //Prefix変更
        { id: 308, name: "貨幣市場とIS-LM分析 Q8", questions: generateQuestions('3-8', 1, 14) }, //Prefix変更
        { id: 309, name: "雇用と物価水準 Q9", questions: generateQuestions('3-9', 1, 8) }, //Prefix変更
        { id: 310, name: "消費、投資、財政金融政策に関する理論 Q10", questions: generateQuestions('3-10', 1, 11) }, //Prefix変更
        { id: 311, name: "国際マクロ経済 Q11", questions: generateQuestions('3-11', 1, 6) }, //Prefix変更
        { id: 312, name: "景気循環と経済成長 Q12", questions: generateQuestions('3-12', 1, 3) } //Prefix変更
      ]
    },
    {
      id: 4,
      name: "経営情報システム",
      chapters: [
        { id: 401, name: "情報技術に関する基礎知識 Q1", questions: generateQuestions('4-1', 1, 178) }, //Prefix変更
        { id: 402, name: "ソフトウェア開発 Q2", questions: generateQuestions('4-2', 1, 38) }, //Prefix変更
        { id: 403, name: "経営情報管理 Q3", questions: generateQuestions('4-3', 1, 35) }, //Prefix変更
        { id: 404, name: "統計解析 Q4", questions: generateQuestions('4-4', 1, 9) } //Prefix変更
      ]
    },
    {
      id: 5,
      name: "経営法務",
      chapters: [
        { id: 501, name: "民法その他の知識 Q1", questions: generateQuestions('5-1', 1, 54) }, //Prefix変更
        { id: 502, name: "会社法等に関する知識 Q2", questions: generateQuestions('5-2', 1, 123) }, //Prefix変更
        { id: 503, name: "資本市場に関する知識 Q3", questions: generateQuestions('5-3', 1, 12) }, //Prefix変更
        { id: 504, name: "倒産等に関する知識 Q4", questions: generateQuestions('5-4', 1, 16) }, //Prefix変更
        { id: 505, name: "知的財産権等に関する知識 Q5", questions: generateQuestions('5-5', 1, 107) }, //Prefix変更
        { id: 506, name: "その他経営法務に関する知識 Q6", questions: generateQuestions('5-6', 1, 19) } //Prefix変更
      ]
    },
    {
      id: 6,
      name: "中小企業経営・中小企業政策",
      chapters: [
        { id: 601, name: "中小企業経営/中小企業概論 Q1-1", questions: generateQuestions('6-1-1', 1, 31) }, //Prefix変更
        { id: 602, name: "中小企業経営/令和5年度の中小企業の動向 Q1-2", questions: generateQuestions('6-1-2', 1, 40) }, //Prefix変更
        { id: 603, name: "中小企業経営/環境変化に対応する中小企業 Q1-3", questions: generateQuestions('6-1-3', 1, 14) }, //Prefix変更
        { id: 604, name: "中小企業経営/経営課題に立ち向かう小規模業者業 Q1-4", questions: generateQuestions('6-1-4', 1, 32) }, //Prefix変更
        { id: 605, name: "中小企業政策/中小企業政策の基本 Q2-1", questions: generateQuestions('6-2-1', 1, 14) }, //Prefix変更
        { id: 606, name: "中小企業政策/中小企業施策 Q2-2", questions: generateQuestions('6-2-2', 1, 68) }, //Prefix変更
        { id: 607, name: "中小企業政策/中小企業政策の変遷 Q2-3", questions: generateQuestions('6-2-3', 1, 1) } //Prefix変更
      ]
    },
    {
      id: 7,
      name: "過去問題集",
      chapters: [
        { id: 701, name: "企業経営理論 令和6年度", questions: generateQuestions('7-R6-Keiei', 1, 40) }, //Prefix変更
        { id: 702, name: "企業経営理論 令和5年度", questions: generateQuestions('7-R5-Keiei', 1, 37) }, //Prefix変更
        { id: 703, name: "企業経営理論 令和4年度", questions: generateQuestions('7-R4-Keiei', 1, 37) }, //Prefix変更
        { id: 704, name: "企業経営理論 令和3年度", questions: generateQuestions('7-R3-Keiei', 1, 38) }, //Prefix変更
        { id: 705, name: "企業経営理論 令和2年度", questions: generateQuestions('7-R2-Keiei', 1, 36) }, //Prefix変更
        { id: 706, name: "運営管理 令和6年度", questions: generateQuestions('7-R6-Unei', 1, 41) }, //Prefix変更
        { id: 707, name: "運営管理 令和5年度", questions: generateQuestions('7-R5-Unei', 1, 37) }, //Prefix変更
        { id: 708, name: "運営管理 令和4年度", questions: generateQuestions('7-R4-Unei', 1, 39) }, //Prefix変更
        { id: 709, name: "運営管理 令和3年度", questions: generateQuestions('7-R3-Unei', 1, 41) }, //Prefix変更
        { id: 710, name: "運営管理 令和2年度", questions: generateQuestions('7-R2-Unei', 1, 42) }, //Prefix変更
        { id: 711, name: "経済学・経済政策 令和6年度", questions: generateQuestions('7-R6-Keizai', 1, 22) }, //Prefix変更
        { id: 712, name: "経済学・経済政策 令和5年度", questions: generateQuestions('7-R5-Keizai', 1, 22) }, //Prefix変更
        { id: 713, name: "経済学・経済政策 令和4年度", questions: generateQuestions('7-R4-Keizai', 1, 21) }, //Prefix変更
        { id: 714, name: "経済学・経済政策 令和3年度", questions: generateQuestions('7-R3-Keizai', 1, 23) }, //Prefix変更
        { id: 715, name: "経済学・経済政策 令和2年度", questions: generateQuestions('7-R2-Keizai', 1, 22) }, //Prefix変更
        { id: 716, name: "経営情報システム 令和6年度", questions: generateQuestions('7-R6-Joho', 1, 23) }, //Prefix変更
        { id: 717, name: "経営情報システム 令和5年度", questions: generateQuestions('7-R5-Joho', 1, 25) }, //Prefix変更
        { id: 718, name: "経営情報システム 令和4年度", questions: generateQuestions('7-R4-Joho', 1, 24) }, //Prefix変更
        { id: 719, name: "経営情報システム 令和3年度", questions: generateQuestions('7-R3-Joho', 1, 25) }, //Prefix変更
        { id: 720, name: "経営情報システム 令和2年度", questions: generateQuestions('7-R2-Joho', 1, 25) }, //Prefix変更
        { id: 721, name: "経営法務 令和6年度", questions: generateQuestions('7-R6-Homu', 1, 24) }, //Prefix変更
        { id: 722, name: "経営法務 令和5年度", questions: generateQuestions('7-R5-Homu', 1, 21) }, //Prefix変更
        { id: 723, name: "経営法務 令和4年度", questions: generateQuestions('7-R4-Homu', 1, 22) }, //Prefix変更
        { id: 724, name: "経営法務 令和3年度", questions: generateQuestions('7-R3-Homu', 1, 20) }, //Prefix変更
        { id: 725, name: "経営法務 令和2年度", questions: generateQuestions('7-R2-Homu', 1, 22) }, //Prefix変更
        { id: 726, name: "中小企業経営・政策 令和6年度", questions: generateQuestions('7-R6-Chusho', 1, 11) }, //Prefix変更
        { id: 727, name: "中小企業経営・政策 令和5年度", questions: generateQuestions('7-R5-Chusho', 1, 22) }, //Prefix変更
        { id: 728, name: "中小企業経営・政策 令和4年度", questions: generateQuestions('7-R4-Chusho', 1, 22) }, //Prefix変更
        { id: 729, name: "中小企業経営・政策 令和3年度", questions: generateQuestions('7-R3-Chusho', 1, 22) }, //Prefix変更
        { id: 730, name: "中小企業経営・政策 令和2年度", questions: generateQuestions('7-R2-Chusho', 1, 22) } //Prefix変更
      ]
    }
  ];

  return subjects;
};

// 正解率計算ロジックを関数化
function calculateCorrectRate(question, isCorrect) {
  const currentCount = question.answerCount || 0;
  const currentRate = question.correctRate || 0;
  if (currentCount === 0) {
    return isCorrect ? 100 : 0;
  }
  const newRate = isCorrect
    ? (currentRate * currentCount + 100) / (currentCount + 1)
    : (currentRate * currentCount) / (currentCount + 1);
  return Math.round(newRate);
}

// アプリケーションのメインコンポーネント
function App() {
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  // 他のuseStateフックは変更なし
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  // isNavOpen は TopNavigation で管理されているようなので削除

  // 初期データのロード (変更なし)
  useEffect(() => {
    const savedData = localStorage.getItem('studyData');
    let dataToSet;
    if (savedData) {
      try {
        dataToSet = JSON.parse(savedData);
        // Dateオブジェクトの復元 (例)
        dataToSet.forEach(subject => {
            subject.chapters.forEach(chapter => {
                chapter.questions.forEach(q => {
                    q.lastAnswered = new Date(q.lastAnswered);
                    q.nextDate = new Date(q.nextDate);
                });
            });
        });
        console.log('保存された学習データを読み込みました');
      } catch (e) {
        console.error('保存データの読み込みに失敗:', e);
        dataToSet = generateInitialData();
      }
    } else {
      dataToSet = generateInitialData();
      console.log('初期データを生成しました');
    }
    setSubjects(dataToSet);

    // 初期展開状態の設定 (変更なし)
    const initialExpandedSubjects = {};
    dataToSet.forEach(subject => {
      initialExpandedSubjects[subject.id] = false;
    });
    if (dataToSet.length > 0) {
        initialExpandedSubjects[dataToSet[0].id] = true; // 最初の科目だけ展開
    }
    setExpandedSubjects(initialExpandedSubjects);

  }, []);

  // データ保存 (変更なし)
  useEffect(() => {
    if (subjects.length > 0) {
      // Dateオブジェクトを文字列に変換して保存（より安全な方法）
      const dataToSave = JSON.stringify(subjects, (key, value) => {
          if (value instanceof Date) {
              return value.toISOString();
          }
          return value;
      });
      localStorage.setItem('studyData', dataToSave);
      console.log('学習データを保存しました');
    }
  }, [subjects]);

  // getTodayQuestions (変更なし)
  const getTodayQuestions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const questions = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        chapter.questions.forEach(question => {
          // nextDateが文字列の場合、Dateオブジェクトに変換
          const nextDate = new Date(question.nextDate);
          if (isNaN(nextDate.getTime())) {
              console.error("無効な日付:", question.nextDate, "問題ID:", question.id);
              return; // 無効な日付はスキップ
          }
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

  // getQuestionsForDate (変更なし)
  const getQuestionsForDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const questions = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        chapter.questions.forEach(question => {
          const nextDate = new Date(question.nextDate);
           if (isNaN(nextDate.getTime())) {
              console.error("無効な日付:", question.nextDate, "問題ID:", question.id);
              return; // 無効な日付はスキップ
          }
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

  // toggleSubject, toggleChapter (変更なし)

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

  // ***修正点: recordAnswer 関数を要件定義v3に合わせて修正***
  const recordAnswer = (questionId, isCorrect, understanding) => {
    setSubjects(prevSubjects => {
      // stateの更新は不変性(immutability)を保つことが重要
      // JSON変換は深いコピーにはなるが、Dateオブジェクトなどが失われる可能性あり
      // マップを使って新しい配列を作成する方が安全
      const newSubjects = prevSubjects.map(subject => ({
        ...subject,
        chapters: subject.chapters.map(chapter => ({
          ...chapter,
          questions: chapter.questions.map(q => {
            if (q.id === questionId) {
              // --- ここからが更新ロジック ---
              const question = { ...q }; // 更新対象の問題をコピー
              const previousUnderstanding = question.understanding; // 前回の理解度を保持
              const today = new Date();
              let nextDate = new Date();
              let newInterval = '';

              if (understanding.startsWith('曖昧△')) {
                // 今回「曖昧△」と評価した場合、一律8日後
                nextDate.setDate(today.getDate() + 8);
                newInterval = '8日';
                // 理由は記録するが、スケジュールには影響しない
                 const reason = understanding.split(':')[1] || '';
                 console.log("曖昧理由:", reason); // コンソールで確認

              } else if (isCorrect && understanding === '理解○') {
                // 今回「理解○」かつ「正解」の場合
                if (previousUnderstanding && previousUnderstanding.startsWith('曖昧△')) {
                  // 【要件】前回「曖昧△」だった場合は14日後にする
                  nextDate.setDate(today.getDate() + 14);
                  newInterval = '14日';
                  console.log("前回曖昧からの復帰: 14日後");
                } else {
                  // 【要件との差分あり/要確認】通常の正解ルール（ユーザー提供のロジックを維持）
                   // ※注意: ここのswitch文は要件定義v3の厳密な暗記曲線ルールと一部異なります。
                   // (例: 1日後や2日後でも次は3日後になる等)
                   // もし要件定義のルールに厳密に合わせる場合は、ここのcaseを修正してください。
                   switch(question.interval) {
                       case '1日': case '2日': case '5日': case '8日': case '10日': case '15日': case '20日':
                           nextDate.setDate(today.getDate() + 3); newInterval = '3日'; break;
                       case '3日': nextDate.setDate(today.getDate() + 7); newInterval = '7日'; break;
                       case '7日': nextDate.setDate(today.getDate() + 14); newInterval = '14日'; break;
                       case '14日': nextDate.setMonth(today.getMonth() + 1); newInterval = '1ヶ月'; break;
                       case '1ヶ月': nextDate.setMonth(today.getMonth() + 2); newInterval = '2ヶ月'; break;
                       case '2ヶ月': default: nextDate.setMonth(today.getMonth() + 2); newInterval = '2ヶ月'; break; // 初回正解もここ
                   }
                }
              } else if (!isCorrect) {
                // 不正解の場合 (understandingが'理解できていない×'のはず)
                nextDate.setDate(today.getDate() + 1);
                newInterval = '1日';
              } else {
                // 通常発生しないはずだが、念のためログ出力
                console.warn("未定義の解答状態:", {isCorrect, understanding});
                // フォールバックとして翌日に設定
                 nextDate.setDate(today.getDate() + 1);
                 newInterval = '1日';
              }

              // 更新された問題オブジェクトを返す
              return {
                ...question,
                lastAnswered: today.toISOString(), // ISO文字列で保存推奨
                nextDate: nextDate.toISOString(),   // ISO文字列で保存推奨
                interval: newInterval,
                answerCount: (question.answerCount || 0) + 1,
                understanding: understanding, // 今回の理解度
                previousUnderstanding: previousUnderstanding, // 前回の理解度を保存
                correctRate: calculateCorrectRate(question, isCorrect),
              };
              // --- 更新ロジックここまで ---
            }
            return q; // IDが一致しない問題はそのまま返す
          })
        }))
      }));

      console.log("学習データが更新されました。");
      return newSubjects; // 更新後の新しい配列を返す
    });
  };


  // saveQuestionEdit, saveBulkEdit, toggleQuestionSelection (変更なし)
   const saveQuestionEdit = (questionData) => {
    setSubjects(prevSubjects => {
      const newSubjects = prevSubjects.map(subject => ({
          ...subject,
          chapters: subject.chapters.map(chapter => ({
              ...chapter,
              questions: chapter.questions.map(q => {
                  if (q.id === questionData.id) {
                      // nextDateとlastAnsweredが文字列の場合、Dateオブジェクトに戻す必要があるかも
                      return {
                          ...questionData,
                          nextDate: new Date(questionData.nextDate),
                          lastAnswered: new Date(questionData.lastAnswered)
                      };
                  }
                  return q;
              })
          }))
      }));
      return newSubjects;
    });
    setEditingQuestion(null);
  };

   const saveBulkEdit = (date) => {
      const targetDate = new Date(date); // Dateオブジェクトに変換
      if (isNaN(targetDate.getTime())) {
          console.error("無効な一括編集日付:", date);
          return; // 無効な日付の場合は処理を中断
      }
      targetDate.setHours(0, 0, 0, 0); // 時刻をリセット

      setSubjects(prevSubjects => {
        const newSubjects = prevSubjects.map(subject => ({
            ...subject,
            chapters: subject.chapters.map(chapter => ({
                ...chapter,
                questions: chapter.questions.map(q => {
                    if (selectedQuestions.includes(q.id)) {
                        return { ...q, nextDate: targetDate.toISOString() }; // ISO文字列で保存
                    }
                    return q;
                })
            }))
        }));
        return newSubjects;
      });

      setBulkEditMode(false);
      setSelectedQuestions([]);
   };

   const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // formatDate (変更なし)
   const formatDate = (date) => {
    // date が Date オブジェクトでない場合があるためチェック
    const d = date instanceof Date ? date : new Date(date);
     if (isNaN(d.getTime())) {
        return '無効な日付'; // 無効な場合はエラー表示
    }
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };


  // MainView (変更なし、RedesignedAllQuestionsViewを使用)
  const MainView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView
          getTodayQuestions={getTodayQuestions}
          recordAnswer={recordAnswer}
          formatDate={formatDate}
        />;
      case 'schedule':
        return <ScheduleView />; // ScheduleViewコンポーネントは別途定義が必要
      case 'all':
         // AllQuestionsView の代わりに RedesignedAllQuestionsView を使用
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
          setSelectedQuestions={setSelectedQuestions} // 渡す
          //selectedDate={selectedDate} // Redesigned に不要なら削除
          //setSelectedDate={setSelectedDate} // Redesigned に不要なら削除
          saveBulkEdit={saveBulkEdit}
          formatDate={formatDate} // formatDate を渡す
          toggleQuestionSelection={toggleQuestionSelection} // 渡す
        />;
      case 'trends':
        return <AmbiguousTrendsPage subjects={subjects} />; // 必要に応じてPropsを渡す
      default:
        return <TodayView
          getTodayQuestions={getTodayQuestions}
          recordAnswer={recordAnswer}
          formatDate={formatDate}
        />;
    }
  };

  // ScheduleView の仮定義（カレンダー表示用、中身はApp.jsから移動または別途実装）
  const ScheduleView = () => {
    // App.js内にあったカレンダーロジックをここに移動するか、
    // DatePickerCalendar コンポーネントなどを利用する
    // return <div>スケジュール表示（実装中）</div>;

     // App.js内にあったカレンダー関連のstateとロジックを流用
     // 注意: App.js の ScheduleView と内容が重複しないように！
     // App.js側のScheduleViewの定義は削除するか、こちらに完全に統合する
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const changeMonth = (offset) => {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + offset);
      setCurrentMonth(newMonth);
    };

    const safeGetQuestionsForDate = (date) => {
        try {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        return getQuestionsForDate(normalizedDate) || []; // App.jsの関数を呼び出す
        } catch (error) {
        console.error("日付の問題取得エラー:", error);
        return [];
        }
    };

    const getCalendarData = () => {
        // App.jsのgetCalendarDataのロジックをそのまま使用
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


    // JSX部分 (App.jsから流用)
     return (
      <div className="p-4 max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            学習スケジュール
          </h2>
          <div className="flex items-center bg-white rounded-full shadow-sm px-2 py-1 mt-2 md:mt-0">
            <button
              onClick={() => changeMonth(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-indigo-600" />
            </button>
            <h3 className="text-lg font-bold text-gray-800 mx-2 min-w-[120px] text-center"> {/* min-w調整 */}
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h3>
            <button
              onClick={() => changeMonth(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-indigo-600" />
            </button>
             {/* Total Questions Badge - Optional */}
             <div className="ml-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm whitespace-nowrap"> {/* padding/fontsize調整 */}
               登録: {totalQuestions}問
             </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2"> {/* gap調整 */}
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${ // padding/fontsize調整
                  index === 0 ? 'text-red-600 bg-red-50' :
                  index === 6 ? 'text-blue-600 bg-blue-50' :
                  'text-gray-700 bg-gray-50'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2"> {/* gap調整 */}
            {calendar.flat().map((dayData, index) => {
              if (!dayData) {
                return (
                  <div key={`empty-${index}`} className="aspect-square bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl"></div> {/* 角丸調整 */}
                );
              }
              const isToday = dayData.date.toDateString() === new Date().toDateString();
              const questionCount = dayData.questions?.length || 0;

              let badgeStyle = '';
              let badgeTextColor = 'text-gray-700';
              if (questionCount > 10) { badgeStyle = 'bg-red-500'; badgeTextColor = 'text-white'; }
              else if (questionCount > 5) { badgeStyle = 'bg-orange-500'; badgeTextColor = 'text-white'; }
              else if (questionCount > 0) { badgeStyle = 'bg-green-500'; badgeTextColor = 'text-white'; }
              else { badgeStyle = 'bg-gray-100'; badgeTextColor = 'text-gray-400'; }

              return (
                <div
                  key={`day-${index}`}
                  className={`relative flex flex-col p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${ // padding/角丸調整
                    isToday
                      ? 'bg-blue-50 border-blue-300 ring-1 sm:ring-2 ring-blue-400 shadow-sm' // ring調整
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all'
                  }`}
                >
                  <div className={`text-right font-bold text-xs sm:text-sm ${isToday ? 'text-blue-700' : 'text-gray-700'}`}> {/* fontsize調整 */}
                    {dayData.day}
                  </div>
                  {/* Badge container with fixed height */}
                  <div className="flex justify-center items-center flex-grow min-h-[40px] sm:min-h-[60px]"> {/* min-h追加 */}
                     {questionCount > 0 && ( // Display badge only if count > 0
                        <div className={`
                            ${badgeStyle} ${badgeTextColor}
                            font-bold text-sm sm:text-lg px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm
                            flex items-center justify-center min-w-[30px] sm:min-w-[40px] // min-w調整
                            ${questionCount > 10 ? 'animate-pulse' : ''}
                        `}>
                            {questionCount}<span className="text-xs ml-0.5">問</span> {/* fontsize調整 */}
                        </div>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };


  // Appコンポーネントのreturn部分 (変更なし)
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div>
         {/* ヘッダー部分を TopNavigation の外に移動 */}
         <div className="bg-indigo-600 p-4 sm:p-6"> {/* padding調整 */}
           <div className="max-w-5xl mx-auto">
             <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">学習スケジュール管理</h1>
             <p className="text-xs text-indigo-100 opacity-90 mt-1">暗記曲線に基づく効率的な学習を実現</p>
           </div>
         </div>

        {/* メインコンテンツエリア */}
        <div className="p-0 sm:p-4"> {/* 外側のpaddingを調整 */}
          <MainView />
          {editingQuestion && (
            <QuestionEditModal
              question={editingQuestion}
              onSave={saveQuestionEdit}
              onCancel={() => setEditingQuestion(null)}
              formatDate={formatDate} // formatDateを渡す
            />
          )}
        </div>
      </div>

      <div id="notification-area" className="fixed bottom-4 right-4 z-30"></div>
    </div>
  );
}

export default App;
