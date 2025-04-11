// src/DayDetailModal.jsx
import React from 'react';
import { X } from 'lucide-react';

// DraggableQuestion を ScheduleView からインポートするか、
// ここで再度定義するか、共通コンポーネントにする必要があります。
// ここでは ScheduleView から DraggableQuestion をインポートする想定です。
// （実際のインポートパスは環境に合わせてください）
// import { DraggableQuestion } from './ScheduleView';
// ※ ScheduleView.jsx 側で DraggableQuestion を export する必要があります

// DraggableQuestion の簡易版をここに再定義（インポートしない場合）
function ModalDraggableQuestion({ question }) {
  // Draggable機能はモーダル内では一旦省略（必要なら後で追加）
  const style = {
    padding: '4px 8px',
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    borderRadius: '4px',
    fontSize: '0.75rem',
    margin: '2px 0',
    border: `1px solid #c7d2fe`,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  const subjectAbbreviation = question.subjectName ? question.subjectName.substring(0, 4) : '';
  return (
    <div style={style} title={`${question.subjectName} - ${question.chapterName} - 問題 ${question.id}`}>
       <span className="font-medium overflow-hidden text-ellipsis">
         {subjectAbbreviation} - {question.id}
       </span>
    </div>
  );
}


const DayDetailModal = ({ isOpen, onClose, date, questions, formatDate }) => {
  if (!isOpen || !date) {
    return null;
  }

  return (
    // オーバーレイ
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} // オーバーレイクリックで閉じる
    >
      {/* モーダル本体 */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // モーダル内のクリックは閉じない
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            {formatDate(date)} の問題リスト
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* コンテンツ (問題リスト) */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {questions.length > 0 ? (
            <div className="space-y-2">
              {questions.map((q) => (
                 // モーダル内ではドラッグ不可にする（必要ならDraggableQuestionをインポートして使う）
                <ModalDraggableQuestion key={q.id} question={q} />
                // <DraggableQuestion key={q.id} question={q} /> // ScheduleViewからインポートする場合
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">この日の問題はありません。</p>
          )}
        </div>

        {/* フッター (オプション) */}
        <div className="p-3 bg-gray-50 border-t text-right">
           <button
             onClick={onClose}
             className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-md hover:bg-indigo-600 transition-colors"
           >
             閉じる
           </button>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;
