// src/TodayView.js
import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const TodayView = ({ 
  getTodayQuestions, 
  recordAnswer, 
  formatDate 
}) => {
  const todayQuestions = getTodayQuestions();
  const [expandedAmbiguousId, setExpandedAmbiguousId] = useState(null);
  
  // 問題の回答を記録する関数
  const recordCompleteAnswer = (questionId, isCorrect, understanding) => {
    // 正解/不正解と理解度を記録
    recordAnswer(questionId, isCorrect, understanding);
  }
  
  // 曖昧ボタンをクリックした時の処理
  const handleAmbiguousClick = (questionId) => {
    // 同じボタンをもう一度クリックしたら閉じる
    if (expandedAmbiguousId === questionId) {
      setExpandedAmbiguousId(null);
    } else {
      setExpandedAmbiguousId(questionId);
    }
  }
  
  // 曖昧な理由を選択した時の処理
  const selectAmbiguousReason = (questionId, reason) => {
    // 曖昧な理由を含めて記録
    recordAnswer(questionId, true, `曖昧△:${reason}`);
    setExpandedAmbiguousId(null); // 選択後は閉じる
  }
  
  return (
    <div className="p-6 w-full sm:w-10/12 md:w-8/12 lg:w-7/12 xl:w-6/12 mx-auto pb-20">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center justify-center">
        <Clock className="w-6 h-6 mr-3 text-indigo-500" />
        <span>今日解く問題</span>
        <span className="ml-3 text-lg bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
          {formatDate(new Date())}
        </span>
      </h2>
      
      {todayQuestions.length === 0 ? (
        <div className="card p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <p className="text-indigo-800 font-medium text-lg">今日解く問題はありません 🎉</p>
          <p className="text-indigo-600 mt-2">おつかれさまでした！</p>
        </div>
      ) : (
        <div className="space-y-8">
          {todayQuestions.map(question => (
            <div key={question.id} className="card p-6">
              {/* 科目情報 */}
              <div className="text-sm text-indigo-600 mb-1 font-medium">{question.subjectName}</div>
              
              {/* 章と問題 */}
              <div className="font-bold text-xl text-gray-800 mb-3">{question.chapterName}</div>
              <div className="inline-block bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-2 rounded-full text-indigo-700 font-medium shadow-sm mb-5 border border-indigo-100">
                問題 {question.id}
              </div>
              
              {/* 解答結果ボタン - 正解/不正解 */}
              <div className="mb-5">
                <div className="text-sm font-bold text-black mb-3 flex items-center">
                  <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  解答結果
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => recordCompleteAnswer(question.id, true, question.understanding)}
                    className="flex-1 py-4 px-4 bg-white border-2 border-green-400 text-green-700 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center font-bold shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" /> 正解 ⭕️
                  </button>
                  <button 
                    onClick={() => recordCompleteAnswer(question.id, false, question.understanding)}
                    className="flex-1 py-4 px-4 bg-white border-2 border-red-400 text-red-700 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center font-bold shadow-sm"
                  >
                    <XCircle className="w-5 h-5 mr-2" /> 不正解 ❌
                  </button>
                </div>
              </div>
              
              {/* 理解度セクション */}
              <div>
                <div className="text-sm font-bold text-black mb-3 flex items-center">
                  <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  理解度
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => recordCompleteAnswer(question.id, true, '理解○')}
                    className="flex-1 py-4 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-lg">理解済み（完全に定着）</span>
                  </button>
                  <button 
                    onClick={() => handleAmbiguousClick(question.id)}
                    className={`flex-1 py-4 ${expandedAmbiguousId === question.id 
                      ? 'bg-gradient-to-br from-yellow-600 to-amber-700 text-white' 
                      : 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white'
                    } rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center`}
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="text-lg">曖昧（記憶の定着に疑問）</span>
                    {expandedAmbiguousId === question.id ? ' 🔼' : ' 🔽'}
                  </button>
                </div>
                
                {/* 曖昧さの理由選択（ドロップダウン） */}
                {expandedAmbiguousId === question.id && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-yellow-300 animate-fadeIn shadow-lg">
                    <div className="bg-gradient-to-r from-yellow-300 to-amber-300 p-4">
                      <div className="text-base font-bold text-black">曖昧だった理由を選択してください:</div>
                    </div>
                    <div className="divide-y divide-yellow-200 bg-white">
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, '偶然正解した')}
                        className="w-full py-5 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
                          <span className="font-bold text-base">偶然正解した</span>
                        </div>
                        <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">2日後</span>
                      </button>
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった')}
                        className="w-full py-5 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
                      >
                        <div className="flex items-center flex-1 mr-2">
                          <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></span>
                          <span className="font-bold text-base">正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった</span>
                        </div>
                        <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full whitespace-nowrap">10日後</span>
                      </button>
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, '合っていたが、別の理由を思い浮かべていた')}
                        className="w-full py-5 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
                          <span className="font-bold text-base">合っていたが、別の理由を思い浮かべていた</span>
                        </div>
                        <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">5日後</span>
                      </button>
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, 'その他')}
                        className="w-full py-5 px-5 text-left hover:bg-yellow-50 transition-all text-black flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
                          <span className="font-bold text-base">その他</span>
                        </div>
                        <span className="text-base font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">20日後</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayView;
