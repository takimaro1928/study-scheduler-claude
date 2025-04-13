// src/AmbiguousTrendsPage.js
// 【今度こそ完全版・省略なし・既存コードベース】
// コメント表示改善：CSSカスタムツールチップを表示するように renderTable 内を修正

import React, { useState, useEffect, useMemo } from 'react';
// 元のインポートに TrendingDown を追加
import { Filter, ChevronDown, ChevronUp, Info, ArrowUpDown, BarChart2, AlertCircle, RotateCcw, TrendingUp, Edit2, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import styles from './AmbiguousTrendsPage.module.css';
import CommentEditModal from './CommentEditModal';

// 曖昧問題データを取得・整形する関数 (変更なし)
function getAmbiguousQuestions(subjects) {
  const ambiguousQuestions = []; if (!Array.isArray(subjects)) return ambiguousQuestions;
  subjects.forEach(subject => { if (!subject?.chapters) return; subject.chapters.forEach(chapter => { if (!chapter?.questions) return; chapter.questions.forEach(question => {
    if (typeof question !== 'object' || question === null) return; if (question.understanding?.startsWith('曖昧△')) {
      let reason = '理由なし'; if (question.understanding.includes(':')) { reason = question.understanding.split(':')[1].trim(); }
      const lastAnsweredDate = question.lastAnswered ? new Date(question.lastAnswered) : null; const nextDateDate = question.nextDate ? new Date(question.nextDate) : null;
      ambiguousQuestions.push({ id: question.id || '?', subjectId: subject.id, subjectName: subject.name || '?', chapterId: chapter.id, chapterName: chapter.name || '?', reason: reason, correctRate: question.correctRate ?? 0, lastAnswered: !isNaN(lastAnsweredDate?.getTime()) ? lastAnsweredDate : null, nextDate: !isNaN(nextDateDate?.getTime()) ? nextDateDate : null, answerCount: question.answerCount ?? 0, previousUnderstanding: question.previousUnderstanding, comment: question.comment || '', }); } }); }); });
  return ambiguousQuestions;
}

// 日付のフォーマット関数 (変更なし)
const formatDateInternal = (date) => { if (!date || !(date instanceof Date) || isNaN(date.getTime())) { return '----/--/--'; } try { return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`; } catch (e) { console.error("formatDateエラー:", e); return 'エラー'; } };

// 自然順ソート用の比較関数 (変更なし)
function naturalSortCompare(a, b, order) {
  const nullOrder = (order === 'asc' ? 1 : -1); if (a == null && b != null) return nullOrder; if (a != null && b == null) return -nullOrder; if (a == null && b == null) return 0;
  const re = /(\d+)|(\D+)/g; const aParts = String(a).match(re) || []; const bParts = String(b).match(re) || [];
  const len = Math.min(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) { const aPart = aParts[i]; const bPart = bParts[i]; const aNum = parseInt(aPart, 10); const bNum = parseInt(bPart, 10); if (!isNaN(aNum) && !isNaN(bNum)) { if (aNum !== bNum) return aNum - bNum; } else { const comparison = aPart.localeCompare(bPart, undefined, { sensitivity: 'base' }); if (comparison !== 0) return comparison; } }
  return aParts.length - bParts.length;
}

// ソート処理を共通化する関数 (変更なし)
const sortData = (dataToSort, sortKey, sortOrder) => {
  // ソート対象が配列でなければ空配列を返す
  if (!Array.isArray(dataToSort)) {
      console.warn("sortData received non-array:", dataToSort);
      return [];
  }
  // 各要素がオブジェクトであることを確認 (より安全に)
  const validData = dataToSort.filter(item => typeof item === 'object' && item !== null);

  return validData.slice().sort((a, b) => {
    // a と b がオブジェクトでない場合は比較しない (念のため)
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return 0;
    }
    const valA = a[sortKey]; const valB = b[sortKey]; let comparison = 0;
    if (valA == null && valB != null) return sortOrder === 'asc' ? 1 : -1; if (valA != null && b == null) return sortOrder === 'asc' ? -1 : 1; if (valA == null && b == null) return 0;
    if (valA instanceof Date && valB instanceof Date) { comparison = valA.getTime() - valB.getTime(); }
    else if (typeof valA === 'number' && typeof valB === 'number') { comparison = valA - valB; }
    else if (typeof valA === 'string' && typeof valB === 'string') { if (sortKey === 'id' || sortKey === 'chapterName' || sortKey === 'subjectName' || sortKey === 'reason') { comparison = naturalSortCompare(valA, valB); } else { comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' }); } }
    else { try { if (valA < valB) comparison = -1; if (valA > valB) comparison = 1; } catch (e) { comparison = 0; } }
    return sortOrder === 'asc' ? comparison : comparison * -1;
  });
};

// 曖昧問題傾向表示ページコンポーネント
const AmbiguousTrendsPage = ({ subjects, formatDate = formatDateInternal, answerHistory = [], saveComment }) => {
  // --- State --- (変更なし)
  const [filter, setFilter] = useState({ reason: 'all', subject: 'all', period: 'all' });
  const [sort, setSort] = useState({ key: 'lastAnswered', order: 'desc' }); // デフォルトソートキーは維持
  const [showFilters, setShowFilters] = useState(false);
  const [editingCommentQuestion, setEditingCommentQuestion] = useState(null);

  // --- Memoized Data --- (変更なし)
  // 現在曖昧△の問題リスト
  const ambiguousQuestions = useMemo(() => getAmbiguousQuestions(subjects || []), [subjects]);

  // ★★★ 直近の揺り戻し（理解○ → 曖昧△）があった問題を抽出 ★★★
  const recentRevertedQuestions = useMemo(() => {
    console.log("[AmbiguousTrendsPage] Calculating recent reverted questions...");
    if (!answerHistory || answerHistory.length === 0) {
        console.log("[AmbiguousTrendsPage] No answer history for recent reverted.");
        return [];
    }

    // 1. 問題IDごとに履歴をグループ化 & 日付変換 & ソート
    const historyByQuestion = answerHistory.reduce((acc, record) => {
      if (!record || !record.questionId || !record.timestamp) return acc; // 不正なレコードはスキップ
      if (!acc[record.questionId]) { acc[record.questionId] = []; }
      const timestamp = new Date(record.timestamp);
      if (!isNaN(timestamp.getTime())) { // 無効な日付は除外
        acc[record.questionId].push({ timestamp, understanding: record.understanding || '' });
      }
      return acc;
    }, {});

    // 各グループ内で日付ソート
    Object.values(historyByQuestion).forEach(history => history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));

    const revertedQuestionIds = new Set();

    // 2. 各問題の履歴をチェックして「理解○ → 曖昧△」パターンを探す
    Object.keys(historyByQuestion).forEach(questionId => {
      const history = historyByQuestion[questionId];
      if (history.length >= 2) {
        const lastRecord = history[history.length - 1];
        const secondLastRecord = history[history.length - 2];
        // 最新の解答が「曖昧△」で、その一つ前が「理解○」の場合
        if (lastRecord.understanding?.startsWith('曖昧△') && secondLastRecord.understanding === '理解○') {
          revertedQuestionIds.add(questionId);
        }
      }
    });

    console.log("[AmbiguousTrendsPage] Found recent reverted question IDs:", revertedQuestionIds);
    // 3. 該当する問題の詳細情報を取得 (現在の ambiguousQuestions リストから絞り込む = 現在も曖昧なもののみ)
    const results = ambiguousQuestions.filter(q => revertedQuestionIds.has(q.id));
    console.log("[AmbiguousTrendsPage] Filtered recent reverted questions (currently ambiguous):", results.length);
    return results;

  }, [answerHistory, ambiguousQuestions]);

  // ★★★ 完全な揺り戻しサイクル（曖昧→理解→曖昧）があった問題を抽出 ★★★
  const completeRevertedQuestions = useMemo(() => {
    console.log("[AmbiguousTrendsPage] Calculating complete reverted questions...");
    if (!answerHistory || answerHistory.length === 0) {
        console.log("[AmbiguousTrendsPage] No answer history for complete reverted.");
        return [];
    }

    const historyByQuestion = answerHistory.reduce((acc, record) => {
        if (!record || !record.questionId || !record.timestamp) return acc;
        if (!acc[record.questionId]) { acc[record.questionId] = []; }
        const timestamp = new Date(record.timestamp);
        if (!isNaN(timestamp.getTime())) {
            acc[record.questionId].push({ timestamp, understanding: record.understanding || '' });
        }
        return acc;
    }, {});
    Object.values(historyByQuestion).forEach(history => history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));

    const revertedQuestionIds = new Set();
    Object.keys(historyByQuestion).forEach(questionId => {
        const history = historyByQuestion[questionId];
        let state = 'initial'; // initial -> ambiguous -> understood -> reverted
        for (const record of history) {
            const isAmbiguous = record.understanding?.startsWith('曖昧△');
            const isUnderstood = record.understanding === '理解○';
            switch (state) {
                case 'initial':
                    if (isAmbiguous) state = 'ambiguous';
                    else if (isUnderstood) state = 'understood_first'; // 最初から理解の場合
                    break;
                case 'understood_first': // 最初から理解で、その後曖昧になった場合
                    if (isAmbiguous) state = 'ambiguous';
                     // 理解→理解はそのまま
                    break;
                case 'ambiguous':
                    if (isUnderstood) state = 'understood'; // 曖昧→理解
                    // 曖昧→曖昧は state 維持
                    break;
                case 'understood':
                    if (isAmbiguous) { // 理解→曖昧 (揺り戻し発生！)
                        state = 'reverted';
                        revertedQuestionIds.add(questionId);
                    }
                    // 理解→理解は state 維持
                    break;
                case 'reverted': break; // この問題は揺り戻し確定
                default: break;
            }
            if (state === 'reverted') break;
        }
    });
    console.log("[AmbiguousTrendsPage] Found complete reverted question IDs:", revertedQuestionIds);
    // 3. 該当する問題の詳細情報を取得 (現在の ambiguousQuestions リストから絞り込む = 現在も曖昧なもののみ)
    const results = ambiguousQuestions.filter(q => revertedQuestionIds.has(q.id));
    console.log("[AmbiguousTrendsPage] Filtered complete reverted questions (currently ambiguous):", results.length);
    return results;
  }, [answerHistory, ambiguousQuestions]);

  // 科目別曖昧問題数
  const ambiguousCountBySubject = useMemo(() => {
    const counts = {};
    ambiguousQuestions.forEach(q => {
      counts[q.subjectName] = (counts[q.subjectName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ subjectName: name, count })).sort((a, b) => b.count - a.count);
  }, [ambiguousQuestions]);

  // 長期停滞問題 (30日以上経過)
  const longStagnantQuestions = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    return ambiguousQuestions.filter(q => q.lastAnswered && q.lastAnswered < thirtyDaysAgo);
  }, [ambiguousQuestions]);

  // 曖昧問題数の日次推移データ
  const ambiguousTrendsData = useMemo(() => {
    console.log("[AmbiguousTrendsPage] Calculating ambiguous trends data...");
    if (!answerHistory || answerHistory.length === 0) {
        console.log("[AmbiguousTrendsPage] No answer history for trends data.");
        return [];
    }
    const historySorted = [...answerHistory].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const trends = [];
    const questionLastState = new Map(); // 各問題の最新の理解度を保持
    let dailyAmbiguousCount = 0;
    let currentDate = '';

    ambiguousQuestions.forEach(q => {
        questionLastState.set(q.id, q.understanding); // 現在の状態を初期値とする
    });

    historySorted.forEach((record, index) => {
      if (!record || !record.timestamp || !record.questionId) return; // 不正データスキップ
      const recordDate = new Date(record.timestamp);
      const recordDateString = formatDateInternal(recordDate);
      const currentUnderstanding = record.understanding || '';
      const previousUnderstanding = questionLastState.get(record.questionId); // このレコード直前の状態

      if (currentDate === '') {
        currentDate = recordDateString;
         let initialCount = 0;
         questionLastState.forEach(state => { if(state?.startsWith('曖昧△')) initialCount++; });
         dailyAmbiguousCount = initialCount;

      } else if (recordDateString !== currentDate) {
        trends.push({ date: currentDate, count: dailyAmbiguousCount });
        currentDate = recordDateString;
      }

      const wasAmbiguous = previousUnderstanding?.startsWith('曖昧△');
      const isAmbiguous = currentUnderstanding.startsWith('曖昧△');

      if (!wasAmbiguous && isAmbiguous) {
        dailyAmbiguousCount++;
      } else if (wasAmbiguous && !isAmbiguous) {
        dailyAmbiguousCount = Math.max(0, dailyAmbiguousCount - 1);
      }

      questionLastState.set(record.questionId, currentUnderstanding);

      if (index === historySorted.length - 1) {
        trends.push({ date: currentDate, count: dailyAmbiguousCount });
      }
    });
     console.log("[AmbiguousTrendsPage] Calculated ambiguous trends data points:", trends.length);
    return trends;
  }, [answerHistory, ambiguousQuestions]);

  // フィルター後の全曖昧問題データ
  const filteredQuestionsBase = useMemo(() => {
    let filtered = [...ambiguousQuestions];
    if (filter.reason !== 'all') {
      filtered = filtered.filter(q => q.reason === filter.reason);
    }
    if (filter.subject !== 'all') {
      filtered = filtered.filter(q => q.subjectName === filter.subject);
    }
    if (filter.period !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      switch (filter.period) {
        case 'week': cutoffDate.setDate(now.getDate() - 7); break;
        case 'month': cutoffDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': cutoffDate.setMonth(now.getMonth() - 3); break;
        default: break;
      }
      if (filter.period !== 'all') {
        filtered = filtered.filter(q => q.lastAnswered && q.lastAnswered >= cutoffDate);
      }
    }
    return filtered;
  }, [ambiguousQuestions, filter]);

  // 各リストのソート済みデータ
  const filteredAndSortedQuestions = useMemo(() => sortData(filteredQuestionsBase, sort.key, sort.order), [filteredQuestionsBase, sort]);
  const sortedLongStagnantQuestions = useMemo(() => sortData(longStagnantQuestions, sort.key, sort.order), [longStagnantQuestions, sort]);
  const sortedRecentRevertedQuestions = useMemo(() => sortData(recentRevertedQuestions, sort.key, sort.order), [recentRevertedQuestions, sort]);
  const sortedCompleteRevertedQuestions = useMemo(() => sortData(completeRevertedQuestions, sort.key, sort.order), [completeRevertedQuestions, sort]);

  // フィルター用オプション
  const filterOptions = useMemo(() => {
    const reasons = [...new Set(ambiguousQuestions.map(q => q.reason))].sort();
    const subjects = [...new Set(ambiguousQuestions.map(q => q.subjectName))].sort();
    return { reasons, subjects };
  }, [ambiguousQuestions]);

  // --- Handlers --- (変更なし)
  const handleSort = (key) => {
    setSort(prevSort => ({
      key: key,
      order: prevSort.key === key && prevSort.order === 'desc' ? 'asc' : 'desc'
    }));
  };
  const getSortIcon = (key) => {
    if (sort.key !== key) {
      return <ArrowUpDown size={14} className={styles.sortIcon} />;
    }
    return sort.order === 'desc'
      ? <ChevronDown size={14} className={styles.sortIconActive} />
      : <ChevronUp size={14} className={styles.sortIconActive} />;
  };
  const handleEditCommentClick = (question) => { setEditingCommentQuestion(question); };
  const handleCloseCommentModal = () => { setEditingCommentQuestion(null); };

  // --- テーブルレンダリング関数 ---
  // (renderTable内の変更点はコメントセル部分のみ)
  const renderTable = (title, titleIcon, titleColor, subtitle, data, emptyMessage, emptyBgColor) => {
    const tableData = Array.isArray(data) ? data : [];
    console.log(`Rendering table: ${title}, Data count: ${tableData.length}`);
    return (
       <div className={styles.tableContainer} style={{marginTop: '2rem', borderColor: titleColor || '#e5e7eb' }}>
         <h3 className={styles.tableTitle} style={{color: titleColor || '#1f2937' }}> {titleIcon && React.createElement(titleIcon, { size: 18, style: { marginRight: '0.5rem', color: titleColor || '#4f46e5' } })} {title} ({tableData.length}件) {subtitle && <span style={{fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.5rem', color: '#71717a' }}>{subtitle}</span>} </h3>
         {tableData.length > 0 ? (
           <table className={styles.table}>
             <thead> <tr> <th onClick={() => handleSort('id')}>問題ID {getSortIcon('id')}</th> <th onClick={() => handleSort('subjectName')}>科目 {getSortIcon('subjectName')}</th> <th onClick={() => handleSort('chapterName')}>章 {getSortIcon('chapterName')}</th> <th onClick={() => handleSort('reason')}>理由 {getSortIcon('reason')}</th> <th>コメント</th> <th onClick={() => handleSort('correctRate')}>正答率 {getSortIcon('correctRate')}</th> <th onClick={() => handleSort('answerCount')}>解答回数 {getSortIcon('answerCount')}</th> <th onClick={() => handleSort('lastAnswered')}>最終解答日 {getSortIcon('lastAnswered')}</th> <th>編集</th> </tr> </thead>
             <tbody> {tableData.map(q => {
                if (!q) return null;
                const lastAnsweredDate = (q.lastAnswered instanceof Date && !isNaN(q.lastAnswered)) ? q.lastAnswered : null;
                return (
                 <tr key={q.id}>
                   <td>{q.id ?? 'N/A'}</td>
                   <td>{q.subjectName ?? 'N/A'}</td>
                   <td>{q.chapterName ?? 'N/A'}</td>
                   <td>{q.reason ?? 'N/A'}</td>
                   {/* ★★★ コメントセル: カスタムツールチップ用に修正 ★★★ */}
                   <td className={styles.commentCell}>
                     <div className={styles.tooltipContainer}> {/* 位置調整用の親要素 */}
                       {/* title属性を削除し、data-tooltip属性に変更 */}
                       <span data-tooltip={q.comment ?? ''}>{q.comment ?? ''}</span>
                     </div>
                   </td>
                   {/* ★★★ ここまでが変更箇所 ★★★ */}
                   <td>{q.correctRate != null ? `${q.correctRate}%` : 'N/A'}</td>
                   <td>{q.answerCount ?? 'N/A'}</td>
                   <td style={title === '長期停滞している曖昧問題' ? {color: '#dc2626', fontWeight: 500} : {}}>{formatDate(lastAnsweredDate)}</td>
                   <td> <button onClick={() => handleEditCommentClick(q)} className={styles.editCommentButton} title="コメント編集"><Edit2 size={16}/></button> </td>
                 </tr>
                );
              })}
             </tbody>
           </table>
         ) : ( <div className={styles.noDataMessage} style={{backgroundColor: emptyBgColor || '#f9fafb' }}> {emptyMessage} </div> )}
       </div> ); };

  // --- Component Render ---
  return (
    <div className={styles.container}>
      <h2 className={styles.title}> <Info className={styles.titleIcon} /> 曖昧問題傾向分析 </h2>

      <div className={styles.filterToggleContainer}> <button onClick={() => setShowFilters(!showFilters)} className={styles.filterToggleButton}> <Filter size={16} /> フィルター・並べ替え {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />} </button> </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGrid}>
            <div>
              <label htmlFor="reasonFilter" className={styles.filterLabel}>理由</label>
              <select id="reasonFilter" value={filter.reason} onChange={(e) => setFilter({ ...filter, reason: e.target.value })} className={styles.filterSelect} >
                <option value="all">全ての理由</option>
                {filterOptions.reasons.map(reason => (<option key={reason} value={reason}>{reason}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="subjectFilter" className={styles.filterLabel}>科目</label>
              <select id="subjectFilter" value={filter.subject} onChange={(e) => setFilter({ ...filter, subject: e.target.value })} className={styles.filterSelect} >
                <option value="all">全ての科目</option>
                {filterOptions.subjects.map(subject => (<option key={subject} value={subject}>{subject}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="periodFilter" className={styles.filterLabel}>最終解答期間</label>
              <select id="periodFilter" value={filter.period} onChange={(e) => setFilter({ ...filter, period: e.target.value })} className={styles.filterSelect} >
                <option value="all">全期間</option>
                <option value="week">直近1週間</option>
                <option value="month">直近1ヶ月</option>
                <option value="quarter">直近3ヶ月</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}> <BarChart2 size={18} /> 科目別の曖昧問題数 </h3>
        {ambiguousCountBySubject.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ambiguousCountBySubject} margin={{ top: 5, right: 20, left: -10, bottom: 50 }} barGap={5} >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="subjectName" tick={{ fontSize: 11, fill: '#4b5563' }} angle={-45} textAnchor="end" height={60} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" name="曖昧問題数" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noDataMessage}>グラフを表示するデータがありません。</div>
        )}
      </div>
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}> <TrendingUp size={18} /> 曖昧問題数の推移 (日次) </h3>
        {ambiguousTrendsData.length > 1 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ambiguousTrendsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4b5563' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} allowDecimals={false} domain={['auto', 'auto']} />
              <Tooltip cursor={{ stroke: '#a5b4fc', strokeWidth: 1 }} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="count" name="曖昧問題数" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noDataMessage}>
            {answerHistory.length === 0 ? '解答履歴データがありません。' : 'グラフを表示するための十分な解答履歴データがありません。(2日分以上の記録が必要です)'}
          </div>
        )}
      </div>

      {/* テーブル表示エリア */}
      {renderTable('長期停滞している曖昧問題', AlertCircle, '#b45309', '(最終解答日から30日以上経過)', sortedLongStagnantQuestions, '長期停滞している曖昧問題はありません。', '#fffbeb')}
      {renderTable('直近の"揺り戻し"が発生した問題', TrendingDown, '#f97316', '(直前の解答が「理解○」だった問題)', sortedRecentRevertedQuestions, '直近で「理解○」→「曖昧△」となった問題はありません。', '#fff7ed')}
      {renderTable('完全な"揺り戻しサイクル"を経験した問題', RotateCcw, '#5b21b6', '(曖昧△ → 理解○ → 曖昧△ の流れを経験)', sortedCompleteRevertedQuestions, '完全な"揺り戻しサイクル"を経験した問題はありません。', '#f5f3ff')}
      {renderTable('全ての曖昧問題リスト', null, '#374151', '(現在のフィルターとソート適用)', filteredAndSortedQuestions, ambiguousQuestions.length > 0 ? '表示できる曖昧問題がありません。フィルター条件を変更してみてください。' : '曖昧と評価された問題はまだありません。', null)}

      {editingCommentQuestion && ( <CommentEditModal question={editingCommentQuestion} onSave={saveComment} onCancel={handleCloseCommentModal} /> )}
    </div>
  );
};

export default AmbiguousTrendsPage;
