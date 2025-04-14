// src/SettingsPage.js
// 設定ページコンポーネント

import React from 'react';
import { Settings, Trash2, AlertTriangle } from 'lucide-react'; // アイコンをインポート
import styles from './SettingsPage.module.css'; // 作成したCSSモジュールをインポート

// SettingsPageコンポーネント定義
// App.jsから onResetData 関数を受け取る
const SettingsPage = ({ onResetData }) => {

  // リセットボタンがクリックされたときの処理
  const handleResetClick = () => {
    // 確認ダイアログを表示
    const confirmReset = window.confirm(
      "本当にすべての学習データ（解答履歴含む）をリセットしますか？\nこの操作は元に戻せません。"
    );

    // ユーザーがOKを押した場合のみリセット処理を実行
    if (confirmReset) {
      console.log("データリセットを実行します。");
      onResetData(); // App.jsから渡されたリセット関数を呼び出す
    } else {
      console.log("データリセットはキャンセルされました。");
    }
  };

  return (
    <div className={styles.container}>
      {/* ページタイトル */}
      <h2 className={styles.title}>
        <Settings size={20} className={styles.titleIcon} /> 設定
      </h2>

      {/* データ管理セクション */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>データ管理</h3>
        <p className={styles.description}>
          学習データ（各問題の解答回数、日付、理解度など）と解答履歴をすべて削除し、
          アプリケーションを初期状態（全問題が「未学習」の状態）に戻します。
        </p>
        {/* リセットボタン */}
        <button onClick={handleResetClick} className={styles.resetButton}>
          <AlertTriangle size={16} /> {/* 注意喚起アイコン */}
          学習データをリセットする
        </button>
      </div>

      {/* 他の設定項目があればここに追加 */}
      {/*
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>他の設定</h3>
        <p>今後、設定項目が増える場合にここに追加します。</p>
      </div>
      */}
    </div>
  );
};

export default SettingsPage;
