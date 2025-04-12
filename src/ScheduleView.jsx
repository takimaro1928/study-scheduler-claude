// src/ScheduleView.jsx (問題アイテムのスタイル最終版)
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'; // GripVertical削除
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import DayDetailModal from './DayDetailModal';
import styles from './ScheduleView.module.css'; // CSSモジュールをインポート

// --- ★ 科目と色のマッピング（例）★★★
// 必要に応じて色や科目名を追加・修正してください
const subjectColorMap = {
    "経営管理論": "#a5b4fc", // indigo-300
    "運営管理": "#6ee7b7", // emerald-300
    "経済学": "#fca5a5", // red-300
    "経営情報システム": "#93c5fd", // blue-300
    "経営法務": "#c4b5fd", // violet-300
    "中小企業経営・中小企業政策": "#fcd34d", // amber-300
    "過去問題集": "#94a3b8", // slate-400
    "未分類": "#d1d5db", // gray-300
};

// --- DraggableQuestion コンポーネント (スタイル改善版) ---
function DraggableQuestion({ question, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: question.id,
    data: { question },
  });

  // transform スタイル
  const itemStyle = { transform: CSS.Translate.toString(transform) };

  // CSSモジュールクラスを適用
  const itemClass = isDragging ? styles.draggableQuestionDragging : styles.draggableQuestion;

  // --- 表示テキスト生成ロジック (変更なし) ---
  const formatDisplayText = (q) => { /* ...前回のコードと同じ... */ };
  const displayText = formatDisplayText(question);
  // ---------------------------------

  // ★★★ 科目による色分け ★★★
  const subjectColor = subjectColorMap[question.subjectName || "未分類"] || subjectColorMap["未分類"];
  // インラインスタイルで左ボーダーの色を設定
  itemStyle.borderLeftColor = subjectColor;
  // ドラッグ中のスタイルにも色を反映させる場合（オプション）
  // if (isDragging) { itemStyle.backgroundColor = subjectColor; itemStyle.borderColor = subjectColor; }

  return (
    <div ref={setNodeRef} style={itemStyle} className={itemClass} {...listeners} {...attributes} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}>
      {/* ★ GripVertical アイコン削除 */}
      {/* テキスト表示 */}
      <span className={styles.questionText}>{displayText}</span>
    </div>
  );
}

// --- DroppableDateCell コンポーネント (変更なし) ---
function DroppableDateCell({ dayData, cellKey, openModal }) { /* ...前回のコードと同じ... */ }

// --- ScheduleView 本体 (変更なし) ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => { /* ...前回のコードと同じ... */ };

export default ScheduleView;
