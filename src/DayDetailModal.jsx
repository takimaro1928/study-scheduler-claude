// src/DayDetailModal.jsx (科目別グループ化 + アコーディオン表示)
import React, { useState, useMemo } from 'react';
import { X, ChevronDown } from 'lucide-react'; // ChevronDownを追加

// モーダル内で問題を表示するコンポーネント (変更なし)
function ModalQuestionItem({ question }) {
  const style = { padding: '5px 10px', backgroundColor: '#f3f4f6', color: '#1f2937', borderRadius: '6px', fontSize: '0.875rem', margin: '4px 0', border: `1px solid #e5e7eb`, whiteSpace: 'normal', overflowWrap: 'break-word', lineHeight: '1.4', };
  const displayText = `${question.subjectName || ''} / ${question.chapterName || ''} / 問題 ${question.id || ''}`;
  return ( <div style={style} title={displayText}> {displayText} </div> );
}

const DayDetailModal = ({ isOpen, onClose, date, questions, formatDate }) => {
  // 開いているアコーディオンの科目名を管理するstate
  const [openSubjects, setOpenSubjects] = useState({});

  // 科目ごとに問題をグループ化 (useMemoで計算結果をキャッシュ)
  const groupedQuestions = useMemo(() => {
    if (!questions) return {};
    return questions.reduce((acc, q) => {
      const subject = q.subjectName || '未分類';
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(q);
      // 各グループ内で問題をソート (例: ID順)
      acc[subject].sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true}));
      return acc;
    }, {});
  }, [questions]);

  // 最初はすべてのアコーディオンを開いた状態にする (オプション)
  useState(() => {
      const initialOpenState = {};
      Object.keys(groupedQuestions).forEach(subject => {
          initialOpenState[subject] = true;
      });
      setOpenSubjects(initialOpenState);
  }, [groupedQuestions]);


  // アコーディオンの開閉をトグルする関数
  const toggleSubject = (subjectName) => {
    setOpenSubjects(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };


  if (!isOpen || !date) {
    return null;
  }

  const subjectOrder = Object.keys(groupedQuestions).sort(); // 科目名をソート

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            {formatDate(date)} の問題リスト ({questions.length}件)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"> <X size={24} /> </button>
        </div>

        {/* コンテンツ (科目別アコーディオン) */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }}> {/* maxHeight調整 */}
          {questions.length > 0 ? (
            <div className="space-y-3"> {/* グループ間のスペース */}
              {/* ソートされた科目順にループ */}
              {subjectOrder.map((subjectName) => (
                <div key={subjectName} className="border rounded-md overflow-hidden">
                  {/* アコーディオンヘッダー (クリックで開閉) */}
                  <button
                    className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 transition-colors"
                    onClick={() => toggleSubject(subjectName)}
                  >
                    <span className="font-semibold text-gray-700">
                      {subjectName} ({groupedQuestions[subjectName].length}件)
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transform transition-transform duration-200 ${
                        openSubjects[subjectName] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {/* アコーディオンコンテンツ (開いている場合のみ表示) */}
                  {openSubjects[subjectName] && (
                    <div className="p-3 border-t bg-white">
                      <div className="space-y-1">
                        {groupedQuestions[subjectName].map((q) => (
                          <ModalQuestionItem key={q.id} question={q} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">この日の問題はありません。</p>
          )}
        </div>

        {/* フッター */}
        <div className="flex-shrink-0 p-3 bg-gray-50 border-t text-right">
           <button onClick={onClose} className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-md hover:bg-indigo-600"> 閉じる </button>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;
