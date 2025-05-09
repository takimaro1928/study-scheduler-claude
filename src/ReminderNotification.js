// src/ReminderNotification.js
import React from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import './ReminderNotification.css';

const ReminderNotification = ({ daysSinceLastExport, onGoToSettings, onDismiss }) => {
  return (
    <div className="reminder-banner">
      <div className="reminder-content">
        <AlertTriangle size={18} className="reminder-icon" />
        <span className="reminder-text">
          {daysSinceLastExport === null 
            ? 'バックアップがまだ行われていません。' 
            : `最後のバックアップから${daysSinceLastExport}日以上経過しています。`}
          データの安全のためにエクスポートをお勧めします。
        </span>
        <div className="reminder-actions">
          <button onClick={onGoToSettings} className="reminder-button reminder-button-primary">
            <Save size={14} />
            設定ページへ
          </button>
          <button onClick={onDismiss} className="reminder-button reminder-button-secondary">
            <X size={14} />
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderNotification;
