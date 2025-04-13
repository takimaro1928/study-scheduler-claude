// src/AmbiguousTrendsPage.js (ステップ3: 長期停滞リスト追加 - 本当に完全版)
import React, { useState, useEffect, useMemo } from 'react';
import { Filter, ChevronDown, ChevronUp, Info, ArrowUpDown, BarChart2, AlertCircle } from 'lucide-react'; // AlertCircle アイコン追加
// Recharts から必要なコンポーネントをインポート
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import styles from './AmbiguousTrendsPage.module.css'; // CSSモジュールをインポート

// 曖昧問題データを取得・整形する関数
function getAmbiguousQuestions(subjects) {
  const ambiguousQuestions = [];
  if (!Array.isArray(subjects)) return ambiguousQuestions; // subjects が配列でない場合は空を返す

  subjects.forEach(subject => {
    if (!subject || !Array.isArray(subject.chapters)) return; // subject や chapters が不正な場合はスキップ

    subject.chapters.forEach(chapter => {
      if (!chapter || !Array.isArray(chapter.questions)) return; // chapter や questions が不正な場合はスキップ

      chapter.questions.forEach(question => {
        if (typeof question !== 'object' || question === null) return; // question がオブジェクトでない場合はスキップ

        // 曖昧△を含む問題を抽出 (understanding が null や undefined の場合も考慮)
        if (question.understanding && typeof question.understanding === 'string' && question.understanding.startsWith('曖昧△')) {
          let reason = '理由なし';
          if (question.understanding.includes(':')) {
            reason = question.understanding.split(':')[1].trim(); // 理由部分を抽出、前後の空白除去
          }

          // 日付データの検証と変換 (無効な場合は null)
          const lastAnsweredDate = question.lastAnswered ? new Date(question.lastAnswered) : null;
          const nextDateDate = question.nextDate ? new Date(question.nextDate) : null;

          ambiguousQuestions.push({
            id: question.id || '不明なID', // IDがない場合のフォールバック
            subjectId: subject.id,
            subjectName: subject.name || '未分類科目',
            chapterId: chapter.id,
            chapterName: chapter.name || '未分類章',
            reason: reason,
            correctRate: question.correctRate ?? 0, // null や undefined なら 0
            lastAnswered: !isNaN(lastAnsweredDate?.getTime()) ? lastAnsweredDate : null, // 無効日付なら null
            nextDate: !isNaN(nextDateDate?.getTime()) ? nextDateDate : null,     // 無効日付なら null
            answerCount: question.answerCount ?? 0,   // null や undefined なら 0
            previousUnderstanding: question.previousUnderstanding, // 揺り戻し分析用
          });
        }
      });
    });
  });
  // console.log("抽出された曖昧問題:", ambiguousQuestions); // デバッグ用
  return ambiguousQuestions;
}

// 日付のフォーマット関数 (App.js から props で渡される想定だが、念のためここにも定義)
const formatDateInternal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '----/--/--'; // 無効な日付や null の場合の表示
  }
  try {
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  } catch (e) {
    console.error("formatDate エラー:", e, "入力:", date);
    return 'エラー';
  }
};

