// src/RedesignedAllQuestionsView.jsx (Bulk Edit Calendar Modal 修正版)
import React, { useState, useMemo } from 'react';
import { Search, Filter, Edit, Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Info, ChevronRight, ChevronDown, ChevronUp, X as XIcon } from 'lucide-react';
// ★ react-day-picker をインポート
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // ★ 基本CSSをインポート
import { ja } from 'date-fns/locale'; // ★ 日本語化用
// CSSモジュール
import styles from './RedesignedAllQuestionsView.module.css';
import datePickerStyles from './DatePickerCalendarModal.module.css'; // ★ モーダル用CSS

// ヘルパー関数等 (変更なし)
const subjectColorMap = { /* ... */ }; const getSubjectColorClass = (subjectName) => { /* ... */ };
const getUnderstandingStyle = (understanding) => { /* ... */ }; const getCorrectRateColor = (rate) => { /* ... */ };

const RedesignedAllQuestionsView = ({
  subjects, expandedSubjects, expandedChapters, toggleSubject, toggleChapter,
  setEditingQuestion, setBulkEditMode, bulkEditMode, selectedQuestions,
  setSelectedQuestions, saveBulkEdit, formatDate, toggleQuestionSelection,
  selectedDate, setSelectedDate // ★ 一括編集用 Date オブジェクトを受け取る
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ understanding: 'all', correctRate: 'all', interval: 'all', });
  const [showCalendarModal, setShowCalendarModal] = useState(false); // カレンダーモーダル表示制御

  // filteredSubjects (変更なし)
  const filteredSubjects = useMemo(() => { /* ... */ }, [subjects, searchTerm, filters]);
  // toggleSelectAllForSubject (変更なし)
  const toggleSelectAllForSubject = (subject) => { /* ... */ };
  // executeBulkEdit (変更なし)
  const executeBulkEdit = () => {
    if (selectedDate && selectedQuestions.length > 0) {
      saveBulkEdit(selectedDate); // App.jsの関数呼び出し (selectedDate は Date オブジェクトのはず)
      setShowCalendarModal(false);
      setBulkEditMode(false);
      setSelectedQuestions([]);
    } else { console.warn("日付または問題が選択されていません。"); }
  };

  // --- レンダリング ---
  return (
    <div className={styles.container}>
      {/* 上部コントロール (変更なし) */}
      {/* ... */}
      {/* 詳細フィルターパネル (変更なし) */}
      {showFilters && ( <div className={styles.filterPanel}> {/* ... */} </div> )}
      {/* 一括編集時の操作パネル (変更なし) */}
      {bulkEditMode && ( <div className={styles.bulkEditPanel}> {/* ... */} </div> )}

      {/* 問題リスト (アコーディオン + カード) (変更なし) */}
      {filteredSubjects.length === 0 ? ( /* ... */ ) : (
        <div className={styles.listContainer}>
          {filteredSubjects.map(subject => { /* ... 科目・章・問題カードのレンダリング ... */ })}
        </div>
      )}

      {/* ★★★ 一括編集用カレンダーモーダル (react-day-picker + CSS Modules適用) ★★★ */}
      {bulkEditMode && showCalendarModal && (
         <>
             {/* オーバーレイ */}
             <div className={datePickerStyles.overlay} onClick={() => setShowCalendarModal(false)} />
             {/* モーダル本体 */}
             <div className={datePickerStyles.modal}>
                {/* 閉じるボタン */}
                <button onClick={() => setShowCalendarModal(false)} className={datePickerStyles.closeButton}> <XIcon size={18} /> </button>
                {/* react-day-picker コンポーネント */}
                <div className={datePickerStyles.calendarContainer}>
                    <DayPicker
                        mode="single"            // 単一選択
                        required                 // 日付選択を必須に (任意)
                        selected={selectedDate}  // App.js から渡された選択中の Date オブジェクト
                        onSelect={setSelectedDate} // 日付選択時に App.js の state を更新
                        locale={ja}              // 日本語化
                        showOutsideDays          // 月外日表示
                        fixedWeeks               // 週の数を6週に固定
                        captionLayout="dropdown-buttons" // 年月ドロップダウン
                        fromYear={new Date().getFullYear() - 1} // 年選択範囲
                        toYear={new Date().getFullYear() + 2}   // 年選択範囲
                        // className や classNames prop でさらに詳細なスタイル指定も可能
                    />
                </div>
                 {/* フッター */}
                 <div className={datePickerStyles.footer}>
                    <span>{selectedQuestions.length}件選択中</span>
                    <button onClick={executeBulkEdit} disabled={!selectedDate || selectedQuestions.length === 0} className={datePickerStyles.confirmButton}>
                        選択した問題をこの日に設定
                    </button>
                 </div>
             </div>
         </>
       )}

    </div> // 全体コンテナ end
  );
};

export default RedesignedAllQuestionsView;
