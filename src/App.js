// src/App.js (解答履歴記録機能を追加 - 本当に完全版！)
import React, { useState, useEffect } from 'react';
// lucide-react のインポート
import { Calendar, ChevronLeft, ChevronRight, List, Check, X, AlertTriangle, Info, Search, ChevronsUpDown } from 'lucide-react';
// 他のコンポーネントインポート
import QuestionEditModal from './QuestionEditModal';
import AmbiguousTrendsPage from './AmbiguousTrendsPage';
import RedesignedAllQuestionsView from './RedesignedAllQuestionsView';
import TopNavigation from './components/TopNavigation';
import TodayView from './TodayView';
import ScheduleView from './ScheduleView';
// import DatePickerCalendar from './DatePickerCalendar'; // App.js では直接使われていない可能性
// import BulkEditSection from './BulkEditSection'; // App.js では直接使われていない可能性

// 問題生成関数
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
            lastAnswered: new Date(today.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Dateオブジェクトで保持
            nextDate: nextDate.toISOString(), // ISO文字列で初期化 (保存・読み込み時に Date に変換)
            interval: ['1日', '3日', '7日', '14日', '1ヶ月', '2ヶ月'][Math.floor(Math.random() * 6)],
            answerCount: Math.floor(Math.random() * 10),
            understanding: ['理解○', '曖昧△', '理解できていない×'][Math.floor(Math.random() * 3)],
            previousUnderstanding: null,
            // comment: '', // コメント機能用のフィールド (将来追加)
        });
    }
    return questions;
}

