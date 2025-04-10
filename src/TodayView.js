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
  const [questionStates, setQuestionStates] = useState({});
  
  const recordCompleteAnswer = (questionId, isCorrect, understanding) => {
    recordAnswer(questionId, isCorrect, understanding);
    if (!isCorrect) {
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { 
          showAnswered: false,
          showComprehension: false
        }
      }));
    }
  };
  
  const handleAnswerClick = (questionId, isCorrect) => {
    if (isCorrect) {
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { 
          showAnswered: true,
          showComprehension: true,
          opacity: 1
        }
      }));
    } else {
      recordCompleteAnswer(questionId, false, '理解できていない×');
    }
  };
  
  const handleAmbiguousClick = (questionId) => {
    if (expandedAmbiguousId === questionId) {
      setExpandedAmbiguousId(null);
    } else {
      setExpandedAmbiguousId(questionId);
    }
  };
  
  const selectAmbiguousReason = (questionId, reason) => {
    recordAnswer(questionId, true, `曖昧△:${reason}`);
    setExpandedAmbiguousId(null);
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: { 
        showAnswered: false,
        showComprehension: false
      }
    }));
  };
  
  const handleUnderstandClick = (questionId) => {
    recordCompleteAnswer(questionId, true, '理解○');
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: { 
        showAnswered: false,
        showComprehension: false
      }
    }));
  };
  
  const getQuestionState = (questionId) => {
    return questionStates[questionId] || { 
      showAnswered: false,
      showComprehension: false
    };
  };
  
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
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            
            return (
              <div key={question.id} className="card p-6">
                <div className="text-sm text-indigo-600 mb-1 font-medium">{question.subjectName}</div>
                <div className="font-bold text-xl text-gray-800 mb-3">{question.chapterName}</div>
                <div className="inline-block bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-2 rounded-full text-indigo-700 font-medium shadow-sm mb-5 border border-indigo-100">
                  問題 {question.id}
                </div>
                
                {!questionState.showAnswered && (
                  <div className="mb-5">
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      解答結果
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleAnswerClick(question.id, true)}
                        className="flex-1 py-4 px-4 bg-white border-2 border-green-400 text-green-700 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center font-bold shadow-sm"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" /> 正解 ⭕️
                      </button>
                      <button 
                        onClick={() => handleAnswerClick(question.id, false)}
                        className="flex-1 py-4 px-4 bg-white border-2 border-red-400 text-red-700 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center font-bold shadow-sm"
                      >
                        <XCircle className="w-5 h-5 mr-2" /> 不正解 ❌
                      </button>
                    </div>
                  </div>
                )}
                
                {questionState.showComprehension && (
                  <div className="mb-5 animate-fadeIn" style={{ opacity: 1 }}>
                    <div className="text-sm font-bold text-black mb-3 flex items-center">
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      理解度を選択してください
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleUnderstandClick(question.id)}
                        className="flex-1 py-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                        style={{ opacity: 1 }}
                      >
                        <CheckCircle className="w-5 h-5 mr-2 text-black" />
                        <span className="text-lg font-bold" style={{
                          color: 'black', 
                          opacity: 1,
                          textShadow: '0 1px 3px rgba(255,255,255,0.5)'
                        }}>理解済み（完全に定着）</span>
                      </button>
                      <button 
                        onClick={() => handleAmbiguousClick(question.id)}
                        className={`flex-1 py-4 ${
                          expandedAmbiguousId === question.id 
                            ? 'bg-gradient-to-br from-amber-500 to-yellow-600' 
                            : 'bg-gradient-to-br from-amber-400 to-yellow-500'
                        } rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center`}
                        style={{ opacity: 1 }}
                      >
                        <AlertTriangle className="w-5 h-5 mr-2 text-black" />
                        <span className="text-lg font-bold" style={{
                          color: 'black', 
                          opacity: 1,
                          textShadow: '0 1px 3px rgba(255,255,255,0.5)'
                        }}>曖昧（記憶の定着に疑問）</span>
                        {expandedAmbiguousId === question.id ? ' 🔼' : ' 🔽'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 曖昧さの理由選択（ドロップダウン） */}
                {expandedAmbiguousId === question.id && (
                  <div className="reason-panel">
                    <div className="reason-panel-header">
                      <div className="reason-panel-title">曖昧だった理由を選択してください:</div>
                    </div>
                    <div className="divide-y divide-yellow-200 bg-white">
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, '偶然正解した')}
                        className="reason-option"
                      >
                        <div className="reason-text">
                          <span className="reason-dot"></span>
                          <span>偶然正解した</span>
                        </div>
                        <span className="day-badge">8日後</span>
                      </button>
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった')}
                        className="reason-option"
                      >
                        <div className="reason-text flex-1 mr-2">
                          <span className="reason-dot"></span>
                          <span>正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった</span>
                        </div>
                        <span className="day-badge">8日後</span>
                      </button>
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, '合っていたが、別の理由を思い浮かべていた')}
                        className="reason-option"
                      >
                        <div className="reason-text">
                          <span className="reason-dot"></span>
                          <span>合っていたが、別の理由を思い浮かべていた</span>
                        </div>
                        <span className="day-badge">8日後</span>
                      </button>
                      {/* 新しい選択肢1を追加 */}
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, '自信はなかったけど、これかなとは思っていた')}
                        className="reason-option"
                      >
                        <div className="reason-text">
                          <span className="reason-dot"></span>
                          <span>自信はなかったけど、これかなとは思っていた</span>
                        </div>
                        <span className="day-badge">8日後</span>
                      </button>
                      {/* 新しい選択肢2を追加 */}
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, '問題を覚えてしまっていた')}
                        className="reason-option"
                      >
                        <div className="reason-text">
                          <span className="reason-dot"></span>
                          <span>問題を覚えてしまっていた</span>
                        </div>
                        <span className="day-badge">8日後</span>
                      </button>
                      <button 
                        onClick={() => selectAmbiguousReason(question.id, 'その他')}
                        className="reason-option"
                      >
                        <div className="reason-text">
                          <span className="reason-dot"></span>
                          <span>その他</span>
                        </div>
                        <span className="day-badge">8日後</span>
                      </button>
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
