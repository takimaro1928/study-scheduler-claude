// src/TodayView.js
import React, { useState, useEffect } from 'react';
// アイコンのインポート（例: react-feather や heroicons などから）
// Check, X, AlertTriangle, AlertCircle に変更の可能性
import { Clock, Check, X, AlertTriangle, Square } from 'react-feather'; // 仮のインポート (Squareは青い四角用)

// --- ロジック部分は提供されたコードのまま ---
const TodayView = ({ getTodayQuestions, recordAnswer, formatDate }) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  const [questionStates, setQuestionStates] = useState({});

  // recordCompleteAnswer, handleAnswerClick, handleAmbiguousClick,
  // selectAmbiguousReason, handleUnderstandClick, getQuestionState
  // の各関数は提供されたコードの通り（変更なし）
  const recordCompleteAnswer = (questionId, isCorrect, understanding) => {
    recordAnswer(questionId, isCorrect, understanding);
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        showAnswered: false,
        showComprehension: false
      }
    }));
  };

  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: {
          showAnswered: false, // 正誤ボタンを隠す（変更）
          showComprehension: true,
        }
      }));
    } else {
      // 不正解時は即時記録し、UI状態を初期に戻す
      recordCompleteAnswer(questionId, false, '理解できていない×');
       // UI状態をリセットして正誤ボタンが再度表示されるようにする
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: undefined // or {} 空にしてデフォルトに戻す
      }));
    }
  };

  const handleAmbiguousClick = (questionId) => {
    setExpandedAmbiguousId(prevId => (prevId === questionId ? null : questionId));
  };

  const selectAmbiguousReason = (questionId, reason) => {
    // 理由とともに記録し、UI状態を初期に戻す
    recordAnswer(questionId, true, `曖昧△:${reason}`); // 正解(true)として記録する点は元のコードに従う
    setExpandedAmbiguousId(null);
    setQuestionStates(prev => ({
        ...prev,
        [questionId]: undefined // or {} 空にしてデフォルトに戻す
      }));
  };

  const handleUnderstandClick = (questionId) => {
     // 理解済みとして記録し、UI状態を初期に戻す
    recordCompleteAnswer(questionId, true, '理解○');
    setQuestionStates(prev => ({
        ...prev,
        [questionId]: undefined // or {} 空にしてデフォルトに戻す
      }));
  };

   const getQuestionState = (questionId) => {
    return questionStates[questionId] || {
      showAnswered: true, // デフォルトは正誤ボタン表示（変更）
      showComprehension: false
    };
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
    // 全体のコンテナ (左右padding調整、中央寄せ)
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full max-w-3xl mx-auto pb-20">
      {/* ページタイトル (アイコンなし) */}
      <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center justify-center">
        <span>① 今日解く問題</span>
        {/* 日付バッジ (画像に近いスタイルに) */}
        <span className="ml-3 text-sm bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full font-medium">
          {formatDate(new Date())}
        </span>
      </h2>

      {/* 問題がない場合の表示 */}
      {todayQuestions.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-700 font-medium text-lg">今日解く問題はありません 🎉</p>
          <p className="text-gray-500 mt-2">おつかれさまでした！</p>
        </div>
      ) : (
        // 問題リスト
        <div className="space-y-6">
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);

            return (
              // 問題カード (枠線なし、わずかな影、角丸を少し)
              <div key={question.id} className="bg-white shadow-sm rounded-lg p-6">
                {/* 科目名 (青文字) */}
                <div className="text-sm text-blue-600 mb-1 font-medium">{question.subjectName}</div>
                 {/* 章名 (黒文字、太め) */}
                <div className="font-semibold text-lg text-gray-800 mb-3">{question.chapterName}</div>
                {/* 問題番号チップ (画像に近いスタイルに) */}
                <div className="inline-block bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium mb-5">
                  問題 {question.id}
                </div>

                {/* --- 正誤ボタンエリア --- */}
                {questionState.showAnswered && ( // showAnsweredがtrueの時に表示
                  <div className="mb-5">
                    {/* ラベル */}
                    <div className="text-sm font-medium text-gray-700 mb-2">■ 解答結果</div>
                     {/* ボタンコンテナ */}
                    <div className="flex gap-3 sm:gap-4">
                      {/* 正解ボタン (画像のデザインに合わせる) */}
                      <button
                        onClick={() => handleAnswerClick(question.id, true)}
                        className="flex-1 py-3 px-4 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm"
                      >
                        {/* Checkアイコンに変更の可能性 */}
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 正解
                      </button>
                      {/* 不正解ボタン (画像のデザインに合わせる) */}
                      <button
                        onClick={() => handleAnswerClick(question.id, false)}
                        className="flex-1 py-3 px-4 bg-white border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm"
                      >
                         {/* Xアイコンに変更の可能性 */}
                        <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 不正解
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 理解度ボタンエリア --- */}
                {questionState.showComprehension && (
                  <div className="mb-5"> {/* animate-fadeInは削除 or 確認 */}
                    {/* ラベル */}
                    <div className="text-sm font-medium text-gray-700 mb-2">■ 理解度を選択してください</div>
                    {/* ボタンコンテナ */}
                    <div className="flex gap-3 sm:gap-4">
                      {/* 理解済みボタン (黒/グレー枠線) */}
                      <button
                        onClick={() => handleUnderstandClick(question.id)}
                        className="flex-1 py-3 px-4 bg-white border-2 border-gray-700 text-gray-800 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center font-semibold text-sm sm:text-base shadow-sm"
                      >
                         {/* Checkアイコンに変更 */}
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 理解済み（完全に定着）
                      </button>
                      {/* 曖昧ボタン (黒/グレー枠線、右に青い四角アイコン) */}
                      <button
                        onClick={() => handleAmbiguousClick(question.id)}
                        className={`flex-1 py-3 pl-4 pr-2 bg-white border-2 border-gray-700 text-gray-800 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-between font-semibold text-sm sm:text-base shadow-sm`}
                      >
                        <div className="flex items-center">
                           {/* AlertTriangleアイコンに変更 */}
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span>曖昧（記憶の定着に疑問）</span>
                        </div>
                        {/* 青い四角アイコン (例) */}
                        <Square className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 ml-2 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 曖昧理由選択パネル --- */}
                {expandedAmbiguousId === question.id && (
                   <div className="mt-4 rounded-lg overflow-hidden border border-amber-400 bg-white shadow-md"> {/* animate-fadeInは削除 or 確認 */}
                    {/* パネルヘッダー (オレンジ系背景) */}
                    <div className="bg-amber-300 p-3">
                      <div className="text-sm font-semibold text-amber-900">曖昧だった理由を選択してください:</div>
                    </div>
                    {/* 理由選択肢コンテナ (白背景、区切り線) */}
                    <div className="divide-y divide-gray-200">
                       {/* 6つの理由をマップ */}
                      {ambiguousReasons.map((reason) => (
                        <button
                          key={reason}
                          onClick={() => selectAmbiguousReason(question.id, reason)}
                          className="w-full py-3 px-4 text-left hover:bg-amber-50 transition-colors text-gray-800 flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center flex-1 mr-2">
                             {/* オレンジ色のドット */}
                            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                            <span className="font-medium">{reason}</span>
                          </div>
                          {/* 日付バッジ (一律8日後) */}
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
