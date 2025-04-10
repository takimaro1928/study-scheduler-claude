// src/TodayView.js
import React, { useState } from 'react';
// lucide-react からアイコンをインポート (App.jsで使われているもの)
import { Clock, Check, X, AlertTriangle, ChevronsUpDown } from 'lucide-react';

const TodayView = ({ getTodayQuestions, recordAnswer, formatDate }) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  // questionStates はUIの状態（主に理解度ボタン表示）を管理
  const [questionStates, setQuestionStates] = useState({});

  // 問題の状態を取得（デフォルトは正誤ボタン表示）
  const getQuestionState = (questionId) => {
    return questionStates[questionId] || { showComprehension: false };
  };

  // 正解/不正解ボタンのクリック処理
  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      // 正解の場合、理解度選択に進む (UI状態を変更)
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { showComprehension: true } // 解答結果ボタンを隠し、理解度ボタンを表示
      }));
      // データ記録(recordAnswer)は理解度/理由選択後に行う
    } else {
      // 不正解の場合、すぐに記録し、UI状態を初期化
      recordAnswer(questionId, false, '理解できていない×');
      setQuestionStates(prev => {
        const newState = { ...prev };
        delete newState[questionId]; // この問題の状態をリセット
        return newState;
      });
    }
  };

  // 「理解済み」ボタンの処理
  const handleUnderstandClick = (questionId) => {
    recordAnswer(questionId, true, '理解○');
    setQuestionStates(prev => {
      const newState = { ...prev };
      delete newState[questionId]; // UI状態をリセット
      return newState;
    });
  };

  // 「曖昧」ボタンの処理（パネル開閉）
  const handleAmbiguousClick = (questionId) => {
    setExpandedAmbiguousId(prevId => (prevId === questionId ? null : questionId));
  };

  // 曖昧理由選択の処理
  const selectAmbiguousReason = (questionId, reason) => {
    recordAnswer(questionId, true, `曖昧△:${reason}`); // 正解として記録
    setExpandedAmbiguousId(null);
    setQuestionStates(prev => {
      const newState = { ...prev };
      delete newState[questionId]; // UI状態をリセット
      return newState;
    });
  };

  // 曖昧さの理由リスト（要件定義通りの6つ）
  const ambiguousReasons = [
    '偶然正解した',
    '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった',
    '合っていたが、別の理由を思い浮かべていた',
    '自信はなかったけど、これかなとは思っていた', // 追加
    '問題を覚えてしまっていた',                 // 追加
    'その他'
  ];

  return (
    // 全体のコンテナ（デザインはユーザー提供コードベース）
    <div className="p-6 w-full sm:w-10/12 md:w-8/12 lg:w-7/12 xl:w-6/12 mx-auto pb-20">
       {/* ヘッダー */}
      <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center justify-center">
        <Clock className="w-6 h-6 mr-3 text-indigo-500" /> {/* lucideアイコン */}
        <span>今日解く問題</span>
        <span className="ml-3 text-lg bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
          {formatDate(new Date())}
        </span>
      </h2>

      {/* 問題がない場合 */}
      {todayQuestions.length === 0 ? (
        // デザインはユーザー提供コードベース
        <div className="card p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <p className="text-indigo-800 font-medium text-lg">今日解く問題はありません 🎉</p>
          <p className="text-indigo-600 mt-2">おつかれさまでした！</p>
        </div>
      ) : (
        // 問題リスト
        <div className="space-y-8">
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            const isAmbiguousPanelOpen = expandedAmbiguousId === question.id;

            return (
               // 問題カード（デザインはユーザー提供コードベース）
              <div key={question.id} className="card p-6">
                 {/* 問題情報 */}
                <div className="text-sm text-indigo-600 mb-1 font-medium">{question.subjectName}</div>
                <div className="font-bold text-xl text-gray-800 mb-3">{question.chapterName}</div>
                <div className="inline-block bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-2 rounded-full text-indigo-700 font-medium shadow-sm mb-5 border border-indigo-100">
                  問題 {question.id}
                </div>

                {/* --- 正誤ボタンエリア (理解度ボタンが表示されていない時) --- */}
                {!questionState.showComprehension && (
                  <div className="mb-5">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      解答結果
                    </div>
                    <div className="flex gap-3">
                       {/* 正解ボタン */}
                      <button
                        onClick={() => handleAnswerClick(question.id, true)}
                        // デザインはユーザー提供コードベース、アイコンはlucideに変更
                        className="flex-1 py-4 px-4 bg-white border-2 border-green-400 text-green-700 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center font-bold shadow-sm"
                      >
                        <Check className="w-5 h-5 mr-2" strokeWidth={2.5}/> 正解 ⭕️
                      </button>
                       {/* 不正解ボタン */}
                      <button
                        onClick={() => handleAnswerClick(question.id, false)}
                        // デザインはユーザー提供コードベース、アイコンはlucideに変更
                        className="flex-1 py-4 px-4 bg-white border-2 border-red-400 text-red-700 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center font-bold shadow-sm"
                      >
                        <X className="w-5 h-5 mr-2" strokeWidth={2.5}/> 不正解 ❌
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 理解度ボタンエリア (正解ボタンが押された後) --- */}
                {questionState.showComprehension && (
                  // animate-fadeIn は削除 or 確認
                  <div className="mb-5">
                    <div className="text-sm font-bold text-black mb-3 flex items-center">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      理解度を選択してください
                    </div>
                    <div className="flex gap-3">
                      {/* 理解済みボタン */}
                      <button
                        onClick={() => handleUnderstandClick(question.id)}
                        // デザインはユーザー提供コードベース、アイコンはlucideに変更
                        className="flex-1 py-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 mr-2 text-white" strokeWidth={2.5}/> {/* アイコンの色を白に変更 */}
                        <span className="text-lg font-bold" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>理解済み（完全に定着）</span>
                      </button>
                      {/* 曖昧ボタン */}
                      <button
                        onClick={() => handleAmbiguousClick(question.id)}
                         // デザインはユーザー提供コードベース、アイコンはlucideに変更
                        className={`flex-1 py-4 ${
                          isAmbiguousPanelOpen
                            ? 'bg-gradient-to-br from-amber-500 to-yellow-600'
                            : 'bg-gradient-to-br from-amber-400 to-yellow-500'
                        } rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center`}
                      >
                        <AlertTriangle className="w-5 h-5 mr-2 text-white" /> {/* アイコンの色を白に変更 */}
                        <span className="text-lg font-bold" style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>曖昧（記憶の定着に疑問）</span>
                         {/* 開閉アイコン (元のコードのものを流用) */}
                        {isAmbiguousPanelOpen ? ' 🔼' : ' 🔽'}
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 曖昧理由選択パネル --- */}
                {isAmbiguousPanelOpen && (
                  // animate-fadeIn は削除 or 確認
                  // デザインはユーザー提供コードベース
                  <div className="mt-4 rounded-xl overflow-hidden border border-yellow-300 shadow-lg">
                    <div className="bg-gradient-to-r from-amber-300 to-yellow-300 p-4">
                      <div className="text-base font-bold text-black">曖昧だった理由を選択してください:</div>
                    </div>
                    <div className="divide-y divide-yellow-200 bg-white">
                      {/* ***修正点: 理由を6つ表示し、日付は8日後に統一*** */}
                      {ambiguousReasons.map((reasonText, index) => (
                        <button
                          key={index}
                          onClick={() => selectAmbiguousReason(question.id, reasonText)}
                           // デザインはユーザー提供コードベース
                          className="w-full py-4 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
                        >
                          <div className="flex items-center flex-1 mr-2">
                            <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></span>
                            <span className="font-bold text-black">{reasonText}</span>
                          </div>
                           {/* ***修正点: 日付バッジを8日後に固定*** */}
                          <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full whitespace-nowrap">8日後</span>
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
