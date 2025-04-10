// TodayView.jsx
// 【最終確定版 v2】カード形式 + 適度なボタン + 柔らかい色合い

import React, { useState } from 'react';
// lucide-react からアイコンをインポート
import { Check, X, AlertTriangle, ChevronsUpDown } from 'lucide-react'; // Clock はタイトルから削除

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

  // --- JSX 部分: カード + 適度なボタン + 柔らかい色合いで修正 ---
  return (
    <div className="px-4 py-6 sm:px-6 w-full max-w-2xl mx-auto pb-20"> {/* 最大幅調整 */}
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
        <div className="space-y-5 sm:space-y-6"> {/* カード間隔調整 */}
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            const isAmbiguousPanelOpen = expandedAmbiguousId === question.id;

            return (
              // 問題カード (影を少し柔らかく)
              <div key={question.id} className="bg-white shadow-md rounded-lg border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-lg"> {/* rounded-lgに変更 */}
                <div className="p-5 sm:p-6"> {/* カード内パディング */}
                  {/* 問題情報 */}
                  <div className="text-xs font-medium text-indigo-500 mb-1 uppercase tracking-wider">{question.subjectName}</div> {/* 色を少し薄く */}
                  <div className="font-semibold text-base sm:text-lg text-gray-800 mb-2">{question.chapterName}</div>
                  <div className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold mb-5 sm:mb-6"> {/* チップのスタイル変更 */}
                    問題 {question.id}
                  </div>

                  {/* --- 正誤ボタンエリア (適度なサイズ) --- */}
                  {!questionState.showComprehension && (
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-500 mb-2">解答結果</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {/* gap調整 */}
                        {/* 正解ボタン (少し柔らかい緑) */}
                        <button
                          onClick={() => handleAnswerClick(question.id, true)}
                          className="w-full py-2.5 px-4 bg-white border-2 border-green-400 text-green-600 rounded-md hover:bg-green-50 transition-all flex items-center justify-center font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300" // rounded-mdに変更
                        >
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5} /> 正解
                        </button>
                        {/* 不正解ボタン (少し柔らかい赤) */}
                        <button
                          onClick={() => handleAnswerClick(question.id, false)}
                          className="w-full py-2.5 px-4 bg-white border-2 border-red-400 text-red-600 rounded-md hover:bg-red-50 transition-all flex items-center justify-center font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300" // rounded-mdに変更
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5} /> 不正解
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- 理解度ボタンエリア (適度なサイズ + 柔らかい色) --- */}
                  {questionState.showComprehension && (
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-500 mb-2">理解度を選択</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"> {/* gap調整 */}
                        {/* 理解済みボタン (少し柔らかい緑) */}
                        <button
                          onClick={() => handleUnderstandClick(question.id)}
                          className="w-full py-2.5 px-4 bg-white border-2 border-green-400 text-green-600 rounded-md hover:bg-green-50 transition-all flex items-center justify-center font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300" // rounded-mdに変更
                        >
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5} /> 理解済み
                        </button>
                        {/* 曖昧ボタン (少し柔らかいオレンジ) */}
                        <button
                          onClick={() => handleAmbiguousClick(question.id)}
                          className={`w-full py-2.5 px-4 bg-white border-2 border-amber-400 text-amber-600 rounded-md hover:bg-amber-50 transition-all flex items-center justify-between font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300`} // rounded-md, 色調整
                        >
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={2.5}/>
                            <span>曖昧</span>
                          </div>
                          <ChevronsUpDown className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transform transition-transform duration-200 ${isAmbiguousPanelOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div> {/* End of main card padding */}

                {/* --- 曖昧理由選択パネル (柔らかい色) --- */}
                {isAmbiguousPanelOpen && (
                  <div className="px-5 sm:px-6 pb-5">
                     {/* パネル本体 */}
                     <div className="mt-2 rounded-md border border-amber-200 bg-white overflow-hidden shadow-sm"> {/* rounded-md, 色調整 */}
                       {/* パネルヘッダー (少し柔らかいオレンジ背景) */}
                       <div className="bg-amber-50 p-2 sm:p-2.5 border-b border-amber-200">
                         <div className="text-xs sm:text-sm font-semibold text-amber-700">曖昧だった理由を選択してください:</div> {/* 色調整 */}
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
                               {/* ドットアイコン (少し柔らかいオレンジ) */}
                               <span className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 sm:mr-3 flex-shrink-0 ring-1 ring-orange-200"></span> {/* 色調整 */}
                               <span className="font-medium">{reason}</span>
                             </div>
                              {/* 日付バッジ (少し柔らかい青) */}
                             <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">8日後</span> {/* 色調整 */}
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
