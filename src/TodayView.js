// src/TodayView.js
import React, { useState } from 'react';
import { Clock } from 'lucide-react';

const TodayView = ({ getTodayQuestions, recordAnswer, formatDate }) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  const [questionStates, setQuestionStates] = useState({});

  // 問題の状態を取得（初期状態では解答結果の選択肢を表示）
  const getQuestionState = (questionId) => {
    return questionStates[questionId] || { 
      showComprehension: false,
      showAnswerResult: false 
    };
  };

  // 正解/不正解の選択
  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      // 正解の場合、理解度選択に進む
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { showComprehension: true, showAnswerResult: false }
      }));
    } else {
      // 不正解の場合、そのまま記録
      recordAnswer(questionId, false, '理解できていない×');
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { showAnswerResult: true, isCorrect: false }
      }));
    }
  };

  // 「理解済み」ボタンの処理
  const handleUnderstandClick = (questionId) => {
    recordAnswer(questionId, true, '理解○');
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: { showAnswerResult: false, showComprehension: false }
    }));
  };

  // 「曖昧」ボタンの処理
  const handleAmbiguousClick = (questionId) => {
    setExpandedAmbiguousId(prevId => (prevId === questionId ? null : questionId));
  };

  // 曖昧理由選択の処理
  const selectAmbiguousReason = (questionId, reason, days) => {
    recordAnswer(questionId, true, `曖昧△:${reason}`);
    setExpandedAmbiguousId(null);
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: { showAnswerResult: false, showComprehension: false }
    }));
  };

  // 画像に合わせた曖昧理由選択肢のデータ
  const ambiguousReasons = [
    { text: '偶然正解した', days: 2 },
    { text: '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった', days: 10 },
    { text: '合っていたが、別の理由を思い浮かべていた', days: 5 },
    { text: 'その他', days: 20 }
  ];

  return (
    <div className="pb-20">
      {/* ヘッダー - 画像通りのデザイン */}
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 mr-2" />
        <h2 className="text-xl font-medium">今日解く問題{formatDate(new Date())}</h2>
      </div>

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
              <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-4 pb-5">
                {/* 問題情報 */}
                <div className="text-blue-600 mb-1">{question.subjectName}</div>
                <div className="font-bold text-lg mb-2">{question.chapterName}</div>
                <div className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm mb-6">
                  問題 {question.id}
                </div>

                {/* 理解度を選択してください */}
                {!questionState.showAnswerResult && !questionState.showComprehension && (
                  <div className="mb-2">
                    <div className="text-sm mb-2">理解度を選択してください</div>
                    <div className="flex">
                      <button
                        onClick={() => handleUnderstandClick(question.id)}
                        className="flex-1 py-2 border border-gray-300 rounded-sm flex items-center justify-center bg-white text-gray-800 mr-1"
                      >
                        <span className="mr-2">✓</span>
                        理解済み（完全に定着）
                      </button>
                      <button
                        onClick={() => handleAmbiguousClick(question.id)}
                        className="flex-1 py-2 border border-gray-300 rounded-sm flex items-center justify-between bg-white text-gray-800 px-3"
                      >
                        <div className="flex items-center">
                          <span className="mr-2">△</span>
                          曖昧（記憶の定着に疑問）
                        </div>
                        <span>▼</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 解答結果 */}
                {questionState.showAnswerResult && (
                  <div className="mb-2">
                    <div className="text-sm mb-2">解答結果</div>
                    <div className="flex">
                      <button
                        className={`flex-1 py-2 border rounded-sm flex items-center justify-center mr-1 ${
                          questionState.isCorrect 
                            ? 'bg-green-100 border-green-500 text-green-800' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        onClick={() => handleAnswerClick(question.id, true)}
                      >
                        <span className="mr-2">✓</span> 正解 ⭕️
                      </button>
                      <button
                        className={`flex-1 py-2 border rounded-sm flex items-center justify-center ${
                          !questionState.isCorrect 
                            ? 'bg-red-100 border-red-500 text-red-800' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        onClick={() => handleAnswerClick(question.id, false)}
                      >
                        <span className="mr-2">✗</span> 不正解 ❌
                      </button>
                    </div>
                  </div>
                )}

                {/* 曖昧理由選択パネル - 画像1のデザイン */}
                {isAmbiguousPanelOpen && (
                  <div className="mt-2 border border-yellow-400">
                    <div className="bg-yellow-100 p-2 border-b border-yellow-300">
                      <div className="font-medium">曖昧だった理由を選択してください:</div>
                    </div>
                    <div>
                      {ambiguousReasons.map((reason, index) => (
                        <button 
                          key={index}
                          onClick={() => selectAmbiguousReason(question.id, reason.text, reason.days)}
                          className="w-full py-2 px-4 text-left border-b border-yellow-100 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                            <span>{reason.text}</span>
                          </div>
                          <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
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
