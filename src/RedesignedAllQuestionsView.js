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
const subjectColorMap = { "経営管理論": "#a5b4fc", "運営管理": "#6ee7b7", "経済学": "#fca5a5", "経営情報システム": "#93c5fd", "経営法務": "#c4b5fd", "中小企業経営・中小企業政策": "#fcd34d", "過去問題集": "#94a3b8", "未分類": "#d1d5db", };
const getSubjectColorClass = (subjectName) => { /* ... */ };
const getUnderstandingStyle = (understanding) => { /* ... */ };
const getCorrectRateColor = (rate) => { /* ... */ };

const RedesignedAllQuestionsView = ({
  subjects, expandedSubjects, expandedChapters, toggleSubject, toggleChapter,
  setEditingQuestion, setBulkEditMode, bulkEditMode, selectedQuestions,
  setSelectedQuestions, saveBulkEdit, formatDate, toggleQuestionSelection,
  selectedDate, // ★ BulkEdit用日付 state (App.jsから受け取る)
  setSelectedDate // ★ BulkEdit用日付 state 更新関数 (App.jsから受け取る)
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ understanding: 'all', correctRate: 'all', interval: 'all', });
  const [showCalendarModal, setShowCalendarModal] = useState(false); // モーダル表示制御 state

  // filteredSubjects (変更なし)
  const filteredSubjects = useMemo(() => { /* ... */ }, [subjects, searchTerm, filters]);
  // toggleSelectAllForSubject (変更なし)
  const toggleSelectAllForSubject = (subject) => { /* ... */ };
  // executeBulkEdit (変更なし)
  const executeBulkEdit = () => { /* ... */ };

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

      {/* ★★★ 一括編集用カレンダーモーダル (JSX修正) ★★★ */}
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
                        required                 // 日付選択必須
                        selected={selectedDate}  // ★ App.js の state を使う
                        onSelect={(date) => {    // ★ 日付選択時の処理
                            if (date) { // date が undefined でないことを確認
                                setSelectedDate(date); // App.js の state 更新関数を呼ぶ
                            }
                        }}
                        locale={ja}              // 日本語化
                        showOutsideDays          // 月外日表示
                        fixedWeeks               // 週の数を固定
                        captionLayout="dropdown-buttons" // 年月ドロップダウン
                        fromYear={new Date().getFullYear() - 2} // 範囲を少し広げる
                        toYear={new Date().getFullYear() + 3}
                        // ★ react-day-picker の classNames prop を使って CSS Module を適用（より推奨）
                        //    ただし :global で指定したのでこれでもOK
                        // classNames={{
                        //   caption: 'my-custom-caption', // .module.css に .my-custom-caption を定義
                        //   day: 'my-custom-day',
                        //   day_selected: 'my-custom-day--selected',
                        // }}
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
