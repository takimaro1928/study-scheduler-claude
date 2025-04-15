// src/SettingsPage.js
import React from 'react';
import { Settings, Trash2, AlertTriangle, RefreshCw } from 'lucide-react'; // RefreshCw を追加
import styles from './SettingsPage.module.css';

// onResetAnswerStatusOnly を追加
const SettingsPage = ({ onResetData, onResetAnswerStatusOnly }) => {
  // リセットボタンのハンドラはそのまま
  const handleResetClick = () => {
    // 既存のコード
    const confirmReset = window.confirm(
      "本当にすべての学習データ（解答履歴含む）をリセットしますか？\nこの操作は元に戻せません。"
    );
    
    if (confirmReset) {
      console.log("データリセットを実行します。");
      onResetData();
    } else {
      console.log("データリセットはキャンセルされました。");
    }
  };

  // 回答状況のみリセットボタンのハンドラ
  const handleResetAnswerStatusOnly = () => {
    console.log("回答状況のみリセットを実行します。");
    onResetAnswerStatusOnly();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Settings size={20} className={styles.titleIcon} /> 設定
      </h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>データ管理</h3>
        
        {/* 回答状況のみリセットボタン (新規追加) */}
        <div className={styles.resetOption}>
          <div>
            <h4 className={styles.resetOptionTitle}>回答状況のみリセット</h4>
            <p className={styles.description}>
              問題リストを維持したまま、解答回数、正解率、理解度、日付などの回答状況のみをリセットします。
              コメントは削除されません。
            </p>
          </div>
          <button onClick={handleResetAnswerStatusOnly} className={`${styles.resetButton} ${styles.resetAnswerButton}`}>
            <RefreshCw size={16} /> 回答状況をリセット
          </button>
        </div>
        
        <hr className={styles.divider} />
        
        {/* 完全リセットボタン (既存) */}
        <div className={styles.resetOption}>
          <div>
            <h4 className={styles.resetOptionTitle}>完全リセット</h4>
            <p className={styles.description}>
              学習データ（各問題の解答回数、日付、理解度など）と解答履歴をすべて削除し、
              アプリケーションを初期状態（全問題が「未学習」の状態）に戻します。
            </p>
          </div>
          <button onClick={handleResetClick} className={styles.resetButton}>
            <AlertTriangle size={16} /> 学習データを完全リセット
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