// 初期データ生成関数
const generateInitialData = () => {
     const subjects = [
    {
      id: 1, name: "経営管理論", chapters: [
        { id: 101, name: "企業活動と経営戦略の全体概要 Q1-1", questions: generateQuestions('1-1', 1, 2) }, { id: 102, name: "事業戦略（競争戦略） Q1-2", questions: generateQuestions('1-2', 1, 16) },
        { id: 103, name: "企業戦略（成長戦略） Q1-3", questions: generateQuestions('1-3', 1, 27) }, { id: 104, name: "技術経営 Q1-4", questions: generateQuestions('1-4', 1, 14) },
        { id: 105, name: "企業の社会的責任（CSR）とコーポレートガバナンス Q1-5", questions: generateQuestions('1-5', 1, 5) }, { id: 106, name: "組織構造論 Q2-1", questions: generateQuestions('2-1', 1, 18) },
        { id: 107, name: "組織行動論 Q2-2", questions: generateQuestions('2-2', 1, 21) }, { id: 108, name: "人的資源管理 Q2-3", questions: generateQuestions('2-3', 1, 12) },
        { id: 109, name: "マーケティングの基礎概念 Q3-1", questions: generateQuestions('3-1', 1, 2) }, { id: 110, name: "マーケティングマネジメント戦略の展開 Q3-2", questions: generateQuestions('3-2', 1, 5) },
        { id: 111, name: "マーケティングリサーチ Q3-3", questions: generateQuestions('3-3', 1, 4) }, { id: 112, name: "消費者購買行動と組織購買行動 Q3-4", questions: generateQuestions('3-4', 1, 8) },
        { id: 113, name: "製品戦略 Q3-5", questions: generateQuestions('3-5', 1, 13) }, { id: 114, name: "価格戦略 Q3-6", questions: generateQuestions('3-6', 1, 8) },
        { id: 115, name: "チャネル・物流戦略 Q3-7", questions: generateQuestions('3-7', 1, 7) }, { id: 116, name: "プロモーション戦略 Q3-8", questions: generateQuestions('3-8', 1, 7) },
        { id: 117, name: "関係性マーケティングとデジタルマーケティング Q3-9", questions: generateQuestions('3-9', 1, 4) }
      ]
    },
    {
      id: 2, name: "運営管理", chapters: [
        { id: 201, name: "生産管理概論 Q1-1", questions: generateQuestions('2-1-1', 1, 10) }, { id: 202, name: "生産のプランニング Q1-2", questions: generateQuestions('2-1-2', 1, 52) },
        { id: 203, name: "生産のオペレーション Q1-3", questions: generateQuestions('2-1-3', 1, 35) }, { id: 204, name: "製造業における情報システム Q1-4", questions: generateQuestions('2-1-4', 1, 6) },
        { id: 205, name: "店舗・商業集積 Q2-1", questions: generateQuestions('2-2-1', 1, 9) }, { id: 206, name: "商品仕入・販売（マーチャンダイジング） Q2-2", questions: generateQuestions('2-2-2', 1, 23) },
        { id: 207, name: "物流・輸配送管理 Q2-3", questions: generateQuestions('2-2-3', 1, 18) }, { id: 208, name: "販売流通情報システム Q2-4", questions: generateQuestions('2-2-4', 1, 17) }
      ]
    },
    {
      id: 3, name: "経済学", chapters: [
        { id: 301, name: "企業行動の分析 Q1", questions: generateQuestions('3-1', 1, 19) }, { id: 302, name: "消費者行動の分析 Q2", questions: generateQuestions('3-2', 1, 22) },
        { id: 303, name: "市場均衡と厚生分析 Q3", questions: generateQuestions('3-3', 1, 23) }, { id: 304, name: "不完全競争 Q4", questions: generateQuestions('3-4', 1, 15) },
        { id: 305, name: "市場の失敗と政府の役割 Q5", questions: generateQuestions('3-5', 1, 15) }, { id: 306, name: "国民経済計算と主要経済指標 Q6", questions: generateQuestions('3-6', 1, 13) },
        { id: 307, name: "財市場の分析 Q7", questions: generateQuestions('3-7', 1, 11) }, { id: 308, name: "貨幣市場とIS-LM分析 Q8", questions: generateQuestions('3-8', 1, 14) },
        { id: 309, name: "雇用と物価水準 Q9", questions: generateQuestions('3-9', 1, 8) }, { id: 310, name: "消費、投資、財政金融政策に関する理論 Q10", questions: generateQuestions('3-10', 1, 11) },
        { id: 311, name: "国際マクロ経済 Q11", questions: generateQuestions('3-11', 1, 6) }, { id: 312, name: "景気循環と経済成長 Q12", questions: generateQuestions('3-12', 1, 3) }
      ]
    },
     {
      id: 4, name: "経営情報システム", chapters: [
        { id: 401, name: "情報技術に関する基礎知識 Q1", questions: generateQuestions('4-1', 1, 178) }, { id: 402, name: "ソフトウェア開発 Q2", questions: generateQuestions('4-2', 1, 38) },
        { id: 403, name: "経営情報管理 Q3", questions: generateQuestions('4-3', 1, 35) }, { id: 404, name: "統計解析 Q4", questions: generateQuestions('4-4', 1, 9) }
      ]
    },
    {
      id: 5, name: "経営法務", chapters: [
        { id: 501, name: "民法その他の知識 Q1", questions: generateQuestions('5-1', 1, 54) }, { id: 502, name: "会社法等に関する知識 Q2", questions: generateQuestions('5-2', 1, 123) },
        { id: 503, name: "資本市場に関する知識 Q3", questions: generateQuestions('5-3', 1, 12) }, { id: 504, name: "倒産等に関する知識 Q4", questions: generateQuestions('5-4', 1, 16) },
        { id: 505, name: "知的財産権等に関する知識 Q5", questions: generateQuestions('5-5', 1, 107) }, { id: 506, name: "その他経営法務に関する知識 Q6", questions: generateQuestions('5-6', 1, 19) }
      ]
    },
    {
      id: 6, name: "中小企業経営・中小企業政策", chapters: [
        { id: 601, name: "中小企業経営/中小企業概論 Q1-1", questions: generateQuestions('6-1-1', 1, 31) }, { id: 602, name: "中小企業経営/令和5年度の中小企業の動向 Q1-2", questions: generateQuestions('6-1-2', 1, 40) },
        { id: 603, name: "中小企業経営/環境変化に対応する中小企業 Q1-3", questions: generateQuestions('6-1-3', 1, 14) }, { id: 604, name: "中小企業経営/経営課題に立ち向かう小規模業者業 Q1-4", questions: generateQuestions('6-1-4', 1, 32) },
        { id: 605, name: "中小企業政策/中小企業政策の基本 Q2-1", questions: generateQuestions('6-2-1', 1, 14) }, { id: 606, name: "中小企業政策/中小企業施策 Q2-2", questions: generateQuestions('6-2-2', 1, 68) },
        { id: 607, name: "中小企業政策/中小企業政策の変遷 Q2-3", questions: generateQuestions('6-2-3', 1, 1) }
      ]
    },
     {
      id: 7, name: "過去問題集", chapters: [
        { id: 701, name: "企業経営理論 令和6年度", questions: generateQuestions('7-R6-Keiei', 1, 40) }, { id: 702, name: "企業経営理論 令和5年度", questions: generateQuestions('7-R5-Keiei', 1, 37) },
        { id: 703, name: "企業経営理論 令和4年度", questions: generateQuestions('7-R4-Keiei', 1, 37) }, { id: 704, name: "企業経営理論 令和3年度", questions: generateQuestions('7-R3-Keiei', 1, 38) },
        { id: 705, name: "企業経営理論 令和2年度", questions: generateQuestions('7-R2-Keiei', 1, 36) }, { id: 706, name: "運営管理 令和6年度", questions: generateQuestions('7-R6-Unei', 1, 41) },
        { id: 707, name: "運営管理 令和5年度", questions: generateQuestions('7-R5-Unei', 1, 37) }, { id: 708, name: "運営管理 令和4年度", questions: generateQuestions('7-R4-Unei', 1, 39) },
        { id: 709, name: "運営管理 令和3年度", questions: generateQuestions('7-R3-Unei', 1, 41) }, { id: 710, name: "運営管理 令和2年度", questions: generateQuestions('7-R2-Unei', 1, 42) },
        { id: 711, name: "経済学・経済政策 令和6年度", questions: generateQuestions('7-R6-Keizai', 1, 22) }, { id: 712, name: "経済学・経済政策 令和5年度", questions: generateQuestions('7-R5-Keizai', 1, 22) },
        { id: 713, name: "経済学・経済政策 令和4年度", questions: generateQuestions('7-R4-Keizai', 1, 21) }, { id: 714, name: "経済学・経済政策 令和3年度", questions: generateQuestions('7-R3-Keizai', 1, 23) },
        { id: 715, name: "経済学・経済政策 令和2年度", questions: generateQuestions('7-R2-Keizai', 1, 22) }, { id: 716, name: "経営情報システム 令和6年度", questions: generateQuestions('7-R6-Joho', 1, 23) },
        { id: 717, name: "経営情報システム 令和5年度", questions: generateQuestions('7-R5-Joho', 1, 25) }, { id: 718, name: "経営情報システム 令和4年度", questions: generateQuestions('7-R4-Joho', 1, 24) },
        { id: 719, name: "経営情報システム 令和3年度", questions: generateQuestions('7-R3-Joho', 1, 25) }, { id: 720, name: "経営情報システム 令和2年度", questions: generateQuestions('7-R2-Joho', 1, 25) },
        { id: 721, name: "経営法務 令和6年度", questions: generateQuestions('7-R6-Homu', 1, 24) }, { id: 722, name: "経営法務 令和5年度", questions: generateQuestions('7-R5-Homu', 1, 21) },
        { id: 723, name: "経営法務 令和4年度", questions: generateQuestions('7-R4-Homu', 1, 22) }, { id: 724, name: "経営法務 令和3年度", questions: generateQuestions('7-R3-Homu', 1, 20) },
        { id: 725, name: "経営法務 令和2年度", questions: generateQuestions('7-R2-Homu', 1, 22) }, { id: 726, name: "中小企業経営・政策 令和6年度", questions: generateQuestions('7-R6-Chusho', 1, 11) },
        { id: 727, name: "中小企業経営・政策 令和5年度", questions: generateQuestions('7-R5-Chusho', 1, 22) }, { id: 728, name: "中小企業経営・政策 令和4年度", questions: generateQuestions('7-R4-Chusho', 1, 22) },
        { id: 729, name: "中小企業経営・政策 令和3年度", questions: generateQuestions('7-R3-Chusho', 1, 22) }, { id: 730, name: "中小企業経営・政策 令和2年度", questions: generateQuestions('7-R2-Chusho', 1, 22) }
      ]
    }
  ];
  return subjects;
};

