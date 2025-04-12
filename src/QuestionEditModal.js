// src/QuestionEditModal.jsx (CSS Modules + モダンデザイン適用)
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, Save, ArrowLeft } from 'lucide-react';
// CSSモジュールをインポート
import styles from './QuestionEditModal.module.css';
// カレンダーコンポーネントをインポート（もしDatePickerCalendarを使う場合）
// import DatePickerCalendar from './DatePickerCalendar';

const QuestionEditModal = ({ question, onSave, onCancel, formatDate }) => { // formatDate を props で受け取る
  // 内部 state はそのまま維持
  const [editData, setEditData] = useState({
      ...question,
      // 日付を YYYY-MM-DD 形式の文字列で初期化
      nextDate: question.nextDate ? new Date(question.nextDate).toISOString().split('T')[0] : '',
      lastAnswered: question.lastAnswered ? new Date(question.lastAnswered).toISOString().split('T')[0] : '',
      correctRate: question.correctRate ?? 0, // nullish coalescing
      answerCount: question.answerCount ?? 0,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // カレンダーポップアップ用 (もし使うなら)
  const calendarRef = useRef(null); // カレンダー外クリック用

  // 日付フォーマット関数 (YYYY/MM/DD - 表示用)
  const formatDateDisplay = (dateString) => {
      if (!dateString) return '';
      try {
        return formatDate(new Date(dateString)); // App.js から渡された関数を使用
      } catch {
        return '無効な日付';
      }
  };

  // Input の値変更ハンドラ
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    if (type === 'number') {
        processedValue = value === '' ? '' : parseInt(value); // 空を許容しつつ数値に
        if (!isNaN(processedValue)) {
            if (processedValue < 0) processedValue = 0;
            if (name === 'correctRate' && processedValue > 100) processedValue = 100;
        } else {
            processedValue = editData[name]; // 無効な数値なら元に戻す
        }
    } else if (type === 'radio') {
        // understanding はそのまま value を使う
        processedValue = value;
    } else if (type === 'date'){
        // 日付入力はそのまま文字列で保持 (保存時に Date->ISO にする)
        processedValue = value;
    }

    setEditData(prev => ({ ...prev, [name]: processedValue }));
  };


  // 保存処理
  const handleSave = () => {
    // 保存時に nextDate と lastAnswered を Date オブジェクトまたは ISO 文字列に変換して onSave に渡す
    const dataToSave = {
        ...editData,
        // YYYY-MM-DD 文字列から Date オブジェクト経由で ISO 文字列に変換
        nextDate: editData.nextDate ? new Date(editData.nextDate).toISOString() : null,
        lastAnswered: editData.lastAnswered ? new Date(editData.lastAnswered).toISOString() : null,
        // 数値が空文字列の場合 0 にする
        correctRate: editData.correctRate === '' ? 0 : editData.correctRate,
        answerCount: editData.answerCount === '' ? 0 : editData.answerCount
    };
    onSave(dataToSave);
  };

  // カレンダーの外側クリック (DatePickerCalendar を使う場合)
  // useEffect(() => { /* ... カレンダー外クリックのロジック ... */ }, [calendarRef]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>問題編集 : {question.id}</h3>
          <button onClick={onCancel} className={styles.closeButton}> <X size={20} /> </button>
        </div>

        {/* コンテンツ (フォーム) */}
        <div className={styles.content}>
          {/* 問題ID (読み取り専用) */}
          <div className={styles.formGroup}>
            <label>問題ID</label>
            <div className={styles.readOnlyField}>{editData.id}</div>
          </div>

          {/* 解答回数 (読み取り専用) */}
          <div className={styles.formGroup}>
            <label>解答回数</label>
            <div className={styles.readOnlyField}>{editData.answerCount}回</div>
          </div>

          {/* 正解率 (編集可能) */}
          <div className={styles.formGroup}>
            <label htmlFor={`correctRate-${question.id}`}>正解率</label>
            <div style={{ position: 'relative' }}> {/* %マーク用 */}
              <input
                type="number"
                id={`correctRate-${question.id}`}
                name="correctRate"
                min="0" max="100"
                value={editData.correctRate}
                onChange={handleChange}
                className={styles.inputField}
              />
               <span className={styles.inputSuffix}>%</span>
            </div>
          </div>

          {/* 次回解答日 (編集可能) */}
          <div className={styles.formGroup}>
            <label htmlFor={`nextDate-${question.id}`}>次回解答日</label>
            {/* カレンダーポップアップを使う場合はここにロジック追加 */}
            <input
              type="date"
              id={`nextDate-${question.id}`}
              name="nextDate"
              value={editData.nextDate ? editData.nextDate.split('T')[0] : ''} // YYYY-MM-DD 形式
              onChange={handleChange}
              className={styles.inputField} // inputFieldを流用
            />
             <div className={styles.dateDisplay}> {/* 日本語表示 */}
               {editData.nextDate ? formatDate(new Date(editData.nextDate)) : '未設定'}
             </div>
          </div>

          {/* 間隔 (編集可能) */}
          <div className={styles.formGroup}>
            <label htmlFor={`interval-${question.id}`}>間隔</label>
            <select
              id={`interval-${question.id}`}
              name="interval"
              value={editData.interval}
              onChange={handleChange}
              className={styles.selectField}
            >
              <option value="1日">1日</option> <option value="3日">3日</option>
              <option value="7日">7日</option> <option value="14日">14日</option>
              <option value="1ヶ月">1ヶ月</option> <option value="2ヶ月">2ヶ月</option>
              <option value="8日">8日 (曖昧)</option> {/* 曖昧用も追加 */}
            </select>
          </div>

          {/* 理解度 (編集可能) */}
          <div className={styles.formGroup}>
            <label>理解度</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="understanding" value="理解○"
                       checked={editData.understanding === "理解○"} onChange={handleChange}
                       className={styles.radioInput} />
                <span>理解○</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="understanding" value="曖昧△"
                       checked={editData.understanding?.startsWith("曖昧△")} onChange={handleChange}
                       className={styles.radioInput} />
                <span>曖昧△</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="understanding" value="理解できていない×"
                       checked={editData.understanding === "理解できていない×"} onChange={handleChange}
                       className={styles.radioInput} />
                <span>理解×</span>
              </label>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className={styles.footer}>
          <button onClick={onCancel} className={`${styles.footerButton} ${styles.cancelButton}`}>
             <ArrowLeft size={16} style={{marginRight: '4px'}}/>キャンセル
          </button>
          <button onClick={handleSave} className={`${styles.footerButton} ${styles.saveButton}`}>
             <Save size={16} style={{marginRight: '4px'}}/>保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditModal;
