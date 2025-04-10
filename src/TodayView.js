// TodayView.jsx
// 【最終確定版】カード形式 + 適度なボタン + 参照画像のデザイン + α

import React, { useState } from 'react';
// lucide-react からアイコンをインポート
import { Clock, Check, X, AlertTriangle, ChevronsUpDown } from 'lucide-react';

const TodayView = ({ getTodayQuestions, recordAnswer, formatDate }) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  const [questionStates, setQuestionStates] = useState({});

  // --- ハンドラ関数群 (ロジックは変更なし) ---
  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      setQuestionStates(prev => ({ ...prev, [questionId]: { showComprehension: true } }));
    } else {
      recordAnswer(questionId, false, '理解できていない×');
       setQuestionStates(prev => { const newState = {...prev}; delete newState[questionId]; return newState; });
    }
  };
  const handleAmbiguousClick = (questionId) => {
    setExpandedAmbiguousId(prevId => (prevId === questionId ? null : questionId));
  };
  const selectAmbiguousReason = (questionId, reason) => {
    recordAnswer(questionId, true, `曖昧△:${reason}`);
    setExpandedAmbiguousId(null);
     setQuestionStates(prev => { const newState = {...prev}; delete newState[questionId]; return newState; });
  };
  const handleUnderstandClick = (questionId) => {
    recordAnswer(questionId, true, '理解○');
     setQuestionStates(prev => { const newState = {...prev}; delete newState[questionId]; return newState; });
  };
   const getQuestionState = (questionId) => {
    return questionStates[questionId] || { showComprehension: false };
  };
  const ambiguousReasons = [ // 6つの理由
    '偶然正解した', '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった', '合っていたが、別の理由を思い浮かべていた',
    '自信はなかったけど、これかなとは思っていた', '問題を覚えてしまっていた', 'その他'
  ];

  // --- JSX 部分: 指示されたデザイン + おしゃれ感を意識して修正 ---
  return (
    <div className="px-4 py-6 sm:px-6 w-full max-w-3xl mx-auto pb-20">
      {/* ページタイトル */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-gray-700 flex items-center justify-center">
        <span>今日解く問題</span>
        <span className="ml-3 text-sm sm:text-base bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full font-medium shadow-sm">
          {formatDate(new Date())}
        </span>
      </h2>

      {todayQuestions.length === 0 ? (
        <div className="bg-white shadow-md rounded-xl p-8 text-center border border-gray-100">
          <p className="text-gray-600 font-medium text-base sm:text-lg">今日解く問題はありません 🎉</p>
          <p className="text-gray-500 mt-2 text-sm">素晴らしい！ゆっくり休んでください。</p>
        </div>
      ) : (
        // 問題リスト (カード形式)
        <div className="space-y-6 sm:space-y-8">
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            const isAmbiguousPanelOpen = expandedAmbiguousId === question.id;

            return (
              // 問題カード (影、角丸を調整)
              <div key={question.id} className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <div className="p-5 sm:p-6"> {/* カード内パディング */}
                  {/* 問題情報 */}
                  <div className="text-xs font-medium text-indigo-600 mb-1 uppercase tracking-wider">{question.subjectName}</div>
                  <div className="font-semibold text-base sm:text-lg text-gray-800 mb-2">{question.chapterName}</div>
                  {/* 問題番号チップ (参照画像のデザインに近づける) */}
                  <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-5 sm:mb-6 shadow-sm">
                    問題 {question.id}
                  </div>

                  {/* --- 正誤ボタンエリア (適度なサイズ) --- */}
                  {!questionState.showComprehension && (
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-500 mb-2">解答結果</div>
                      {/* ボタンコンテナ (gapでゆとり) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* 正解ボタン */}
                        <button
                          onClick={() => handleAnswerClick(question.id, true)}
                          className="w-full py-2.5 px-4 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                        >
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5} /> 正解
                        </button>
                        {/* 不正解ボタン */}
                        <button
                          onClick={() => handleAnswerClick(question.id, false)}
                          className="w-full py-2.5 px-4 bg-white border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5} /> 不正解
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- 理解度ボタンエリア (適度なサイズ) --- */}
                  {questionState.showComprehension && (
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-500 mb-2">理解度を選択</div>
                      {/* ボタンコンテナ (gapでゆとり) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* 理解済みボタン (緑枠線) */}
                        <button
                          onClick={() => handleUnderstandClick(question.id)}
                           className="w-full py-2.5 px-4 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                        >
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5} /> 理解済み
                        </button>
                        {/* 曖昧ボタン (オレンジ枠線) */}
                        <button
                          onClick={() => handleAmbiguousClick(question.id)}
                          className={`w-full py-2.5 px-4 bg-white border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-all flex items-center justify-between font-semibold text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400`}
                        >
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5}/>
                            <span>曖昧</span>
                          </div>
                           {/* アイコンで開閉表示 */}
                          <ChevronsUpDown className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transform transition-transform duration-200 ${isAmbiguousPanelOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div> {/* End of main card padding */}

                {/* --- 曖昧理由選択パネル (参照画像のデザイン + α) --- */}
                {isAmbiguousPanelOpen && (
                  // パネルをカード下部に (padding調整)
                  <div className="px-5 sm:px-6 pb-5">
                     {/* パネル本体 (角丸、枠線、影) */}
                     <div className="mt-2 rounded-lg border border-amber-200 bg-white overflow-hidden shadow-sm">
                       {/* パネルヘッダー (参照画像の色) */}
                       <div className="bg-amber-100 p-2 sm:p-2.5 border-b border-amber-200">
                         <div className="text-xs sm:text-sm font-semibold text-amber-800">曖昧だった理由を選択してください:</div>
                       </div>
                       {/* 理由選択肢 */}
                       <div className="divide-y divide-gray-100">
                         {ambiguousReasons.map((reason, index) => (
                           <button
                             key={index}
                             onClick={() => selectAmbiguousReason(question.id, reason)}
                             className="w-full py-3 sm:py-3 px-3 sm:px-4 text-left hover:bg-amber-50 focus:bg-amber-100 focus:outline-none transition-colors text-gray-700 flex items-center justify-between text-xs sm:text-sm"
                           >
                             <div className="flex items-center flex-1 mr-2">
                                {/* ドットアイコン (参照画像の色) */}
                               <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 sm:mr-3 flex-shrink-0 ring-1 ring-orange-200"></span>
                               <span className="font-medium">{reason}</span>
                             </div>
                              {/* 日付バッジ (参照画像の色、8日後固定) */}
                             <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">8日後</span>
                           </button>
                         ))}
                       </div>
                     </div>
                  </div>
                )}
              </div> // 問題カード end
            );
          })}
        </div> // 問題リスト end
      )}
    </div> // 全体コンテナ end
  );
};

export default TodayView;
