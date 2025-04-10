// TodayView.jsx
// 最新の3枚の画像デザイン指示 + カラー使用のご要望を反映

import React, { useState } from 'react';
// lucide-react からアイコンをインポート
import { Clock, Check, X, AlertTriangle, ChevronsUpDown } from 'lucide-react';

const TodayView = ({ getTodayQuestions, recordAnswer, formatDate }) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  const [questionStates, setQuestionStates] = useState({});

  // ハンドラ関数群 (ロジックは変更なし、UIリセット方法を調整)
  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { showComprehension: true }
      }));
    } else {
      recordAnswer(questionId, false, '理解できていない×');
       setQuestionStates(prev => {
         const newState = {...prev};
         delete newState[questionId];
         return newState;
       });
    }
  };

  const handleAmbiguousClick = (questionId) => {
    setExpandedAmbiguousId(prevId => (prevId === questionId ? null : questionId));
  };

  const selectAmbiguousReason = (questionId, reason) => {
    recordAnswer(questionId, true, `曖昧△:${reason}`);
    setExpandedAmbiguousId(null);
     setQuestionStates(prev => {
         const newState = {...prev};
         delete newState[questionId];
         return newState;
       });
  };

  const handleUnderstandClick = (questionId) => {
    recordAnswer(questionId, true, '理解○');
     setQuestionStates(prev => {
         const newState = {...prev};
         delete newState[questionId];
         return newState;
       });
  };

   const getQuestionState = (questionId) => {
    return questionStates[questionId] || { showComprehension: false };
  };

  // 曖昧さの理由リスト（6つ）
  const ambiguousReasons = [
    '偶然正解した',
    '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった',
    '合っていたが、別の理由を思い浮かべていた',
    '自信はなかったけど、これかなとは思っていた',
    '問題を覚えてしまっていた',
    'その他'
  ];

  // --- JSX 部分のデザインを指示された3枚の画像 + カラー要望に合わせて修正 ---
  return (
    // 全体のコンテナ (左右padding、中央寄せ、最大幅)
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full max-w-2xl mx-auto pb-20"> {/* max-w-2xl で少し狭めに */}
      {/* ページタイトル (アイコン削除、日付バッジ) */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-gray-700 flex items-center justify-center">
        <span>今日解く問題</span>
        <span className="ml-3 text-sm sm:text-base bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full font-medium">
          {formatDate(new Date())}
        </span>
      </h2>

      {/* 問題がない場合の表示 */}
      {todayQuestions.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-600 font-medium text-base sm:text-lg">今日解く問題はありません 🎉</p>
          <p className="text-gray-500 mt-2 text-sm">おつかれさまでした！</p>
        </div>
      ) : (
        // 問題リスト (カードなし、区切り線で分割)
        <div className="divide-y divide-gray-200">
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            const isAmbiguousPanelOpen = expandedAmbiguousId === question.id;

            return (
              // 各問題のセクション
              <div key={question.id} className="py-6 sm:py-8 first:pt-0 last:pb-0">
                {/* 問題情報 (シンプルなテキスト表示) */}
                <div className="text-xs text-gray-500 mb-1">{question.subjectName}</div>
                <div className="font-semibold text-base sm:text-lg text-gray-800 mb-1">{question.chapterName}</div>
                <div className="text-sm text-gray-600 mb-4 sm:mb-5">問題 {question.id}</div>

                {/* --- 正誤ボタンエリア (画像1枚目デザイン) --- */}
                {!questionState.showComprehension && (
                  <div>
                    {/* ラベル */}
                    <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2">■ 解答結果</div>
                    {/* ボタンコンテナ (枠線で囲む) */}
                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                      {/* 正解ボタン */}
                      <button
                        onClick={() => handleAnswerClick(question.id, true)}
                        className="flex-1 py-2 px-2 sm:px-3 bg-white text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 transition-all flex items-center justify-center font-medium text-xs sm:text-sm border-r border-gray-300" // 境界線
                      >
                        <Check className="w-4 h-4 mr-1 sm:mr-1.5" strokeWidth={2.5} /> 正解
                      </button>
                      {/* 不正解ボタン */}
                      <button
                        onClick={() => handleAnswerClick(question.id, false)}
                        className="flex-1 py-2 px-2 sm:px-3 bg-white text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 transition-all flex items-center justify-center font-medium text-xs sm:text-sm"
                      >
                        <X className="w-4 h-4 mr-1 sm:mr-1.5" strokeWidth={2.5} /> 不正解
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 理解度ボタンエリア (正解後 / 読みやすさ改善案適用) --- */}
                {questionState.showComprehension && (
                  <div>
                     {/* ラベル */}
                    <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2">理解度を選択してください</div>
                     {/* ボタンコンテナ (枠線で囲む) */}
                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                       {/* 理解済みボタン (緑アクセント) */}
                      <button
                        onClick={() => handleUnderstandClick(question.id)}
                        className="flex-1 py-2 px-2 sm:px-3 bg-white text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 transition-all flex items-center justify-center font-medium text-xs sm:text-sm border-r border-gray-300" // 境界線
                      >
                        <Check className="w-4 h-4 mr-1 sm:mr-1.5" strokeWidth={2.5} /> 理解済み
                      </button>
                       {/* 曖昧ボタン (オレンジアクセント) */}
                      <button
                        onClick={() => handleAmbiguousClick(question.id)}
                        className={`flex-1 py-2 pl-2 sm:pl-3 pr-1 sm:pr-2 bg-white text-amber-600 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-400 transition-all flex items-center justify-between font-medium text-xs sm:text-sm`}
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1 sm:mr-1.5" strokeWidth={2.5}/>
                          <span>曖昧</span>
                        </div>
                         {/* ドロップダウン風アイコン (色調整) */}
                        <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 ml-1 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 曖昧理由選択パネル (画像3枚目デザイン + カラー) --- */}
                {isAmbiguousPanelOpen && (
                   <div className="mt-3 rounded-md overflow-hidden border border-amber-300 bg-white shadow-sm">
                     {/* パネルヘッダー (オレンジ系背景) */}
                    <div className="bg-amber-50 p-2 sm:p-2.5 border-b border-amber-200">
                      <div className="text-xs sm:text-sm font-semibold text-amber-800">曖昧だった理由を選択してください:</div>
                    </div>
                     {/* 理由選択肢 */}
                    <div className="divide-y divide-gray-100">
                      {ambiguousReasons.map((reason, index) => (
                        <button
                          key={index}
                          onClick={() => selectAmbiguousReason(question.id, reason)}
                          className="w-full py-2.5 sm:py-3 px-3 sm:px-4 text-left hover:bg-amber-50 focus:bg-amber-100 focus:outline-none transition-colors text-gray-700 flex items-center justify-between text-xs sm:text-sm"
                        >
                          <div className="flex items-center flex-1 mr-2">
                             {/* オレンジ色のドット */}
                            <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 sm:mr-2.5 flex-shrink-0"></span>
                            <span className="font-medium">{reason}</span>
                          </div>
                           {/* 日付バッジ (青系) */}
                          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">8日後</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div> // 問題セクション end
            );
          })}
        </div> // 問題リスト end
      )}
    </div> // 全体コンテナ end
  );
};

export default TodayView;