// 正解率計算関数
function calculateCorrectRate(question, isCorrect) {
    const currentCount = question.answerCount || 0;
    const currentRate = question.correctRate || 0;
    // 初めての解答の場合
    if (currentCount === 0) {
        return isCorrect ? 100 : 0;
    }
    // 2回目以降の解答の場合
    const newRate = isCorrect
        ? (currentRate * currentCount + 100) / (currentCount + 1)
        : (currentRate * currentCount) / (currentCount + 1);
    return Math.round(newRate); // 四捨五入して整数にする
}

function App() {
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [bulkEditSelectedDate, setBulkEditSelectedDate] = useState(new Date());
  // ★ 解答履歴を保存するための state を追加
  const [answerHistory, setAnswerHistory] = useState([]);

  // 初期データロード (★ 解答履歴の読み込みを追加)
  useEffect(() => {
    // 学習データの読み込み
    const savedStudyData = localStorage.getItem('studyData');
    let studyDataToSet;
    if (savedStudyData) {
      try {
        studyDataToSet = JSON.parse(savedStudyData);
        // 日付データの復元 (Dateオブジェクトに)
        studyDataToSet.forEach(subject => {
            if (subject && subject.chapters) {
                subject.chapters.forEach(chapter => {
                    if (chapter && chapter.questions) {
                        chapter.questions.forEach(q => {
                            if (q) { // q が null や undefined でないことを確認
                                if (q.lastAnswered) q.lastAnswered = new Date(q.lastAnswered);
                                // nextDate は ISO 文字列のまま扱う場合が多いので、
                                // 必要に応じて Date に変換する場所で行う (例: 表示時、比較時)
                                // if (q.nextDate) q.nextDate = new Date(q.nextDate);
                            }
                        });
                    }
                });
            }
        });
        console.log('保存された学習データを読み込みました');
      } catch (e) {
          console.error('学習データの読み込みまたは解析に失敗:', e);
          studyDataToSet = generateInitialData();
          console.log('初期学習データを生成しました');
      }
    } else {
      studyDataToSet = generateInitialData();
      console.log('初期学習データを生成しました');
    }
    setSubjects(studyDataToSet);

    // ★ 解答履歴データの読み込みを追加
    const savedHistoryData = localStorage.getItem('studyHistory');
    let historyDataToSet = [];
    if (savedHistoryData) {
        try {
            historyDataToSet = JSON.parse(savedHistoryData);
            // ここでは timestamp は文字列のまま読み込む (必要なら後で Date に変換)
            console.log('保存された解答履歴データを読み込みました');
        } catch (e) {
            console.error('解答履歴データの読み込みに失敗:', e);
            historyDataToSet = [];
            console.log('解答履歴データを初期化しました');
        }
    } else {
        console.log('解答履歴データが見つかりません。初期化します。');
    }
    setAnswerHistory(historyDataToSet);

    // アコーディオンの初期状態設定
    const initialExpandedSubjects = {};
    if (Array.isArray(studyDataToSet)) { // studyDataToSet が配列であることを確認
        studyDataToSet.forEach(subject => {
            if (subject && subject.id) { // subject と id が存在することを確認
                initialExpandedSubjects[subject.id] = false;
            }
        });
        if (studyDataToSet.length > 0 && studyDataToSet[0] && studyDataToSet[0].id) { // 最初の要素と id が存在することを確認
            initialExpandedSubjects[studyDataToSet[0].id] = true;
        }
    }
    setExpandedSubjects(initialExpandedSubjects);
  }, []); // 初期ロードはマウント時に一度だけ実行

  // データ保存 (★ 解答履歴の保存を追加)
  useEffect(() => {
    // 学習データの保存
    if (subjects.length > 0) {
      try {
          const dataToSave = JSON.stringify(subjects, (key, value) => {
              // DateオブジェクトはISO文字列に変換して保存
              if ((key === 'lastAnswered' || key === 'nextDate') && value instanceof Date) {
                  return value.toISOString();
              }
              return value;
          });
          localStorage.setItem('studyData', dataToSave);
          // console.log('学習データを保存しました'); // 保存頻度が高いのでコメントアウト推奨
      } catch (e) {
          console.error("学習データの保存に失敗:", e);
          // ここでエラーハンドリングを行う (例: ユーザーに通知)
      }
    }

    // ★ 解答履歴データの保存を追加
    if (answerHistory.length > 0) {
        try {
            // timestamp は ISO 文字列で保存されている想定
            const historyToSave = JSON.stringify(answerHistory);
            localStorage.setItem('studyHistory', historyToSave);
            // console.log('解答履歴データを保存しました'); // 保存頻度が高いのでコメントアウト推奨
        } catch (e) {
            console.error("解答履歴データの保存に失敗:", e);
        }
    }
  }, [subjects, answerHistory]); // ★ answerHistory も依存配列に追加


  // 今日の問題を取得する関数
  const getTodayQuestions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 今日の始まり
    const todayTime = today.getTime();
    const questions = [];
    if (!Array.isArray(subjects)) return questions; // subjects が配列でない場合は空を返す

    subjects.forEach(subject => {
      if (!subject || !Array.isArray(subject.chapters)) return;
      subject.chapters.forEach(chapter => {
        if (!chapter || !Array.isArray(chapter.questions)) return;
        chapter.questions.forEach(question => {
          if (!question || !question.nextDate) return; // 問題データや nextDate がない場合はスキップ
          try {
            const nextDate = new Date(question.nextDate); // ISO文字列からDateオブジェクトへ
            if (isNaN(nextDate.getTime())) return; // 無効な日付はスキップ
            nextDate.setHours(0, 0, 0, 0); // 時間をリセットして日付のみで比較
            if (nextDate.getTime() === todayTime) {
              questions.push({
                ...question,
                subjectName: subject.name || '未分類科目',
                chapterName: chapter.name || '未分類章'
              });
            }
          } catch (e) {
            console.error("日付処理エラー(today):", e, "問題ID:", question.id, "nextDate:", question.nextDate);
          }
        });
      });
    });
    return questions;
  };

  // 特定の日付の問題を取得する関数
  const getQuestionsForDate = (date) => {
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) return []; // 無効な日付
    targetDate.setHours(0, 0, 0, 0);
    const targetTime = targetDate.getTime();
    const questions = [];
     if (!Array.isArray(subjects)) return questions;

    subjects.forEach(subject => {
       if (!subject || !Array.isArray(subject.chapters)) return;
      subject.chapters.forEach(chapter => {
         if (!chapter || !Array.isArray(chapter.questions)) return;
        chapter.questions.forEach(question => {
          if (!question || !question.nextDate) return;
          try {
            const nextDate = new Date(question.nextDate);
            if (isNaN(nextDate.getTime())) return;
            nextDate.setHours(0, 0, 0, 0);
            if (nextDate.getTime() === targetTime) {
              questions.push({
                ...question,
                subjectName: subject.name || '未分類科目',
                chapterName: chapter.name || '未分類章'
              });
            }
          } catch(e) {
            console.error("日付処理エラー(getQuestionsForDate):", e, "問題ID:", question.id, "nextDate:", question.nextDate);
          }
        });
      });
    });
    return questions;
  };

  // アコーディオン開閉関数
  const toggleSubject = (subjectId) => {
      setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };
  const toggleChapter = (chapterId) => {
      setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // ★ recordAnswer 関数を修正: 解答履歴を追加
  const recordAnswer = (questionId, isCorrect, understanding) => {
    const timestamp = new Date().toISOString(); // 解答日時を取得 (ISO文字列)
    let updatedQuestionData = null; // 更新後の問題データを保持する変数

    // 問題データの更新 (subjects state の更新)
    setSubjects(prevSubjects => {
      if (!Array.isArray(prevSubjects)) return []; // 安全対策
      const newSubjects = prevSubjects.map(subject => {
        if (!subject || !Array.isArray(subject.chapters)) return subject;
        return {
          ...subject,
          chapters: subject.chapters.map(chapter => {
            if (!chapter || !Array.isArray(chapter.questions)) return chapter;
            return {
              ...chapter,
              questions: chapter.questions.map(q => {
                if (q && q.id === questionId) { // q が存在し、IDが一致する場合
                  const question = { ...q };
                  const previousUnderstanding = question.understanding;
                  const today = new Date();
                  let nextDate = new Date();
                  let newInterval = '';

                  // --- スケジュール更新ロジック ---
                  if (understanding.startsWith('曖昧△')) {
                    nextDate.setDate(today.getDate() + 8); newInterval = '8日';
                  } else if (isCorrect && understanding === '理解○') {
                    if (previousUnderstanding && previousUnderstanding.startsWith('曖昧△')) {
                      nextDate.setDate(today.getDate() + 14); newInterval = '14日';
                    } else {
                       switch(question.interval) {
                           case '1日': nextDate.setDate(today.getDate() + 3); newInterval = '3日'; break;
                           case '3日': nextDate.setDate(today.getDate() + 7); newInterval = '7日'; break;
                           case '7日': nextDate.setDate(today.getDate() + 14); newInterval = '14日'; break;
                           case '14日': nextDate.setMonth(today.getMonth() + 1); newInterval = '1ヶ月'; break;
                           case '1ヶ月': nextDate.setMonth(today.getMonth() + 2); newInterval = '2ヶ月'; break;
                           case '2ヶ月': default: nextDate.setMonth(today.getMonth() + 2); newInterval = '2ヶ月'; break; // デフォルトも2ヶ月
                       }
                    }
                  } else if (!isCorrect) {
                    nextDate.setDate(today.getDate() + 1); newInterval = '1日';
                  } else { // isCorrect && understanding !== '理解○' (つまり曖昧△以外で正解だが理解○でない場合？基本は不正解と同じ扱い)
                    nextDate.setDate(today.getDate() + 1); newInterval = '1日';
                  }
                  // --- スケジュール更新ロジックここまで ---

                  updatedQuestionData = { // ★ 更新後のデータを変数に格納
                      ...question,
                      lastAnswered: today, // Dateオブジェクトで更新
                      nextDate: nextDate.toISOString(), // ISO文字列で更新
                      interval: newInterval,
                      answerCount: (question.answerCount || 0) + 1,
                      understanding: understanding,
                      previousUnderstanding: previousUnderstanding, // 前回の理解度を記録
                      correctRate: calculateCorrectRate(question, isCorrect) // 正解率を更新
                  };
                  return updatedQuestionData; // 更新後のデータを返す
                }
                return q; // IDが一致しない場合は元のデータを返す
              })
            };
          })
        };
      });
      // console.log("学習データが更新されました。");
      return newSubjects; // 更新後の subjects 配列を返す
    });

    // ★ 解答履歴データの更新 (answerHistory state の更新)
    if (updatedQuestionData) { // 問題データが更新された場合のみ履歴を追加
        const newHistoryRecord = {
            id: crypto.randomUUID ? crypto.randomUUID() : `history-${Date.now()}-${Math.random()}`, // 簡易的なユニークID
            questionId: questionId,
            timestamp: timestamp, // ISO文字列
            isCorrect: isCorrect,
            understanding: understanding,
            // 必要であれば他の情報も追加
        };
        setAnswerHistory(prevHistory => [...prevHistory, newHistoryRecord]);
        // console.log("解答履歴を追加:", newHistoryRecord);
    } else {
        console.warn("recordAnswer: 問題データの更新に失敗したか、該当IDが見つからなかったため、履歴は追加されませんでした。questionId:", questionId);
    }
  };


  // ドラッグ＆ドロップによる日付変更関数
  const handleQuestionDateChange = (questionId, newDate) => {
    setSubjects(prevSubjects => {
      if (!Array.isArray(prevSubjects)) return [];
      const targetDate = new Date(newDate);
      if (isNaN(targetDate.getTime())) {
        console.error("無効なドロップ先の日付:", newDate);
        return prevSubjects; // 無効な日付なら state を変更しない
      }
      targetDate.setHours(0, 0, 0, 0); // 時間をリセット
      const targetDateString = targetDate.toISOString(); // ISO文字列で保存

      const newSubjects = prevSubjects.map(subject => {
         if (!subject || !Array.isArray(subject.chapters)) return subject;
         return {
          ...subject,
          chapters: subject.chapters.map(chapter => {
             if (!chapter || !Array.isArray(chapter.questions)) return chapter;
             return {
              ...chapter,
              questions: chapter.questions.map(q => {
                if (q && q.id === questionId) {
                  console.log(`問題 ${questionId} の日付を ${formatDate(targetDate)} に変更`);
                  return { ...q, nextDate: targetDateString }; // nextDate をISO文字列で更新
                }
                return q;
              })
            };
          })
        };
      });
      return newSubjects;
    });
  };

  // 個別編集モーダル保存関数
  const saveQuestionEdit = (questionData) => {
    console.log("Saving edited question:", questionData);
    setSubjects(prevSubjects => {
      if (!Array.isArray(prevSubjects)) return [];
      const newSubjects = prevSubjects.map(subject => {
        if (!subject || !Array.isArray(subject.chapters)) return subject;
        return {
          ...subject,
          chapters: subject.chapters.map(chapter => {
            if (!chapter || !Array.isArray(chapter.questions)) return chapter;
            return {
              ...chapter,
              questions: chapter.questions.map(q => {
                if (q && q.id === questionData.id) {
                  const updatedQuestion = { ...q, ...questionData }; // 元データに編集データをマージ

                  // 日付が文字列で渡される場合があるので Date オブジェクトまたは null に変換
                  try {
                      if (updatedQuestion.nextDate && typeof updatedQuestion.nextDate === 'string') {
                          const nextD = new Date(updatedQuestion.nextDate);
                          updatedQuestion.nextDate = !isNaN(nextD.getTime()) ? nextD.toISOString() : q.nextDate; // 無効なら元に戻す
                      } else if (updatedQuestion.nextDate instanceof Date) {
                          updatedQuestion.nextDate = updatedQuestion.nextDate.toISOString();
                      } else {
                           updatedQuestion.nextDate = q.nextDate; // 文字列でもDateでもない場合は元に戻す
                      }

                      // lastAnswered も同様に処理 (編集可能なら)
                      if (updatedQuestion.lastAnswered && typeof updatedQuestion.lastAnswered === 'string') {
                         const lastA = new Date(updatedQuestion.lastAnswered);
                         updatedQuestion.lastAnswered = !isNaN(lastA.getTime()) ? lastA : q.lastAnswered; // Dateオブジェクトで保持
                      } else if (!(updatedQuestion.lastAnswered instanceof Date)) {
                          updatedQuestion.lastAnswered = q.lastAnswered; // Dateでない場合は元に戻す
                      }
                      // 他のフィールドも questionData から更新される
                  } catch (e) {
                      console.error("Error processing dates during edit save:", e);
                      return q; // エラー時は元のデータを返す
                  }
                  console.log("Updated question object:", updatedQuestion);
                  return updatedQuestion;
                }
                return q;
              })
            };
          })
        };
      });
      return newSubjects;
    });
    setEditingQuestion(null); // モーダルを閉じる
  };

  // 一括編集保存関数
  const saveBulkEdit = (date) => {
     const targetDate = new Date(date);
     if (isNaN(targetDate.getTime())) {
       console.error("無効な一括編集日付:", date);
       return;
     }
     targetDate.setHours(0, 0, 0, 0);
     const targetDateString = targetDate.toISOString(); // ISO文字列で保存

     setSubjects(prevSubjects => {
       if (!Array.isArray(prevSubjects)) return [];
       const newSubjects = prevSubjects.map(subject => {
         if (!subject || !Array.isArray(subject.chapters)) return subject;
         return {
           ...subject,
           chapters: subject.chapters.map(chapter => {
             if (!chapter || !Array.isArray(chapter.questions)) return chapter;
             return {
               ...chapter,
               questions: chapter.questions.map(q => {
                 if (q && selectedQuestions.includes(q.id)) { // q が存在するか確認
                   return { ...q, nextDate: targetDateString }; // nextDate をISO文字列で更新
                 }
                 return q;
               })
             };
           })
         };
       });
       return newSubjects;
     });
     setBulkEditMode(false); // 一括編集モードを終了
     setSelectedQuestions([]); // 選択をリセット
     // bulkEditSelectedDate はリセットしない（次回も同じ日付がデフォルトになるように）
  };

  // 一括編集用 問題選択切り替え関数
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // 日付フォーマット関数
   const formatDate = (date) => {
     if (!date) return '日付なし';
     try {
       // Date オブジェクトか確認、文字列なら Date に変換
       const d = (date instanceof Date) ? date : new Date(date);
       if (isNaN(d.getTime())) return '無効日付';
       // 日本時間に変換せずにそのまま表示（ユーザーの環境に依存）
       return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
     } catch(e) {
       console.error("formatDate エラー:", e, "入力:", date);
       return 'エラー';
     }
   };

  // メインビュー表示切り替え
  const MainView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView getTodayQuestions={getTodayQuestions} recordAnswer={recordAnswer} formatDate={formatDate} />;
      case 'schedule':
        return <ScheduleView subjects={subjects} getQuestionsForDate={getQuestionsForDate} handleQuestionDateChange={handleQuestionDateChange} formatDate={formatDate} />;
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
          setSelectedQuestions={setSelectedQuestions} // setSelectedQuestions を渡す
          saveBulkEdit={saveBulkEdit}
          formatDate={formatDate}
          toggleQuestionSelection={toggleQuestionSelection} // toggleQuestionSelection を渡す
          selectedDate={bulkEditSelectedDate}
          setSelectedDate={setBulkEditSelectedDate} // setBulkEditSelectedDate を渡す
        />;
      case 'trends':
        // ★ AmbiguousTrendsPage に answerHistory を渡す
        return <AmbiguousTrendsPage subjects={subjects} formatDate={formatDate} answerHistory={answerHistory} />;
      case 'stats': // 仮に 'stats' というタブ ID にします
         // return <StatsPage subjects={subjects} answerHistory={answerHistory} />; // 将来的に作成
         return <div className="p-4">学習統計ページ (未実装)</div>; // 仮表示
      default:
        return <TodayView getTodayQuestions={getTodayQuestions} recordAnswer={recordAnswer} formatDate={formatDate} />;
    }
  };

  // アプリ全体のレンダリング
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* TopNavigation がヘッダーと余白を管理するので、下の div はシンプルに */}
      <div className="p-0 sm:p-4"> {/* 外側のパディングを調整 */}
        <MainView />
         {/* QuestionEditModal は App レベルで管理 */}
         {editingQuestion && (
           <QuestionEditModal
             question={editingQuestion}
             onSave={saveQuestionEdit}
             onCancel={() => setEditingQuestion(null)}
             formatDate={formatDate} // formatDate を渡す
           />
         )}
      </div>
      {/* 通知エリアなど */}
      <div id="notification-area" className="fixed bottom-4 right-4 z-30"></div>
    </div>
  );
}

export default App;