// 曖昧問題傾向表示ページコンポーネント
const AmbiguousTrendsPage = ({ subjects, formatDate = formatDateInternal }) => { // formatDate を props で受け取る (デフォルト値付き)
  // 状態管理
  const [filter, setFilter] = useState({ reason: 'all', subject: 'all', period: 'all' });
  const [sort, setSort] = useState({ key: 'lastAnswered', order: 'desc' }); // ソートキーと順序
  const [showFilters, setShowFilters] = useState(false);

  // 曖昧な問題データをメモ化して取得
  const ambiguousQuestions = useMemo(() => getAmbiguousQuestions(subjects || []), [subjects]);

  // 科目別の曖昧問題数を集計
  const ambiguousCountBySubject = useMemo(() => {
    const counts = {};
    ambiguousQuestions.forEach(q => {
      counts[q.subjectName] = (counts[q.subjectName] || 0) + 1;
    });
    // Recharts で使いやすい形式に変換 [{ subjectName: '科目A', count: 5 }, ...]
    // 件数が多い順にソートして表示
    return Object.entries(counts)
      .map(([name, count]) => ({ subjectName: name, count }))
      .sort((a, b) => b.count - a.count); // 件数の降順でソート
  }, [ambiguousQuestions]);


  // 長期停滞リスト用のデータをフィルタリングして作成
  const longStagnantQuestions = useMemo(() => {
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30); // 30日前の日付を計算
    THIRTY_DAYS_AGO.setHours(0, 0, 0, 0); // 日付の比較のため時間をリセット

    return ambiguousQuestions.filter(q =>
      q.lastAnswered && q.lastAnswered < THIRTY_DAYS_AGO
    );
  }, [ambiguousQuestions]);

  // フィルターとソートを適用した問題リストをメモ化
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = [...ambiguousQuestions];

    // 理由フィルター
    if (filter.reason !== 'all') {
      filtered = filtered.filter(q => q.reason === filter.reason);
    }
    // 科目フィルター
    if (filter.subject !== 'all') {
      filtered = filtered.filter(q => q.subjectName === filter.subject);
    }
    // 期間フィルター (lastAnswered基準)
    if (filter.period !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setHours(0, 0, 0, 0); // 今日の始まり
      now.setHours(0, 0, 0, 0);

      switch (filter.period) {
        case 'week': cutoffDate.setDate(now.getDate() - 7); break;
        case 'month': cutoffDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': cutoffDate.setMonth(now.getMonth() - 3); break;
        default: break; // 'all' の場合は何もしない
      }
      if (filter.period !== 'all') {
         filtered = filtered.filter(q => q.lastAnswered && q.lastAnswered >= cutoffDate);
      }
    }

    // ソート
    filtered.sort((a, b) => {
      const valA = a[sort.key];
      const valB = b[sort.key];
      let comparison = 0;

      if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else {
         // 混合型や null/undefined の場合の基本的な比較（必要に応じて調整）
         if (valA < valB) comparison = -1;
         if (valA > valB) comparison = 1;
      }

      return sort.order === 'asc' ? comparison : comparison * -1;
    });

    return filtered;
  }, [ambiguousQuestions, filter, sort]);

  // フィルター用オプションを取得
  const filterOptions = useMemo(() => {
    const reasons = [...new Set(ambiguousQuestions.map(q => q.reason))].sort();
    const subjects = [...new Set(ambiguousQuestions.map(q => q.subjectName))].sort();
    return { reasons, subjects };
  }, [ambiguousQuestions]);

  // ソートハンドラ
  const handleSort = (key) => {
    setSort(prevSort => ({
      key: key,
      // 同じキーなら順序反転、違うキーなら降順で開始
      order: prevSort.key === key && prevSort.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  // ソートアイコン表示
  const getSortIcon = (key) => {
    if (sort.key !== key) {
      return <ArrowUpDown size={14} className={styles.sortIcon} />;
    }
    return sort.order === 'desc' ? <ChevronDown size={14} className={styles.sortIconActive} /> : <ChevronUp size={14} className={styles.sortIconActive} />;
  };

  // 長期停滞リスト用のソート済みデータを準備
  const sortedLongStagnantQuestions = useMemo(() => {
      // filteredAndSortedQuestions と同じソートを適用
      let sorted = [...longStagnantQuestions];
      sorted.sort((a, b) => {
        const valA = a[sort.key];
        const valB = b[sort.key];
        let comparison = 0;
        if (valA instanceof Date && valB instanceof Date) { comparison = valA.getTime() - valB.getTime(); }
        else if (typeof valA === 'number' && typeof valB === 'number') { comparison = valA - valB; }
        else if (typeof valA === 'string' && typeof valB === 'string') { comparison = valA.localeCompare(valB); }
        else { if (valA < valB) comparison = -1; if (valA > valB) comparison = 1; }
        return sort.order === 'asc' ? comparison : comparison * -1;
      });
      return sorted;
  }, [longStagnantQuestions, sort]);


  return (
    <div className={styles.container}>
      {/* ページタイトル */}
      <h2 className={styles.title}>
        <Info className={styles.titleIcon} />
        曖昧問題傾向分析
      </h2>

      {/* フィルターボタンとパネル */}
      <div className={styles.filterToggleContainer}>
        <button onClick={() => setShowFilters(!showFilters)} className={styles.filterToggleButton}>
          <Filter size={16} />
          フィルター・並べ替え
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGrid}>
            {/* 理由フィルター */}
            <div>
              <label htmlFor="reasonFilter" className={styles.filterLabel}>理由</label>
              <select
                id="reasonFilter"
                value={filter.reason}
                onChange={(e) => setFilter({ ...filter, reason: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="all">全ての理由</option>
                {filterOptions.reasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            {/* 科目フィルター */}
            <div>
              <label htmlFor="subjectFilter" className={styles.filterLabel}>科目</label>
              <select
                id="subjectFilter"
                value={filter.subject}
                onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="all">全ての科目</option>
                {filterOptions.subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            {/* 期間フィルター */}
            <div>
              <label htmlFor="periodFilter" className={styles.filterLabel}>最終解答期間</label>
              <select
                id="periodFilter"
                value={filter.period}
                onChange={(e) => setFilter({ ...filter, period: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="all">全期間</option>
                <option value="week">直近1週間</option>
                <option value="month">直近1ヶ月</option>
                <option value="quarter">直近3ヶ月</option>
              </select>
            </div>
          </div>
        </div>
      )}


      {/* 科目別グラフ表示エリア */}
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>
          <BarChart2 size={18} /> 科目別の曖昧問題数
        </h3>
        {ambiguousCountBySubject.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={ambiguousCountBySubject}
              margin={{ top: 5, right: 20, left: -10, bottom: 50 }}
              barGap={5}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="subjectName"
                tick={{ fontSize: 11, fill: '#4b5563' }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#4b5563' }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                 }}
              />
              <Bar dataKey="count" name="曖昧問題数" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noDataMessage}>グラフを表示するデータがありません。</div>
        )}
      </div>


      {/* 長期停滞リスト表示エリア */}
      <div className={styles.tableContainer} style={{marginTop: '2rem', borderColor: '#fca5a5' }}>
         <h3 className={styles.tableTitle} style={{color: '#b45309' }}>
           <AlertCircle size={18} style={{marginRight: '0.5rem', color: '#f97316' }}/>
           長期停滞している曖昧問題 ({sortedLongStagnantQuestions.length}件)
           <span style={{fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.5rem', color: '#71717a' }}>
             (最終解答日から30日以上経過)
           </span>
         </h3>
         {sortedLongStagnantQuestions.length > 0 ? (
           <table className={styles.table}>
             <thead>
               <tr>
                 <th onClick={() => handleSort('id')}>問題ID {getSortIcon('id')}</th>
                 <th onClick={() => handleSort('subjectName')}>科目 {getSortIcon('subjectName')}</th>
                 <th onClick={() => handleSort('chapterName')}>章 {getSortIcon('chapterName')}</th>
                 <th onClick={() => handleSort('reason')}>理由 {getSortIcon('reason')}</th>
                 <th onClick={() => handleSort('correctRate')}>正答率 {getSortIcon('correctRate')}</th>
                 <th onClick={() => handleSort('answerCount')}>解答回数 {getSortIcon('answerCount')}</th>
                 <th onClick={() => handleSort('lastAnswered')}>最終解答日 {getSortIcon('lastAnswered')}</th>
               </tr>
             </thead>
             <tbody>
               {sortedLongStagnantQuestions.map(q => (
                 <tr key={q.id}>
                   <td>{q.id}</td>
                   <td>{q.subjectName}</td>
                   <td>{q.chapterName}</td>
                   <td>{q.reason}</td>
                   <td>{q.correctRate}%</td>
                   <td>{q.answerCount}</td>
                   <td style={{color: '#dc2626', fontWeight: 500}}>{formatDate(q.lastAnswered)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         ) : (
           <div className={styles.noDataMessage} style={{backgroundColor: '#fffbeb' }}>
             長期停滞している曖昧問題はありません。
           </div>
         )}
       </div>


      {/* 全ての曖昧問題リストテーブル */}
      <div className={styles.tableContainer} style={{marginTop: '2rem'}}>
        <h3 className={styles.tableTitle}>全ての曖昧問題リスト ({filteredAndSortedQuestions.length}件)</h3>
        {filteredAndSortedQuestions.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>問題ID {getSortIcon('id')}</th>
                <th onClick={() => handleSort('subjectName')}>科目 {getSortIcon('subjectName')}</th>
                <th onClick={() => handleSort('chapterName')}>章 {getSortIcon('chapterName')}</th>
                <th onClick={() => handleSort('reason')}>理由 {getSortIcon('reason')}</th>
                <th onClick={() => handleSort('correctRate')}>正答率 {getSortIcon('correctRate')}</th>
                <th onClick={() => handleSort('answerCount')}>解答回数 {getSortIcon('answerCount')}</th>
                <th onClick={() => handleSort('lastAnswered')}>最終解答日 {getSortIcon('lastAnswered')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedQuestions.map(q => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.subjectName}</td>
                  <td>{q.chapterName}</td>
                  <td>{q.reason}</td>
                  <td>{q.correctRate}%</td>
                  <td>{q.answerCount}</td>
                  <td>{formatDate(q.lastAnswered)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.noDataMessage}>
            表示できる曖昧問題がありません。
            {ambiguousQuestions.length > 0 && 'フィルター条件を変更してみてください。'}
          </div>
        )}
      </div>

    </div>
  );
};

export default AmbiguousTrendsPage;
