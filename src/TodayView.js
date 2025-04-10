// src/TodayView.js
import React, { useState } from 'react';
import { Clock, Check, X, AlertTriangle } from 'lucide-react';

const TodayView = ({ getTodayQuestions, recordAnswer, formatDate }) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  const [questionStates, setQuestionStates] = useState({});

  // 問題の状態を取得（初期状態では解答結果の選択肢を表示）
  const getQuestionState = (questionId) => {
    return questionStates[questionId] || { 
      showComprehension: false 
    };
  };

  // 正解/不正解の選択
  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      // 正解の場合、理解度選択に進む
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { showComprehension: true }
      }));
    } else {
      // 不正解の場合、そのまま記録
      recordAnswer(questionId, false, '理解できていない×');
      setQuestionStates(prev => {
        const newState = {...prev};
        delete newState[questionId];
        return newState;
      });
    }
  };

  // 「理解済み」ボタンの処理
  const handleUnderstandClick = (questionId) => {
    recordAnswer(questionId, true, '理解○');
    setQuestionStates(prev => {
      const newState = {...prev};
      delete newState[questionId];
      return newState;
    });
  };

  // 「曖昧」ボタンの処理
  const handleAmbiguousClick = (questionId) => {
    setExpandedAmbiguousId(prevId => (prevId === questionId ? null : questionId));
  };

  // 曖昧理由選択の処理
  const selectAmbiguousReason = (questionId, reason) => {
    recordAnswer(questionId, true, `曖昧△:${reason}`);
    setExpandedAmbiguousId(null);
    setQuestionStates(prev => {
      const newState = {...prev};
      delete newState[questionId];
      return newState;
    });
  };

  // 画像3の曖昧理由選択肢のデータ（写真に合わせて更新）
  const ambiguousReasons = [
    { text: '偶然正解した', days: 2 },
    { text: '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった', days: 10 },
    { text: '合っていたが、別の理由を思い浮かべていた', days: 5 },
    { text: 'その他', days: 20 }
  ];

  return (
    <div className="p-4 pb-20 max-w-3xl mx-auto">
      {/* ヘッダー - 写真通りのデザイン */}
      <h2 className="text-xl font-bold mb-6 flex items-center justify-center">
        <Clock className="w-5 h-5 mr-2" />
        <span>今日解く問題</span>
        <span className="ml-3 text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
          {formatDate(new Date())}
        </span>
      </h2>

      {/* 問題がない場合 */}
      {todayQuestions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center">
          <p className="text-gray-700 font-medium">今日解く問題はありません</p>
          <p className="text-gray-500 mt-2">おつかれさまでした！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            const isAmbiguousPanelOpen = expandedAmbiguousId === question.id;

            return (
              <div key={question.id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
                {/* 問題情報 */}
                <div className="text-xs text-blue-600 mb-1">{question.subjectName}</div>
                <div className="font-bold text-lg mb-2">{question.chapterName}</div>
                <div className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs mb-4">
                  問題 {question.id}
                </div>

                {/* 表示状態１：解答結果選択（正解/不正解） - 画像1のデザイン */}
                {!questionState.showComprehension && (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">解答結果</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAnswerClick(question.id, true)}
                        className="flex-1 py-3 bg-white border-2 border-green-400 text-green-700 rounded-lg flex items-center justify-center font-medium"
                      >
                        <Check className="w-5 h-5 mr-2" /> 正解 ⭕️
                      </button>
                      <button
                        onClick={() => handleAnswerClick(question.id, false)}
                        className="flex-1 py-3 bg-white border-2 border-red-400 text-red-700 rounded-lg flex items-center justify-center font-medium"
                      >
                        <X className="w-5 h-5 mr-2" /> 不正解 ❌
                      </button>
                    </div>
                  </div>
                )}

                {/* 表示状態２：理解度選択 - 画像2のデザイン */}
                {questionState.showComprehension && (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">理解度を選択してください</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUnderstandClick(question.id)}
                        className="flex-1 py-3 border border-gray-300 rounded-lg flex items-center justify-center bg-white text-gray-800"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        理解済み（完全に定着）
                      </button>
                      <button
                        onClick={() => handleAmbiguousClick(question.id)}
                        className="flex-1 py-3 border border-gray-300 rounded-lg flex items-center justify-between bg-white text-gray-800 px-3"
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          曖昧（記憶の定着に疑問）
                        </div>
                        {isAmbiguousPanelOpen ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 表示状態３：曖昧理由選択パネル - 画像3のデザイン */}
                {isAmbiguousPanelOpen && (
                  <div className="mt-4 border border-yellow-400 rounded-lg overflow-hidden">
                    <div className="bg-yellow-100 p-3 border-b border-yellow-300">
                      <div className="font-medium text-amber-800">曖昧だった理由を選択してください:</div>
                    </div>
                    <div className="bg-white">
                      {ambiguousReasons.map((reason, index) => (
                        <button 
                          key={index}
                          onClick={() => selectAmbiguousReason(question.id, reason.text)}
                          className="w-full py-3 px-4 text-left hover:bg-yellow-50 transition-colors border-b border-yellow-100 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                            <span className="font-medium">{reason.text}</span>
                          </div>
                          <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full whitespace-nowrap">
                            {reason.days}日後
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodayView;
