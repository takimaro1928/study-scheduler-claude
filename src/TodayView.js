// src/TodayView.js
// TodayView.jsx
import React, { useState } from 'react';
// lucide-react からアイコンをインポート
import { Clock, Check, X, AlertTriangle, ChevronsUpDown } from 'lucide-react'; // 青い四角の代わりに ChevronsUpDown を仮使用

// --- ロジック部分は提供された App.js の recordAnswer を呼び出す前提 ---
//     TodayView 内部のロジックはUI状態管理が中心
const TodayView = ({ getTodayQuestions, recordAnswer, formatDate }) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  // questionStates は、正解後に理解度ボタンを表示するためだけに使用
  const [questionStates, setQuestionStates] = useState({});

  // App.js の recordAnswer を呼び出す関数群
  // recordCompleteAnswer は不要になったので削除（App.js側で行うため）

  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      // 正解の場合、UI状態を変更して理解度ボタンを表示
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { showComprehension: true }
      }));
    } else {
      // 不正解の場合、App.jsのrecordAnswerを呼び出し、UI状態はリセット
      recordAnswer(questionId, false, '理解できていない×');
       // UI状態をリセット (TodayView側ではこれ以上何もしない)
       setQuestionStates(prev => {
         const newState = {...prev};
         delete newState[questionId]; // 当該問題の状態を削除して初期状態に戻す
         return newState;
       });
    }
  };

  const handleAmbiguousClick = (questionId) => {
    // 曖昧理由パネルの開閉
    setExpandedAmbiguousId(prevId => (prevId === questionId ? null : questionId));
  };

  const selectAmbiguousReason = (questionId, reason) => {
    // 理由とともにApp.jsのrecordAnswerを呼び出し、UI状態をリセット
    recordAnswer(questionId, true, `曖昧△:${reason}`); // 正解(true)として記録
    setExpandedAmbiguousId(null);
     setQuestionStates(prev => {
         const newState = {...prev};
         delete newState[questionId];
         return newState;
       });
  };

  const handleUnderstandClick = (questionId) => {
     // 理解済みとしてApp.jsのrecordAnswerを呼び出し、UI状態をリセット
    recordAnswer(questionId, true, '理解○');
     setQuestionStates(prev => {
         const newState = {...prev};
         delete newState[questionId];
         return newState;
       });
  };

   const getQuestionState = (questionId) => {
    // questionStates に当該IDがあれば理解度ボタン表示中、なければ正誤ボタン表示
    return questionStates[questionId] || { showComprehension: false };
  };

  // 曖昧さの理由リスト（6つ）
  const ambiguousReasons = [
    '偶然正解した',
    '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった',
    '合っていたが、別の理由を思い浮かべていた',
    '自信はなかったけど、これかなとは思っていた', // 追加
    '問題を覚えてしまっていた',                 // 追加
    'その他'
  ];

  // --- JSX 部分のデザインを指示された画像に合わせて修正 ---
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full max-w-3xl mx-auto pb-20">
      {/* ページタイトル */}
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-800 flex items-center justify-center">
        <span>① 今日解く問題</span>
        <span className="ml-3 text-sm sm:text-base bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full font-medium">
          {formatDate(new Date())}
        </span>
      </h2>

      {todayQuestions.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-700 font-medium text-lg">今日解く問題はありません 🎉</p>
          <p className="text-gray-500 mt-2">おつかれさまでした！</p>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            const isAmbiguousPanelOpen = expandedAmbiguousId === question.id;

            return (
              <div key={question.id} className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
                <div className="text-xs text-blue-600 mb-1 font-medium">{question.subjectName}</div>
                <div className="font-semibold text-base sm:text-lg text-gray-800 mb-2 sm:mb-3">{question.chapterName}</div>
                <div className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium mb-4 sm:mb-5">
                  問題 {question.id}
                </div>

                {/* --- 正誤ボタンエリア (理解度ボタンが表示されていない時) --- */}
                {!questionState.showComprehension && (
                  <div className="mb-1"> {/* 下マージン調整 */}
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">■ 解答結果</div>
                    <div className="flex gap-3 sm:gap-4">
                      <button
                        onClick={() => handleAnswerClick(question.id, true)}
                        className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm"
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" strokeWidth={2.5} /> 正解
                      </button>
                      <button
                        onClick={() => handleAnswerClick(question.id, false)}
                        className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-white border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" strokeWidth={2.5} /> 不正解
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 理解度ボタンエリア (正解ボタンが押された後) --- */}
                {questionState.showComprehension && (
                  <div className="mb-1"> {/* 下マージン調整 */}
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">■ 理解度を選択してください</div>
                    <div className="flex gap-3 sm:gap-4">
                      <button
                        onClick={() => handleUnderstandClick(question.id)}
                        className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-white border-2 border-gray-600 text-gray-700 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center font-semibold text-xs sm:text-sm shadow-sm" // 文字サイズ調整
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" strokeWidth={2.5} /> 理解済み（完全に定着）
                      </button>
                      <button
                        onClick={() => handleAmbiguousClick(question.id)}
                        className={`flex-1 py-2.5 sm:py-3 pl-3 sm:pl-4 pr-2 sm:pr-3 bg-white border-2 border-gray-600 text-gray-700 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-between font-semibold text-xs sm:text-sm shadow-sm`} // 文字サイズ調整
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" strokeWidth={2.5}/>
                          <span>曖昧（記憶の定着に疑問）</span>
                        </div>
                        {/* ドロップダウン風アイコン */}
                        <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 ml-1 sm:ml-2 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 曖昧理由選択パネル --- */}
                {isAmbiguousPanelOpen && (
                   <div className="mt-3 rounded-md overflow-hidden border border-amber-400 bg-white shadow-sm">
                    <div className="bg-amber-100 p-2 sm:p-3 border-b border-amber-300">
                      <div className="text-xs sm:text-sm font-semibold text-amber-800">曖昧だった理由を選択してください:</div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {ambiguousReasons.map((reason) => (
                        <button
                          key={reason}
                          onClick={() => selectAmbiguousReason(question.id, reason)}
                          className="w-full py-2.5 sm:py-3 px-3 sm:px-4 text-left hover:bg-amber-50 transition-colors text-gray-700 flex items-center justify-between text-xs sm:text-sm" // 文字サイズ調整
                        >
                          <div className="flex items-center flex-1 mr-2">
                            <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                            <span className="font-medium">{reason}</span>
                          </div>
                          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">8日後</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div> // card end
            );
          })}
        </div> // space-y end
      )}
    </div> // container end
  );
};

export default TodayView;
