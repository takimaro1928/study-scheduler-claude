// src/AmbiguousTrendsPage.js (ソート完全修正版 - 本当に本当に本当に完全版!!!)
import React, { useState, useEffect, useMemo } from 'react';
import { Filter, ChevronDown, ChevronUp, Info, ArrowUpDown, BarChart2, AlertCircle, RotateCcw, TrendingUp, Edit2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import styles from './AmbiguousTrendsPage.module.css';
import CommentEditModal from './CommentEditModal';

// 曖昧問題データを取得・整形する関数
function getAmbiguousQuestions(subjects) {
  const ambiguousQuestions = [];
  if (!Array.isArray(subjects)) return ambiguousQuestions;
  subjects.forEach(subject => {
    if (!subject?.chapters) return;
    subject.chapters.forEach(chapter => {
      if (!chapter?.questions) return;
      chapter.questions.forEach(question => {
        if (typeof question !== 'object' || question === null) return;
        if (question.understanding?.startsWith('曖昧△')) {
          let reason = '理由なし'; if (question.understanding.includes(':')) { reason = question.understanding.split(':')[1].trim(); }
          const lastAnsweredDate = question.lastAnswered ? new Date(question.lastAnswered) : null;
          const nextDateDate = question.nextDate ? new Date(question.nextDate) : null;
          ambiguousQuestions.push({
            id: question.id || '?', subjectId: subject.id, subjectName: subject.name || '?',
            chapterId: chapter.id, chapterName: chapter.name || '?', reason: reason,
            correctRate: question.correctRate ?? 0,
            lastAnswered: !isNaN(lastAnsweredDate?.getTime()) ? lastAnsweredDate : null,
            nextDate: !isNaN(nextDateDate?.getTime()) ? nextDateDate : null,
            answerCount: question.answerCount ?? 0, previousUnderstanding: question.previousUnderstanding,
            comment: question.comment || '',
          });
        }
      });
    });
  });
  return ambiguousQuestions;
}

// 日付のフォーマット関数
const formatDateInternal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) { return '----/--/--'; }
  try { return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`; }
  catch (e) { console.error("formatDateエラー:", e); return 'エラー'; }
};

// 自然順ソート用の比較関数
function naturalSortCompare(a, b) {
    // null や undefined を比較するヘルパー
    const handleNulls = (valA, valB) => {
        const aIsNull = valA == null;
        const bIsNull = valB == null;
        if (aIsNull && bIsNull) return 0; // 両方 null なら等しい
        if (aIsNull) return 1; // a が null なら b より大きい (後ろへ)
        if (bIsNull) return -1; // b が null なら a より大きい (a が前へ)
        return null; // 両方 null でない
    };

    const nullComparison = handleNulls(a, b);
    if (nullComparison !== null) return nullComparison;

    // 数値と非数値の分割パターン
    const re = /(\d+)|(\D+)/g;
    // 文字列に変換してから分割
    const aParts = String(a).match(re) || [];
    const bParts = String(b).match(re) || [];

    const len = Math.min(aParts.length, bParts.length);
    for (let i = 0; i < len; i++) {
        const aPart = aParts[i];
        const bPart = bParts[i];
        const aNum = parseInt(aPart, 10);
        const bNum = parseInt(bPart, 10);

        // 両方数値として解釈できれば数値比較
        if (!isNaN(aNum) && !isNaN(bNum)) {
            if (aNum !== bNum) return aNum - bNum;
        } else {
            // 文字列比較 (localeCompare)
            const comparison = aPart.localeCompare(bPart, undefined, { sensitivity: 'base' });
            if (comparison !== 0) return comparison;
        }
    }
    // 全パーツが同じ場合、パーツの数で比較（短い方を先に）
    return aParts.length - bParts.length;
}


// ソート処理を共通化する関数 (比較ロジック改善)
const sortData = (dataToSort, sortKey, sortOrder) => {
  if (!dataToSort || dataToSort.length === 0) return []; // 空配列チェック
  // slice() でコピーを作成してからソート
  return dataToSort.slice().sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    let comparison = 0;

    // null/undefined を常に最後にする (昇順の場合)
    const nullOrder = sortOrder === 'asc' ? 1 : -1;
    if (valA == null && valB != null) return nullOrder;
    if (valA != null && valB == null) return -nullOrder;
    if (valA == null && valB == null) return 0;

    // 型に基づいた比較
    if (valA instanceof Date && valB instanceof Date) {
      comparison = valA.getTime() - valB.getTime();
    } else if (typeof valA === 'number' && typeof valB === 'number') {
      comparison = valA - valB;
    } else if (typeof valA === 'string' && typeof valB === 'string') {
      // ★ 自然順ソートが必要なキーを増やす
      if (['id', 'subjectName', 'chapterName', 'reason'].includes(sortKey)) {
           comparison = naturalSortCompare(valA, valB);
      } else {
          comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
      }
    } else {
      // 型が混在する場合のフォールバック (文字列として比較)
      try { comparison = String(valA).localeCompare(String(valB)); } catch (e) { comparison = 0; }
    }
    // 昇順/降順を適用
    return sortOrder === 'asc' ? comparison : comparison * -1;
  });
};


// 曖昧問題傾向表示ページコンポーネント
const AmbiguousTrendsPage = ({ subjects, formatDate = formatDateInternal, answerHistory = [], saveComment }) => {
  // --- State ---
  const [filter, setFilter] = useState({ reason: 'all', subject: 'all', period: 'all' });
  const [sort, setSort] = useState({ key: 'lastAnswered', order: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [editingCommentQuestion, setEditingCommentQuestion] = useState(null);

  // --- Memoized Data ---
  const ambiguousQuestions = useMemo(() => getAmbiguousQuestions(subjects || []), [subjects]);
  const ambiguousCountBySubject = useMemo(() => { const counts = {}; ambiguousQuestions.forEach(q => { counts[q.subjectName] = (counts[q.subjectName] || 0) + 1; }); return Object.entries(counts).map(([name, count]) => ({ subjectName: name, count })).sort((a, b) => b.count - a.count); }, [ambiguousQuestions]);
  const longStagnantQuestions = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 30); d.setHours(0,0,0,0); return ambiguousQuestions.filter(q => q.lastAnswered && q.lastAnswered < d); }, [ambiguousQuestions]);
  const simpleRevertedQuestions = useMemo(() => ambiguousQuestions.filter(q => q.previousUnderstanding === '理解○'), [ambiguousQuestions]); // 直近揺り戻し
  const ambiguousTrendsData = useMemo(() => { if (!answerHistory?.length) return []; const h = [...answerHistory].sort((a,b) => new Date(a.timestamp).getTime()-new Date(b.timestamp).getTime()); const t = []; const s = new Map(); let cd = ''; let ac = 0; h.forEach((r, i) => { const rd = new Date(r.timestamp); const rs = formatDateInternal(rd); if(cd===''){cd=rs;} else if(rs!==cd){t.push({date:cd,count:ac});cd=rs;} const p = s.get(r.questionId); const c = r.understanding; s.set(r.questionId,c); const wa = p?.startsWith('曖昧△'); const ia = c?.startsWith('曖昧△'); if(!wa&&ia){ac++;} else if(wa&&!ia){ac=Math.max(0,ac-1);} if(i===h.length-1){t.push({date:cd,count:ac});}}); return t; }, [answerHistory, subjects]);
  // 完全な揺り戻しサイクルがあった問題
  const completeRevertedQuestions = useMemo(() => {
    if (!answerHistory || answerHistory.length === 0) return [];
    const historyByQuestion = answerHistory.reduce((acc, record) => { if (!record?.questionId) return acc; if (!acc[record.questionId]) acc[record.questionId] = []; const timestamp = new Date(record.timestamp); if (!isNaN(timestamp.getTime())) acc[record.questionId].push({ timestamp, understanding: record.understanding || '' }); return acc; }, {});
    Object.values(historyByQuestion).forEach(history => history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
    const revertedQuestionIds = new Set();
    Object.keys(historyByQuestion).forEach(questionId => { const history = historyByQuestion[questionId]; let state = 'initial'; for (const record of history) { const isAmbiguous = record.understanding.startsWith('曖昧△'); const isUnderstood = record.understanding === '理解○'; switch (state) { case 'initial': if (isAmbiguous) state = 'ambiguous'; else if (isUnderstood) state = 'understood'; break; case 'ambiguous': if (isUnderstood) state = 'understood'; break; case 'understood': if (isAmbiguous) { state = 'reverted'; revertedQuestionIds.add(questionId); } break; case 'reverted': break; default: break; } if (state === 'reverted') break; } });
    const allCurrentQuestions = subjects.flatMap(s => s.chapters.flatMap(c => c.questions)); // subjects から最新の問題リスト取得
    return allCurrentQuestions.filter(q => revertedQuestionIds.has(q.id)); // IDが一致する問題を取得
  }, [answerHistory, subjects]); // subjects も依存配列に


  // フィルター後のデータを準備
  const filteredQuestionsBase = useMemo(() => {
    let filtered = [...ambiguousQuestions];
    if (filter.reason !== 'all') { filtered = filtered.filter(q => q.reason === filter.reason); }
    if (filter.subject !== 'all') { filtered = filtered.filter(q => q.subjectName === filter.subject); }
    if (filter.period !== 'all') { const n = new Date(); const c = new Date(); c.setHours(0,0,0,0); n.setHours(0,0,0,0); switch(filter.period){case 'week':c.setDate(n.getDate()-7);break;case 'month':c.setMonth(n.getMonth()-1);break;case 'quarter':c.setMonth(n.getMonth()-3);break;default:break;} if(filter.period!=='all'){filtered=filtered.filter(q=>q.lastAnswered&&q.lastAnswered>=c);} }
    return filtered;
  }, [ambiguousQuestions, filter]);

  // 各リストのソート済みデータ (sortData 関数を使用)
  const filteredAndSortedQuestions = useMemo(() => sortData(filteredQuestionsBase, sort.key, sort.order), [filteredQuestionsBase, sort]);
  const sortedLongStagnantQuestions = useMemo(() => sortData(longStagnantQuestions, sort.key, sort.order), [longStagnantQuestions, sort]);
  const sortedSimpleRevertedQuestions = useMemo(() => sortData(simpleRevertedQuestions, sort.key, sort.order), [simpleRevertedQuestions, sort]);
  const sortedCompleteRevertedQuestions = useMemo(() => sortData(completeRevertedQuestions, sort.key, sort.order), [completeRevertedQuestions, sort]);

  // フィルター用オプション
  const filterOptions = useMemo(() => { const r = [...new Set(ambiguousQuestions.map(q => q.reason))].sort(); const s = [...new Set(ambiguousQuestions.map(q => q.subjectName))].sort(); return { reasons:r, subjects:s }; }, [ambiguousQuestions]);

  // ソートハンドラ
  const handleSort = (key) => { setSort(prevSort => ({ key: key, order: prevSort.key === key && prevSort.order === 'desc' ? 'asc' : 'desc' })); };
  // ソートアイコン表示
  const getSortIcon = (key) => { if (sort.key !== key) { return <ArrowUpDown size={14} className={styles.sortIcon} />; } return sort.order === 'desc' ? <ChevronDown size={14} className={styles.sortIconActive} /> : <ChevronUp size={14} className={styles.sortIconActive} />; };

  // コメント編集モーダルハンドラ
  const handleEditCommentClick = (question) => { setEditingCommentQuestion(question); };
  const handleCloseCommentModal = () => { setEditingCommentQuestion(null); };

  // テーブルレンダリング関数
  const renderTable = (title, titleIcon, titleColor, subtitle, data, emptyMessage, emptyBgColor) => {
    return (
       <div className={styles.tableContainer} style={{marginTop: '2rem', borderColor: titleColor || '#e5e7eb' }}>
         <h3 className={styles.tableTitle} style={{color: titleColor || '#1f2937' }}> {titleIcon && React.createElement(titleIcon, { size: 18, style: { marginRight: '0.5rem', color: titleColor || '#4f46e5' } })} {title} ({data.length}件) {subtitle && <span style={{fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.5rem', color: '#71717a' }}>{subtitle}</span>} </h3>
         {data.length > 0 ? (
           <table className={styles.table}>
             <thead> <tr> <th onClick={() => handleSort('id')}>問題ID {getSortIcon('id')}</th> <th onClick={() => handleSort('subjectName')}>科目 {getSortIcon('subjectName')}</th> <th onClick={() => handleSort('chapterName')}>章 {getSortIcon('chapterName')}</th> <th onClick={() => handleSort('reason')}>理由 {getSortIcon('reason')}</th> <th>コメント</th> <th onClick={() => handleSort('correctRate')}>正答率 {getSortIcon('correctRate')}</th> <th onClick={() => handleSort('answerCount')}>解答回数 {getSortIcon('answerCount')}</th> <th onClick={() => handleSort('lastAnswered')}>最終解答日 {getSortIcon('lastAnswered')}</th> <th>編集</th> </tr> </thead>
             <tbody> {data.map(q => ( <tr key={q.id}> <td>{q.id}</td> <td>{q.subjectName}</td> <td>{q.chapterName}</td> <td>{q.reason}</td> <td className={styles.commentCell}><span title={q.comment}>{q.comment}</span></td> <td>{q.correctRate}%</td> <td>{q.answerCount}</td> <td style={title === '長期停滞している曖昧問題' ? {color: '#dc2626', fontWeight: 500} : {}}>{formatDate(q.lastAnswered)}</td> <td> <button onClick={() => handleEditCommentClick(q)} className={styles.editCommentButton} title="コメント編集"><Edit2 size={16}/></button> </td> </tr> ))} </tbody>
           </table>
         ) : ( <div className={styles.noDataMessage} style={{backgroundColor: emptyBgColor || '#f9fafb' }}> {emptyMessage} </div> )}
       </div> ); };

  // --- Component Render ---
  return (
    <div className={styles.container}>
      <h2 className={styles.title}> <Info className={styles.titleIcon} /> 曖昧問題傾向分析 </h2>
      <div className={styles.filterToggleContainer}> <button onClick={() => setShowFilters(!showFilters)} className={styles.filterToggleButton}> <Filter size={16} /> フィルター・並べ替え {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />} </button> </div>
      {showFilters && ( <div className={styles.filterPanel}> <div className={styles.filterGrid}> <div> <label htmlFor="reasonFilter" className={styles.filterLabel}>理由</label> <select id="reasonFilter" value={filter.reason} onChange={(e) => setFilter({ ...filter, reason: e.target.value })} className={styles.filterSelect} > <option value="all">全ての理由</option> {filterOptions.reasons.map(reason => (<option key={reason} value={reason}>{reason}</option>))} </select> </div> <div> <label htmlFor="subjectFilter" className={styles.filterLabel}>科目</label> <select id="subjectFilter" value={filter.subject} onChange={(e) => setFilter({ ...filter, subject: e.target.value })} className={styles.filterSelect} > <option value="all">全ての科目</option> {filterOptions.subjects.map(subject => (<option key={subject} value={subject}>{subject}</option>))} </select> </div> <div> <label htmlFor="periodFilter" className={styles.filterLabel}>最終解答期間</label> <select id="periodFilter" value={filter.period} onChange={(e) => setFilter({ ...filter, period: e.target.value })} className={styles.filterSelect} > <option value="all">全期間</option> <option value="week">直近1週間</option> <option value="month">直近1ヶ月</option> <option value="quarter">直近3ヶ月</option> </select> </div> </div> </div> )}
      <div className={styles.chartContainer}> <h3 className={styles.chartTitle}> <BarChart2 size={18} /> 科目別の曖昧問題数 </h3> {ambiguousCountBySubject.length > 0 ? ( <ResponsiveContainer width="100%" height={300}> <BarChart data={ambiguousCountBySubject} margin={{ top: 5, right: 20, left: -10, bottom: 50 }} barGap={5} > <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /> <XAxis dataKey="subjectName" tick={{ fontSize: 11, fill: '#4b5563' }} angle={-45} textAnchor="end" height={60} interval={0} /> <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} allowDecimals={false} /> <Tooltip cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} /> <Bar dataKey="count" name="曖昧問題数" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} /> </BarChart> </ResponsiveContainer> ) : ( <div className={styles.noDataMessage}>グラフを表示するデータがありません。</div> )} </div>
      <div className={styles.chartContainer}> <h3 className={styles.chartTitle}> <TrendingUp size={18} /> 曖昧問題数の推移 (日次) </h3> {ambiguousTrendsData.length > 1 ? ( <ResponsiveContainer width="100%" height={300}> <LineChart data={ambiguousTrendsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} > <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/> <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4b5563' }} /> <YAxis tick={{ fontSize: 11, fill: '#4b5563' }} allowDecimals={false} domain={['auto', 'auto']} /> <Tooltip cursor={{ stroke: '#a5b4fc', strokeWidth: 1 }} contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} /> <Line type="monotone" dataKey="count" name="曖昧問題数" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} /> </LineChart> </ResponsiveContainer> ) : ( <div className={styles.noDataMessage}> {answerHistory.length === 0 ? '解答履歴データがありません。' : 'グラフを表示するための十分な解答履歴データがありません。(2日分以上の記録が必要です)'} </div> )} </div>
      {renderTable('長期停滞している曖昧問題', AlertCircle, '#b45309', '(最終解答日から30日以上経過)', sortedLongStagnantQuestions, '長期停滞している曖昧問題はありません。', '#fffbeb')}
      {renderTable('完全な"揺り戻し"が発生した問題', RotateCcw, '#5b21b6', '(曖昧→理解→曖昧 を経験)', sortedCompleteRevertedQuestions, '完全な"揺り戻し"が発生した問題はありません。', '#f5f3ff')}
      {renderTable('直近で"揺り戻し"た問題', Repeat, '#a78bfa', '(前回「理解○」→ 今回「曖昧△」)', sortedSimpleRevertedQuestions, '直近で"揺り戻し"た問題はありません。', '#f5f3ff')}
      {renderTable('全ての曖昧問題リスト', null, '#374151', null, filteredAndSortedQuestions, ambiguousQuestions.length > 0 ? '表示できる曖昧問題がありません。フィルター条件を変更してみてください。' : '曖昧と評価された問題はまだありません。', null)}
      {editingCommentQuestion && ( <CommentEditModal question={editingCommentQuestion} onSave={saveComment} onCancel={handleCloseCommentModal} /> )}
    </div>
  );
};

export default AmbiguousTrendsPage;
