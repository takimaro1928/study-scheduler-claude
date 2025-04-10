// TodayView.jsx
// 【修正版】カード形式 + ゆとりのあるボタンデザイン

import React, { useState } from 'react';
// lucide-react からアイコンをインポート
import { Clock, Check, X, AlertTriangle, ChevronsUpDown } from 'lucide-react';

// --- ロジック部分は変更なし ---
const TodayView = ({ getTodayQuestions, recordAnswer, formatDate }) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  const [questionStates, setQuestionStates] = useState({});

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
  const ambiguousReasons = [
    '偶然正解した', '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった', '合っていたが、別の理由を思い浮かべていた',
    '自信はなかったけど、これかなとは思っていた', '問題を覚えてしまっていた', 'その他'
  ];

  // --- JSX 部分のデザインをカード形式 + ゆとりのあるボタンに変更 ---
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full max-w-3xl mx-auto pb-20">
      {/* ページタイトル */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-gray-700 flex items-center justify-center">
        {/* <Clock className="w-6 h-6 mr-2 text-indigo-500" /> */} {/* アイコンを削除してシンプルに */}
        <span>今日解く問題</span>
        <span className="ml-3 text-sm sm:text-base bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full font-medium">
          {formatDate(new Date())}
        </span>
      </h2>

      {todayQuestions.length === 0 ? (
        // 問題がない場合の表示 (カード風)
        <div className="bg-white shadow rounded-xl p-8 text-center border border-gray-100">
          <p className="text-gray-600 font-medium text-base sm:text-lg">今日解く問題はありません 🎉</p>
          <p className="text-gray-500 mt-2 text-sm">おつかれさまでした！</p>
        </div>
      ) : (
         // 問題リスト (カード形式)
        <div className="space-y-6 sm:space-y-8">
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            const isAmbiguousPanelOpen = expandedAmbiguousId === question.id;

            return (
              // 問題カード (おしゃれなカードに)
              <div key={question.id} className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                <div className="p-5 sm:p-6"> {/* カード内部のパディング */}
                  {/* 問題情報 */}
                  <div className="text-xs font-medium text-indigo-600 mb-1 uppercase tracking-wider">{question.subjectName}</div>
                  <div className="font-semibold text-lg sm:text-xl text-gray-800 mb-2">{question.chapterName}</div>
                  <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium mb-5 sm:mb-6">
                    問題 {question.id}
                  </div>

                  {/* --- 正誤ボタンエリア --- */}
                  {!questionState.showComprehension && (
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-500 mb-2">解答結果</div>
                       {/* ボタンコンテナ (ゆとりのある配置) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                         {/* 正解ボタン (ゆとりのあるスタイル) */}
                        <button
                          onClick={() => handleAnswerClick(question.id, true)}
                          className="w-full py-3 px-5 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                        >
                          <Check className="w-5 h-5 mr-2" strokeWidth={2.5} /> 正解
                        </button>
                         {/* 不正解ボタン (ゆとりのあるスタイル) */}
                        <button
                          onClick={() => handleAnswerClick(question.id, false)}
                          className="w-full py-3 px-5 bg-white border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                        >
                          <X className="w-5 h-5 mr-2" strokeWidth={2.5} /> 不正解
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- 理解度ボタンエリア --- */}
                  {questionState.showComprehension && (
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-500 mb-2">理解度を選択</div>
                      {/* ボタンコンテナ (ゆとりのある配置) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                         {/* 理解済みボタン (ゆとりのあるスタイル - 緑アクセント) */}
                        <button
                          onClick={() => handleUnderstandClick(question.id)}
                          className="w-full py-3 px-5 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                        >
                          <Check className="w-5 h-5 mr-2" strokeWidth={2.5} /> 理解済み
                        </button>
                         {/* 曖昧ボタン (ゆとりのあるスタイル - オレンジアクセント) */}
                        <button
                          onClick={() => handleAmbiguousClick(question.id)}
                          className={`w-full py-3 px-5 bg-white border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-all flex items-center justify-between font-semibold text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400`}
                        >
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" strokeWidth={2.5}/>
                            <span>曖昧</span>
                          </div>
                          <ChevronsUpDown className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transform transition-transform duration-200 ${isAmbiguousPanelOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div> {/* End of main card padding */}

                {/* --- 曖昧理由選択パネル (カード内に表示) --- */}
                {isAmbiguousPanelOpen && (
                  // パネルをカード下部に表示 (少しインデント)
                  <div className="px-5 sm:px-6 pb-5">
                     <div className="mt-3 rounded-lg border border-amber-300 bg-white overflow-hidden shadow-sm">
                       <div className="bg-amber-50 p-2 sm:p-2.5 border-b border-amber-200">
                         <div className="text-xs sm:text-sm font-semibold text-amber-800">曖昧だった理由を選択してください:</div>
                       </div>
                       <div className="divide-y divide-gray-100">
                         {ambiguousReasons.map((reason, index) => (
                           <button
                             key={index}
                             onClick={() => selectAmbiguousReason(question.id, reason)}
                             className="w-full py-3 sm:py-3.5 px-3 sm:px-4 text-left hover:bg-amber-50 focus:bg-amber-100 focus:outline-none transition-colors text-gray-700 flex items-center justify-between text-xs sm:text-sm"
                           >
                             <div className="flex items-center flex-1 mr-2">
                               {/* ドットアイコンを少しおしゃれに */}
                               <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 sm:mr-3 flex-shrink-0 ring-1 ring-amber-200"></span>
                               <span className="font-medium">{reason}</span>
                             </div>
                             <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">8日後</span>
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
