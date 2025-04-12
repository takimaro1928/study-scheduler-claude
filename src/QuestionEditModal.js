// src/QuestionEditModal.jsx (CSS Modules + モダンデザイン適用)
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, Save, ArrowLeft } from 'lucide-react';
import styles from './QuestionEditModal.module.css'; // CSSモジュールをインポート

const QuestionEditModal = ({ question, onSave, onCancel, formatDate }) => {
  const [editData, setEditData] = useState({
      ...question,
      nextDate: question.nextDate ? new Date(question.nextDate).toISOString().split('T')[0] : '',
      lastAnswered: question.lastAnswered ? new Date(question.lastAnswered).toISOString().split('T')[0] : '',
      correctRate: question.correctRate ?? 0,
      answerCount: question.answerCount ?? 0,
  });
  // カレンダーポップアップ関連の state と useEffect は DatePickerCalendar を使うなら不要かも
  // const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // const calendarRef = useRef(null);

  const formatDateDisplay = (dateString) => { /* ... */ }; // 変更なし

  // Input の値変更ハンドラ
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    if (type === 'number') {
        processedValue = value === '' ? '' : parseInt(value);
        if (!isNaN(processedValue)) {
            if (processedValue < 0) processedValue = 0;
            if (name === 'correctRate' && processedValue > 100) processedValue = 100;
        } else {
            processedValue = editData[name]; // 無効なら元に戻す
        }
    } else if (type === 'radio') {
        // understanding はそのまま value を使う
        // もし曖昧△を選んだら、詳細理由はクリアする（あるいは別途入力欄）
        processedValue = value === '曖昧△' ? '曖昧△' : value; // 理由部分は保存時に付与しない
    }
    setEditData(prev => ({ ...prev, [name]: processedValue }));
  };


  // 保存処理
  const handleSave = () => {
    const dataToSave = {
        ...editData,
        // 日付文字列をISO文字列に変換 (Dateオブジェクトにはしない)
        nextDate: editData.nextDate ? new Date(editData.nextDate).toISOString() : null,
        lastAnswered: editData.lastAnswered ? new Date(editData.lastAnswered).toISOString() : null,
        correctRate: editData.correctRate === '' ? 0 : parseInt(editData.correctRate, 10), // 数値に変換
        answerCount: parseInt(editData.answerCount, 10), // 数値に変換
        // understanding は radio ボタンの value がそのまま入る想定
    };
    // 曖昧△で理由が保存されていた場合、単純な "曖昧△" に戻すか確認
    if (dataToSave.understanding?.startsWith("曖昧△:")) {
       dataToSave.understanding = "曖昧△"; // 理由情報はここでは扱わない
    }
    onSave(dataToSave);
  };

  // useEffect(() => { /* ... カレンダー外クリック ... */ }, [calendarRef]); // カレンダーポップアップなければ削除

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
          <div className={styles.formGroup}>
            <label>問題ID</label>
            <div className={styles.readOnlyField}>{editData.id}</div>
          </div>
          <div className={styles.formGroup}>
            <label>解答回数</label>
            <div className={styles.readOnlyField}>{editData.answerCount}回</div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor={`correctRate-${question.id}`}>正解率</label>
            <div style={{ position: 'relative' }}>
              <input type="number" id={`correctRate-${question.id}`} name="correctRate" min="0" max="100"
                     value={editData.correctRate} onChange={handleChange} className={styles.inputField} />
               <span className={styles.inputSuffix}>%</span>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor={`nextDate-${question.id}`}>次回解答日</label>
            {/* Input type="date" を使用 */}
            <input type="date" id={`nextDate-${question.id}`} name="nextDate"
                   value={editData.nextDate ? editData.nextDate.split('T')[0] : ''}
                   onChange={handleChange} className={styles.inputField} />
             {/*<div className={styles.dateDisplay}> {editData.nextDate ? formatDate(editData.nextDate) : '未設定'} </div>*/}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor={`interval-${question.id}`}>間隔</label>
            <select id={`interval-${question.id}`} name="interval" value={editData.interval}
                    onChange={handleChange} className={styles.selectField}>
              <option value="1日">1日</option> <option value="3日">3日</option>
              <option value="7日">7日</option> <option value="14日">14日</option>
              <option value="1ヶ月">1ヶ月</option> <option value="2ヶ月">2ヶ月</option>
              <option value="8日">8日 (曖昧)</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>理解度</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="understanding" value="理解○"
                       checked={editData.understanding === "理解○"} onChange={handleChange} className={styles.radioInput} />
                <span>理解○</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="understanding" value="曖昧△"
                       checked={editData.understanding?.startsWith("曖昧△")} onChange={handleChange} className={styles.radioInput} />
                <span>曖昧△</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="understanding" value="理解できていない×"
                       checked={editData.understanding === "理解できていない×"} onChange={handleChange} className={styles.radioInput} />
                <span>理解×</span>
              </label>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className={styles.footer}>
          <button onClick={onCancel} className={`${styles.footerButton} ${styles.cancelButton}`}> <ArrowLeft size={16} />キャンセル </button>
          <button onClick={handleSave} className={`${styles.footerButton} ${styles.saveButton}`}> <Save size={16} />保存 </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditModal;
