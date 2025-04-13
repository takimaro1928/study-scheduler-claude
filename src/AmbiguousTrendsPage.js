// src/AmbiguousTrendsPage.js (ソート比較ロジック修正・コメントUI実装 - 本当に完全版!!)
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

// 曖昧問題傾向表示ページコンポーネント
const AmbiguousTrendsPage = ({ subjects, formatDate = formatDateInternal, answerHistory = [], saveComment }) => {
  // --- State ---
  const [filter, setFilter] = useState({ reason: 'all', subject: 'all', period: 'all' });
  const [sort, setSort] = useState({ key: 'lastAnswered', order: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [editingCommentQuestion, setEditingCommentQuestion] = useState(null);

  // --- Memoized Data ---
  const ambiguousQuestions = useMemo(() => getAmbiguousQuestions(subjects || []), [subjects]);

  const ambiguousCountBySubject = useMemo(() => {
    const counts = {};
    ambiguousQuestions.forEach(q => { counts[q.subjectName] = (counts[q.subjectName] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ subjectName: name, count })).sort((a, b) => b.count - a.count);
  }, [ambiguousQuestions]);

  const longStagnantQuestions = useMemo(() => {
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
    THIRTY_DAYS_AGO.setHours(0, 0, 0, 0);
    return ambiguousQuestions.filter(q => q.lastAnswered && q.lastAnswered < THIRTY_DAYS_AGO);
  }, [ambiguousQuestions]);

  const revertedQuestions = useMemo(() => {
    return ambiguousQuestions.filter(q => q.previousUnderstanding === '理解○');
  }, [ambiguousQuestions]);

  const ambiguousTrendsData = useMemo(() => {
    if (!answerHistory?.length) return [];
    const sortedHistory = [...answerHistory].sort((a,b) => new Date(a.timestamp).getTime()-new Date(b.timestamp).getTime());
    const trends = []; const questionStatus = new Map(); let currentDateStr = ''; let ambiguousCount = 0;
    sortedHistory.forEach((record, index) => { const recordDate = new Date(record.timestamp); const recordDateStr = formatDateInternal(recordDate); if(currentDateStr === ''){currentDateStr = recordDateStr;} else if(recordDateStr !== currentDateStr){ trends.push({date:currentDateStr, count:ambiguousCount}); currentDateStr = recordDateStr; } const previousUnderstanding = questionStatus.get(record.questionId); const currentUnderstanding = record.understanding; questionStatus.set(record.questionId, currentUnderstanding); const wasAmbiguous = previousUnderstanding?.startsWith('曖昧△'); const isAmbiguous = currentUnderstanding?.startsWith('曖昧△'); if(!wasAmbiguous && isAmbiguous){ambiguousCount++;} else if(wasAmbiguous && !isAmbiguous){ambiguousCount = Math.max(0, ambiguousCount - 1);} if(index === sortedHistory.length - 1){ trends.push({date:currentDateStr, count:ambiguousCount}); } });
    return trends;
  }, [answerHistory, subjects]);

  // フィルターとソートを適用した全曖昧問題リスト
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = [...ambiguousQuestions];
    if (filter.reason !== 'all') { filtered = filtered.filter(q => q.reason === filter.reason); }
    if (filter.subject !== 'all') { filtered = filtered.filter(q => q.subjectName === filter.subject); }
    if (filter.period !== 'all') { const n = new Date(); const c = new Date(); c.setHours(0,0,0,0); n.setHours(0,0,0,0); switch(filter.period){case 'week':c.setDate(n.getDate()-7);break;case 'month':c.setMonth(n.getMonth()-1);break;case 'quarter':c.setMonth(n.getMonth()-3);break;default:break;} if(filter.period!=='all'){filtered=filtered.filter(q=>q.lastAnswered&&q.lastAnswered>=c);} }

    const sorted = filtered.slice().sort((a, b) => {
      const valA = a[sort.key]; const valB = b[sort.key]; let comparison = 0;
      if (valA == null && valB != null) return sort.order === 'asc' ? 1 : -1; if (valA != null && valB == null) return sort.order === 'asc' ? -1 : 1; if (valA == null && valB == null) return 0;
      if (valA instanceof Date && valB instanceof Date) { comparison = valA.getTime() - valB.getTime(); }
      else if (typeof valA === 'number' && typeof valB === 'number') { comparison = valA - valB; }
      else if (typeof valA === 'string' && typeof valB === 'string') { comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }); }
      else { if (valA < valB) comparison = -1; if (valA > valB) comparison = 1; }
      return sort.order === 'asc' ? comparison : comparison * -1;
    });
    return sorted;
  }, [ambiguousQuestions, filter, sort]);

  // フィルター用オプション
  const filterOptions = useMemo(() => {
     const reasons = [...new Set(ambiguousQuestions.map(q => q.reason))].sort();
     const subjects = [...new Set(ambiguousQuestions.map(q => q.subjectName))].sort();
     return { reasons, subjects };
   }, [ambiguousQuestions]);

  // ソートハンドラ
  const handleSort = (key) => {
    setSort(prevSort => ({ key: key, order: prevSort.key === key && prevSort.order === 'desc' ? 'asc' : 'desc' }));
  };
  // ソートアイコン表示
  const getSortIcon = (key) => {
     if (sort.key !== key) { return <ArrowUpDown size={14} className={styles.sortIcon} />; }
     return sort.order === 'desc' ? <ChevronDown size={14} className={styles.sortIconActive} /> : <ChevronUp size={14} className={styles.sortIconActive} />;
   };

  // 長期停滞リスト用のソート済みデータ
  const sortedLongStagnantQuestions = useMemo(() => {
      const sorted = longStagnantQuestions.slice().sort((a, b) => {
        const valA = a[sort.key]; const valB = b[sort.key]; let comparison = 0;
        if (valA == null && valB != null) return sort.order === 'asc' ? 1 : -1; if (valA != null && valB == null) return sort.order === 'asc' ? -1 : 1; if (valA == null && valB == null) return 0;
        if (valA instanceof Date && valB instanceof Date) { comparison = valA.getTime() - valB.getTime(); }
        else if (typeof valA === 'number' && typeof valB === 'number') { comparison = valA - valB; }
        else if (typeof valA === 'string' && typeof valB === 'string') { comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }); }
        else { if (valA < valB) comparison = -1; if (valA > valB) comparison = 1; }
        return sort.order === 'asc' ? comparison : comparison * -1;
      });
      return sorted;
  }, [longStagnantQuestions, sort]);

  // 揺り戻しリスト用のソート済みデータ
  const sortedRevertedQuestions = useMemo(() => {
      let sorted = revertedQuestions.slice().sort((a, b) => {
        const valA = a[sort.key]; const valB = b[sort.key]; let comparison = 0;
        if (valA == null && valB != null) return sort.order === 'asc' ? 1 : -1; if (valA != null && valB == null) return sort.order === 'asc' ? -1 : 1; if (valA == null && valB == null) return 0;
        if (valA instanceof Date && valB instanceof Date) { comparison = valA.getTime() - valB.getTime(); }
        else if (typeof valA === 'number' && typeof valB === 'number') { comparison = valA - valB; }
        else if (typeof valA === 'string' && typeof valB === 'string') { comparison = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }); }
        else { if (valA < valB) comparison = -1; if (valA > valB) comparison = 1; }
        return sort.order === 'asc' ? comparison : comparison * -1;
      });
      return sorted;
  }, [revertedQuestions, sort]);

  // コメント編集モーダルハンドラ
  const handleEditCommentClick = (question) => { setEditingCommentQuestion(question); };
  const handleCloseCommentModal = () => { setEditingCommentQuestion(null); };

  // テーブルレンダリング関数
  const renderTable = (title, titleIcon, titleColor, subtitle, data, emptyMessage, emptyBgColor) => {
    // console.log('[AmbiguousTrendsPage] renderTable called for:', title, 'with data count:', data.length); // デバッグログは一旦削除
    return (
       <div className={styles.tableContainer} style={{marginTop: '2rem', borderColor: titleColor || '#e5e7eb' }}>
         <h3 className={styles.tableTitle} style={{color: titleColor || '#1f2937' }}>
           {titleIcon && React.createElement(titleIcon, { size: 18, style: { marginRight: '0.5rem', color: titleColor || '#4f46e5' } })}
           {title} ({data.length}件)
           {subtitle && <span style={{fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.5rem', color: '#71717a' }}>{subtitle}</span>}
         </h3>
         {data.length > 0 ? (
           <table className={styles.table}>
             <thead>
               <tr>
                 <th onClick={() => handleSort('id')}>問題ID {getSortIcon('id')}</th>
                 <th onClick={() => handleSort('subjectName')}>科目 {getSortIcon('subjectName')}</th>
                 <th onClick={() => handleSort('chapterName')}>章 {getSortIcon('chapterName')}</th>
                 <th onClick={() => handleSort('reason')}>理由 {getSortIcon('reason')}</th>
                 <th>コメント</th>
                 <th onClick={() => handleSort('correctRate')}>正答率 {getSortIcon('correctRate')}</th>
                 <th onClick={() => handleSort('answerCount')}>解答回数 {getSortIcon('answerCount')}</th>
                 <th onClick={() => handleSort('lastAnswered')}>最終解答日 {getSortIcon('lastAnswered')}</th>
                 <th>編集</th>
               </tr>
             </thead>
             <tbody>
               {data.map(q => (
                 <tr key={q.id}>
                   <td>{q.id}</td>
                   <td>{q.subjectName}</td>
                   <td>{q.chapterName}</td>
                   <td>{q.reason}</td>
                   <td className={styles.commentCell}><span title={q.comment}>{q.comment}</span></td>
                   <td>{q.correctRate}%</td>
                   <td>{q.answerCount}</td>
                   <td style={title === '長期停滞している曖昧問題' ? {color: '#dc2626', fontWeight: 500} : {}}>{formatDate(q.lastAnswered)}</td>
                   <td> <button onClick={() => handleEditCommentClick(q)} className={styles.editCommentButton} title="コメント編集"><Edit2 size={16}/></button> </td>
                 </tr>
               ))}
             </tbody>
           </table>
         ) : (
           <div className={styles.noDataMessage} style={{backgroundColor: emptyBgColor || '#f9fafb' }}>
             {emptyMessage}
           </div>
         )}
       </div>
    );
  };

  // --- Component Render ---
  // console.log('[AmbiguousTrendsPage] Rendering...'); // デバッグログは一旦削除
  return (
    <div className={styles.container}>
      <h2 className={styles.title}> <Info className={styles.titleIcon} /> 曖昧問題傾向分析 </h2>
      <div className={styles.filterToggleContainer}>
        <button onClick={() => setShowFilters(!showFilters)} className={styles.filterToggleButton}> <Filter size={16} /> フィルター・並べ替え {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />} </button>
      </div>
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGrid}>
            <div>
              <label htmlFor="reasonFilter" className={styles.filterLabel}>理由</label>
              <select id="reasonFilter" value={filter.reason} onChange={(e) => setFilter({ ...filter, reason: e.target.value })} className={styles.filterSelect} > <option value="all">全ての理由</option> {filterOptions.reasons.map(reason => (<option key={reason} value={reason}>{reason}</option>))} </select>
            </div>
            <div>
              <label htmlFor="subjectFilter" className={styles.filterLabel}>科目</label>
              <select id="subjectFilter" value={filter.subject} onChange={(e) => setFilter({ ...filter, subject: e.target.value })} className={styles.filterSelect} > <option value="all">全ての科目</option> {filterOptions.subjects.map(subject => (<option key={subject} value={subject}>{subject}</option>))} </select>
            </div>
            <div>
              <label htmlFor="periodFilter" className={styles.filterLabel}>最終解答期間</label>
              <select id="periodFilter" value={filter.period} onChange={(e) => setFilter({ ...filter, period: e.target.value })} className={styles.filterSelect} > <option value="all">全期間</option> <option value="week">直近1週間</option> <option value="month">直近1ヶ月</option> <option value="quarter">直近3ヶ月</option> </select>
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
         ) : ( <div className={styles.noDataMessage}>グラフを表示するデータがありません。</div> )}
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
        ) : ( <div className={styles.noDataMessage}> {answerHistory.length === 0 ? '解答履歴データがありません。' : 'グラフを表示するための十分な解答履歴データがありません。(2日分以上の記録が必要です)'} </div> )}
      </div>
      {renderTable('長期停滞している曖昧問題', AlertCircle, '#b45309', '(最終解答日から30日以上経過)', sortedLongStagnantQuestions, '長期停滞している曖昧問題はありません。', '#fffbeb')}
      {renderTable('"揺り戻し" が発生した曖昧問題', RotateCcw, '#5b21b6', '(前回「理解○」→ 今回「曖昧△」)', sortedRevertedQuestions, '"揺り戻し" が発生した曖昧問題はありません。', '#f5f3ff')}
      {renderTable('全ての曖昧問題リスト', null, '#374151', null, filteredAndSortedQuestions, ambiguousQuestions.length > 0 ? '表示できる曖昧問題がありません。フィルター条件を変更してみてください。' : '曖昧と評価された問題はまだありません。', null)}
      {editingCommentQuestion && ( <CommentEditModal question={editingCommentQuestion} onSave={saveComment} onCancel={handleCloseCommentModal} /> )}
    </div>
  );
};

export default AmbiguousTrendsPage;
