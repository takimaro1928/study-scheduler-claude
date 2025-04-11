// src/App.js (dnd-kit 対応)
import React, { useState, useEffect } from 'react';
// lucide-react のインポートはそのまま
import { Calendar, ChevronLeft, ChevronRight, List, Check, X, AlertTriangle, Info, Search, ChevronsUpDown } from 'lucide-react';
// 他のコンポーネントインポート
import DatePickerCalendar from './DatePickerCalendar'; // 使っていなければ削除可
import QuestionEditModal from './QuestionEditModal';
import BulkEditSection from './BulkEditSection';
import AmbiguousTrendsPage from './AmbiguousTrendsPage';
import RedesignedAllQuestionsView from './RedesignedAllQuestionsView';
import TopNavigation from './components/TopNavigation';
import TodayView from './TodayView';
import ScheduleView from './ScheduleView'; // ***追加: 新しいScheduleViewをインポート***

// generateQuestions, generateInitialData, calculateCorrectRate は変更なし
function generateQuestions(prefix, start, end) {
    // ... (内容は変更なし) ...
     const questions = [];
  for (let i = start; i <= end; i++) {
    const today = new Date();
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + Math.floor(Math.random() * 30));

    questions.push({
      id: `${prefix}-${i}`,
      number: i,
      correctRate: 0,
      lastAnswered: null,
      nextDate: nextDate,
      interval: '1日',
      answerCount: 0,
      understanding: '未解答',
      previousUnderstanding: null,
    });
  }
  return questions;
}
const generateInitialData = () => { /* ... (内容は変更なし) ... */
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
        { id: 201, name: "生産管理概論 Q1-1", questions: generateQuestions('2-1-1', 1, 10) },
        { id: 202, name: "生産のプランニング Q1-2", questions: generateQuestions('2-1-2', 1, 52) },
        { id: 203, name: "生産のオペレーション Q1-3", questions: generateQuestions('2-1-3', 1, 35) },
        { id: 204, name: "製造業における情報システム Q1-4", questions: generateQuestions('2-1-4', 1, 6) },
        { id: 205, name: "店舗・商業集積 Q2-1", questions: generateQuestions('2-2-1', 1, 9) },
        { id: 206, name: "商品仕入・販売（マーチャンダイジング） Q2-2", questions: generateQuestions('2-2-2', 1, 23) },
        { id: 207, name: "物流・輸配送管理 Q2-3", questions: generateQuestions('2-2-3', 1, 18) },
        { id: 208, name: "販売流通情報システム Q2-4", questions: generateQuestions('2-2-4', 1, 17) }
      ]
    },
     {
      id: 3,
      name: "経済学",
      chapters: [
        { id: 301, name: "企業行動の分析 Q1", questions: generateQuestions('3-1', 1, 19) },
        { id: 302, name: "消費者行動の分析 Q2", questions: generateQuestions('3-2', 1, 22) },
        { id: 303, name: "市場均衡と厚生分析 Q3", questions: generateQuestions('3-3', 1, 23) },
        { id: 304, name: "不完全競争 Q4", questions: generateQuestions('3-4', 1, 15) },
        { id: 305, name: "市場の失敗と政府の役割 Q5", questions: generateQuestions('3-5', 1, 15) },
        { id: 306, name: "国民経済計算と主要経済指標 Q6", questions: generateQuestions('3-6', 1, 13) },
        { id: 307, name: "財市場の分析 Q7", questions: generateQuestions('3-7', 1, 11) },
        { id: 308, name: "貨幣市場とIS-LM分析 Q8", questions: generateQuestions('3-8', 1, 14) },
        { id: 309, name: "雇用と物価水準 Q9", questions: generateQuestions('3-9', 1, 8) },
        { id: 310, name: "消費、投資、財政金融政策に関する理論 Q10", questions: generateQuestions('3-10', 1, 11) },
        { id: 311, name: "国際マクロ経済 Q11", questions: generateQuestions('3-11', 1, 6) },
        { id: 312, name: "景気循環と経済成長 Q12", questions: generateQuestions('3-12', 1, 3) }
      ]
    },
     {
      id: 4,
      name: "経営情報システム",
      chapters: [
        { id: 401, name: "情報技術に関する基礎知識 Q1", questions: generateQuestions('4-1', 1, 178) },
        { id: 402, name: "ソフトウェア開発 Q2", questions: generateQuestions('4-2', 1, 38) },
        { id: 403, name: "経営情報管理 Q3", questions: generateQuestions('4-3', 1, 35) },
        { id: 404, name: "統計解析 Q4", questions: generateQuestions('4-4', 1, 9) }
      ]
    },
    {
      id: 5,
      name: "経営法務",
      chapters: [
        { id: 501, name: "民法その他の知識 Q1", questions: generateQuestions('5-1', 1, 54) },
        { id: 502, name: "会社法等に関する知識 Q2", questions: generateQuestions('5-2', 1, 123) },
        { id: 503, name: "資本市場に関する知識 Q3", questions: generateQuestions('5-3', 1, 12) },
        { id: 504, name: "倒産等に関する知識 Q4", questions: generateQuestions('5-4', 1, 16) },
        { id: 505, name: "知的財産権等に関する知識 Q5", questions: generateQuestions('5-5', 1, 107) },
        { id: 506, name: "その他経営法務に関する知識 Q6", questions: generateQuestions('5-6', 1, 19) }
      ]
    },
    {
      id: 6,
      name: "中小企業経営・中小企業政策",
      chapters: [
        { id: 601, name: "中小企業経営/中小企業概論 Q1-1", questions: generateQuestions('6-1-1', 1, 31) },
        { id: 602, name: "中小企業経営/令和5年度の中小企業の動向 Q1-2", questions: generateQuestions('6-1-2', 1, 40) },
        { id: 603, name: "中小企業経営/環境変化に対応する中小企業 Q1-3", questions: generateQuestions('6-1-3', 1, 14) },
        { id: 604, name: "中小企業経営/経営課題に立ち向かう小規模業者業 Q1-4", questions: generateQuestions('6-1-4', 1, 32) },
        { id: 605, name: "中小企業政策/中小企業政策の基本 Q2-1", questions: generateQuestions('6-2-1', 1, 14) },
        { id: 606, name: "中小企業政策/中小企業施策 Q2-2", questions: generateQuestions('6-2-2', 1, 68) },
        { id: 607, name: "中小企業政策/中小企業政策の変遷 Q2-3", questions: generateQuestions('6-2-3', 1, 1) }
      ]
    },
     {
      id: 7,
      name: "過去問題集",
       chapters: [
        { id: 701, name: "企業経営理論 令和6年度", questions: generateQuestions('7-R6-Keiei', 1, 40) },
        { id: 702, name: "企業経営理論 令和5年度", questions: generateQuestions('7-R5-Keiei', 1, 37) },
        { id: 703, name: "企業経営理論 令和4年度", questions: generateQuestions('7-R4-Keiei', 1, 37) },
        { id: 704, name: "企業経営理論 令和3年度", questions: generateQuestions('7-R3-Keiei', 1, 38) },
        { id: 705, name: "企業経営理論 令和2年度", questions: generateQuestions('7-R2-Keiei', 1, 36) },
        { id: 706, name: "運営管理 令和6年度", questions: generateQuestions('7-R6-Unei', 1, 41) },
        { id: 707, name: "運営管理 令和5年度", questions: generateQuestions('7-R5-Unei', 1, 37) },
        { id: 708, name: "運営管理 令和4年度", questions: generateQuestions('7-R4-Unei', 1, 39) },
        { id: 709, name: "運営管理 令和3年度", questions: generateQuestions('7-R3-Unei', 1, 41) },
        { id: 710, name: "運営管理 令和2年度", questions: generateQuestions('7-R2-Unei', 1, 42) },
        { id: 711, name: "経済学・経済政策 令和6年度", questions: generateQuestions('7-R6-Keizai', 1, 22) },
        { id: 712, name: "経済学・経済政策 令和5年度", questions: generateQuestions('7-R5-Keizai', 1, 22) },
        { id: 713, name: "経済学・経済政策 令和4年度", questions: generateQuestions('7-R4-Keizai', 1, 21) },
        { id: 714, name: "経済学・経済政策 令和3年度", questions: generateQuestions('7-R3-Keizai', 1, 23) },
        { id: 715, name: "経済学・経済政策 令和2年度", questions: generateQuestions('7-R2-Keizai', 1, 22) },
        { id: 716, name: "経営情報システム 令和6年度", questions: generateQuestions('7-R6-Joho', 1, 23) },
        { id: 717, name: "経営情報システム 令和5年度", questions: generateQuestions('7-R5-Joho', 1, 25) },
        { id: 718, name: "経営情報システム 令和4年度", questions: generateQuestions('7-R4-Joho', 1, 24) },
        { id: 719, name: "経営情報システム 令和3年度", questions: generateQuestions('7-R3-Joho', 1, 25) },
        { id: 720, name: "経営情報システム 令和2年度", questions: generateQuestions('7-R2-Joho', 1, 25) },
        { id: 721, name: "経営法務 令和6年度", questions: generateQuestions('7-R6-Homu', 1, 24) },
        { id: 722, name: "経営法務 令和5年度", questions: generateQuestions('7-R5-Homu', 1, 21) },
        { id: 723, name: "経営法務 令和4年度", questions: generateQuestions('7-R4-Homu', 1, 22) },
        { id: 724, name: "経営法務 令和3年度", questions: generateQuestions('7-R3-Homu', 1, 20) },
        { id: 725, name: "経営法務 令和2年度", questions: generateQuestions('7-R2-Homu', 1, 22) },
        { id: 726, name: "中小企業経営・政策 令和6年度", questions: generateQuestions('7-R6-Chusho', 1, 11) },
        { id: 727, name: "中小企業経営・政策 令和5年度", questions: generateQuestions('7-R5-Chusho', 1, 22) },
        { id: 728, name: "中小企業経営・政策 令和4年度", questions: generateQuestions('7-R4-Chusho', 1, 22) },
        { id: 729, name: "中小企業経営・政策 令和3年度", questions: generateQuestions('7-R3-Chusho', 1, 22) },
        { id: 730, name: "中小企業経営・政策 令和2年度", questions: generateQuestions('7-R2-Chusho', 1, 22) }
      ]
    }
  ];
  return subjects;
};
function calculateCorrectRate(question, isCorrect) { /* ... (内容は変更なし) ... */
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

function App() {
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  // selectedDate は ScheduleView で管理するため削除
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // 初期データロード、データ保存 useEffect は変更なし
   useEffect(() => {
    const savedData = localStorage.getItem('studyData');
    let dataToSet;
    if (savedData) {
      try {
        dataToSet = JSON.parse(savedData);
        // Dateオブジェクトを復元
        dataToSet.forEach(subject => {
            subject.chapters.forEach(chapter => {
                chapter.questions.forEach(q => {
                    if (q.lastAnswered) q.lastAnswered = new Date(q.lastAnswered);
                    if (q.nextDate) q.nextDate = new Date(q.nextDate);
                });
            });
        });
        console.log('保存された学習データを読み込みました');
      } catch (e) {
        console.error('保存データの読み込みに失敗:', e);
        dataToSet = generateInitialData();
        console.log('初期データを生成しました');
      }
    } else {
      dataToSet = generateInitialData();
      console.log('初期データを生成しました');
    }
    setSubjects(dataToSet);
    const initialExpandedSubjects = {};
    dataToSet.forEach(subject => {
      initialExpandedSubjects[subject.id] = false;
    });
    if (dataToSet.length > 0) {
        initialExpandedSubjects[dataToSet[0].id] = true;
    }
    setExpandedSubjects(initialExpandedSubjects);
  }, []);

   useEffect(() => {
    if (subjects.length > 0) {
      const dataToSave = JSON.stringify(subjects, (key, value) => {
          if ((key === 'lastAnswered' || key === 'nextDate') && value instanceof Date) {
              return value.toISOString();
          }
          return value;
      });
      localStorage.setItem('studyData', dataToSave);
      console.log('学習データを保存しました');
    }
  }, [subjects]);

  // getTodayQuestions, getQuestionsForDate は変更なし
  const getTodayQuestions = () => { /* ... (内容は変更なし) ... */
     const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime(); // 比較用に数値タイムスタンプを取得
    const questions = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        chapter.questions.forEach(question => {
          if (!question.nextDate) return; // nextDateがないデータはスキップ
          try {
            const nextDate = new Date(question.nextDate); // Dateオブジェクトに変換
             if (isNaN(nextDate.getTime())) { // 無効な日付をチェック
                 // console.error("無効な次回日付(today):", question.nextDate, "ID:", question.id);
                 return;
             }
            nextDate.setHours(0, 0, 0, 0);
            if (nextDate.getTime() === todayTime) { // タイムスタンプで比較
              questions.push({
                ...question,
                subjectName: subject.name,
                chapterName: chapter.name
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
   const getQuestionsForDate = (date) => { /* ... (内容は変更なし) ... */
      const targetDate = new Date(date);
     if (isNaN(targetDate.getTime())) {
         console.error("無効なターゲット日付(getQuestionsForDate):", date);
         return [];
     }
    targetDate.setHours(0, 0, 0, 0);
    const targetTime = targetDate.getTime(); // 比較用に数値タイムスタンプ
    const questions = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        chapter.questions.forEach(question => {
           if (!question.nextDate) return;
           try {
               const nextDate = new Date(question.nextDate);
                if (isNaN(nextDate.getTime())) {
                    // console.error("無効な次回日付(getQuestionsForDate):", question.nextDate, "ID:", question.id);
                    return;
                }
               nextDate.setHours(0, 0, 0, 0);
               if (nextDate.getTime() === targetTime) { // タイムスタンプで比較
                 questions.push({
                   ...question,
                   subjectName: subject.name,
                   chapterName: chapter.name
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

  // toggleSubject, toggleChapter は変更なし
   const toggleSubject = (subjectId) => { setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] })); };
  const toggleChapter = (chapterId) => { setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] })); };


  // recordAnswer (スケジュールルール修正済み) は変更なし
  const recordAnswer = (questionId, isCorrect, understanding) => {
    setSubjects(prevSubjects => {
      const newSubjects = prevSubjects.map(subject => ({
        ...subject,
        chapters: subject.chapters.map(chapter => ({
          ...chapter,
          questions: chapter.questions.map(q => {
            if (q.id === questionId) {
              // --- 更新ロジック ---
              const question = { ...q };
              const previousUnderstanding = question.understanding; // 前回の理解度を保持
              const today = new Date();
              let nextDate = new Date();
              let newInterval = '';

              if (understanding.startsWith('曖昧△')) {
                // 今回「曖昧△」なら一律8日後
                nextDate.setDate(today.getDate() + 8);
                newInterval = '8日';
                const reason = understanding.split(':')[1] || ''; // 理由取得
                console.log("曖昧理由:", reason);

              } else if (isCorrect && understanding === '理解○') {
                // 今回「理解○」かつ「正解」
                if (previousUnderstanding && previousUnderstanding.startsWith('曖昧△')) {
                  // 前回「曖昧△」→今回「理解○」＆「正解」なら14日後
                  nextDate.setDate(today.getDate() + 14);
                  newInterval = '14日';
                  console.log("前回曖昧からの復帰: 14日後");
                } else {
                  // 通常の正解ルール（要件定義 v3 に合わせる）
                   switch(question.interval) {
                       case '1日': // 1日後正解なら次は3日後
                           nextDate.setDate(today.getDate() + 3); newInterval = '3日'; break;
                       case '3日': // 3日後正解なら次は7日後
                           nextDate.setDate(today.getDate() + 7); newInterval = '7日'; break;
                       case '7日': // 7日後正解なら次は14日後
                           nextDate.setDate(today.getDate() + 14); newInterval = '14日'; break;
                       case '14日': // 14日後正解なら次は1ヶ月後
                           nextDate.setMonth(today.getMonth() + 1); newInterval = '1ヶ月'; break;
                       case '1ヶ月': // 1ヶ月後正解なら次は2ヶ月後
                           nextDate.setMonth(today.getMonth() + 2); newInterval = '2ヶ月'; break;
                       case '2ヶ月': // 2ヶ月後以降正解なら次は2ヶ月後
                       default: // 初回正解もここに含む
                           nextDate.setMonth(today.getMonth() + 2); newInterval = '2ヶ月'; break;
                   }
                }
              } else if (!isCorrect) {
                // 不正解の場合
                nextDate.setDate(today.getDate() + 1);
                newInterval = '1日';
              } else {
                console.warn("未定義の解答状態:", {isCorrect, understanding});
                nextDate.setDate(today.getDate() + 1); // フォールバック
                newInterval = '1日';
              }

              // 更新された問題オブジェクト
              return {
                ...question,
                lastAnswered: today.toISOString(),
                nextDate: nextDate.toISOString(),
                interval: newInterval,
                answerCount: (question.answerCount || 0) + 1,
                understanding: understanding,
                previousUnderstanding: previousUnderstanding,
                correctRate: calculateCorrectRate(question, isCorrect),
              };
              // --- 更新ロジックここまで ---
            }
            return q;
          })
        }))
      }));
      console.log("学習データが更新されました。");
      return newSubjects;
    });
  };

  // ***追加: ドラッグ&ドロップによる日付更新関数***
  const handleQuestionDateChange = (questionId, newDate) => {
    setSubjects(prevSubjects => {
      const targetDate = new Date(newDate);
      if (isNaN(targetDate.getTime())) {
        console.error("無効なドロップ先の日付:", newDate);
        return prevSubjects; // 無効な日付なら状態を変更しない
      }
      targetDate.setHours(0, 0, 0, 0);
      const targetDateString = targetDate.toISOString();

      // 不変性を保ちながら状態を更新
      const newSubjects = prevSubjects.map(subject => ({
        ...subject,
        chapters: subject.chapters.map(chapter => ({
          ...chapter,
          questions: chapter.questions.map(q => {
            if (q.id === questionId) {
              console.log(`問題 ${questionId} の日付を ${formatDate(targetDate)} に変更`);
              return { ...q, nextDate: targetDateString }; // 日付のみ更新
            }
            return q;
          })
        }))
      }));
      return newSubjects;
    });
  };


  // saveQuestionEdit, saveBulkEdit, toggleQuestionSelection は変更なし
   const saveQuestionEdit = (questionData) => { /* ... (内容は変更なし) ... */
      setSubjects(prevSubjects => {
      const newSubjects = prevSubjects.map(subject => ({
          ...subject,
          chapters: subject.chapters.map(chapter => ({
              ...chapter,
              questions: chapter.questions.map(q => {
                  if (q.id === questionData.id) {
                      return {
                          ...questionData,
                          nextDate: new Date(questionData.nextDate).toISOString(),
                          lastAnswered: new Date(questionData.lastAnswered).toISOString()
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
   const saveBulkEdit = (date) => { /* ... (内容は変更なし) ... */
        const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
          console.error("無効な一括編集日付:", date);
          return;
      }
      targetDate.setHours(0, 0, 0, 0);
      const targetDateString = targetDate.toISOString(); // ISO文字列で保存

      setSubjects(prevSubjects => {
        const newSubjects = prevSubjects.map(subject => ({
            ...subject,
            chapters: subject.chapters.map(chapter => ({
                ...chapter,
                questions: chapter.questions.map(q => {
                    if (selectedQuestions.includes(q.id)) {
                        return { ...q, nextDate: targetDateString }; // ISO文字列で保存
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
   const toggleQuestionSelection = (questionId) => { /* ... (内容は変更なし) ... */
       setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
   };

  // formatDate (変更なし)
   const formatDate = (date) => { /* ... (内容は変更なし) ... */
      if (!date) return '日付なし';
    try {
        const d = new Date(date);
         if (isNaN(d.getTime())) {
            // console.warn("formatDate: 無効な日付入力:", date);
            return '無効日付';
        }
        return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    } catch(e) {
        console.error("formatDate エラー:", e, "入力:", date);
        return 'エラー';
    }
   };

  // MainView を修正して ScheduleView に props を渡す
  const MainView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView
          getTodayQuestions={getTodayQuestions}
          recordAnswer={recordAnswer}
          formatDate={formatDate}
        />;
      case 'schedule':
        // ***変更点: ScheduleView に必要な props を渡す***
        return <ScheduleView
                 subjects={subjects} // 表示用データ
                 getQuestionsForDate={getQuestionsForDate} // 特定日の問題取得用
                 handleQuestionDateChange={handleQuestionDateChange} // DnD結果反映用
                 formatDate={formatDate} // 日付フォーマット用
               />;
      case 'all':
         // RedesignedAllQuestionsView に渡す props は変更なし
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
          saveBulkEdit={saveBulkEdit}
          formatDate={formatDate}
          toggleQuestionSelection={toggleQuestionSelection}
        />;
      case 'trends':
        return <AmbiguousTrendsPage subjects={subjects} formatDate={formatDate} />;
      default:
        return <TodayView
          getTodayQuestions={getTodayQuestions}
          recordAnswer={recordAnswer}
          formatDate={formatDate}
        />;
    }
  };

  // App return (変更なし)
  return (
     // ... (Appコンポーネントの return 部分は変更なし) ...
      <div className="min-h-screen bg-gray-50">
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div>
         <div className="bg-indigo-600 p-4 sm:p-6">
           <div className="max-w-5xl mx-auto">
             <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">学習スケジュール管理</h1>
             <p className="text-xs text-indigo-100 opacity-90 mt-1">暗記曲線に基づく効率的な学習を実現</p>
           </div>
         </div>
        <div className="p-0 sm:p-4">
          <MainView />
          {editingQuestion && (
            <QuestionEditModal
              question={editingQuestion}
              onSave={saveQuestionEdit}
              onCancel={() => setEditingQuestion(null)}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>
      <div id="notification-area" className="fixed bottom-4 right-4 z-30"></div>
    </div>
  );
}

export default App;
