// TodayView.jsx
// カスタムCSSクラスを使用するように className を変更

import React, { useState } from 'react';
// lucide-react からアイコンをインポート
import { Check, X, AlertTriangle, ChevronsUpDown } from 'lucide-react';

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

  // --- JSX 部分: カスタムCSSクラスを使用 ---
  return (
    <div className="today-container">
      {/* ページタイトル */}
      <h2 className="today-title-container">
        <span>今日解く問題</span>
        <span className="today-date-badge">
          {formatDate(new Date())}
        </span>
      </h2>

      {todayQuestions.length === 0 ? (
        <div className="today-empty-card">
          <p>今日解く問題はありません 🎉</p>
          <p>素晴らしい！ゆっくり休んでください。</p>
        </div>
      ) : (
        // 問題リスト
        <div className="today-list">
          {todayQuestions.map(question => {
            const questionState = getQuestionState(question.id);
            const isAmbiguousPanelOpen = expandedAmbiguousId === question.id;

            return (
              // 問題カード
              <div key={question.id} className="today-card">
                <div className="today-card__content">
                  {/* 問題情報 */}
                  <div className="today-card__subject">{question.subjectName}</div>
                  <div className="today-card__chapter">{question.chapterName}</div>
                  <div className="today-card__qid-badge">
                    問題 {question.id}
                  </div>

                  {/* --- 正誤ボタンエリア --- */}
                  {!questionState.showComprehension && (
                    <div>
                      <div className="today-section-label">解答結果</div>
                      <div className="today-button-grid">
                        <button
                          onClick={() => handleAnswerClick(question.id, true)}
                          className="today-button today-button--correct"
                        >
                          <Check /> 正解
                        </button>
                        <button
                          onClick={() => handleAnswerClick(question.id, false)}
                          className="today-button today-button--incorrect"
                        >
                          <X /> 不正解
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- 理解度ボタンエリア --- */}
                  {questionState.showComprehension && (
                    <div>
                      <div className="today-section-label">理解度を選択</div>
                      <div className="today-button-grid">
                        <button
                          onClick={() => handleUnderstandClick(question.id)}
                          className="today-button today-button--understood"
                        >
                          <Check /> 理解済み
                        </button>
                        <button
                          onClick={() => handleAmbiguousClick(question.id)}
                          // パネルが開いているかでクラスを切り替える例 (CSS側で .open を定義しても良い)
                          className={`today-button today-button--ambiguous ${isAmbiguousPanelOpen ? 'open' : ''}`}
                        >
                          <div style={{display: 'flex', alignItems: 'center'}}> {/* Flexbox for icon+text */}
                            <AlertTriangle/>
                            <span>曖昧</span>
                          </div>
                           {/* アイコンのクラス名をCSSで定義したクラスに変更 */}
                          <ChevronsUpDown className="today-button__dropdown-icon" />
                        </button>
                      </div>
                    </div>
                  )}
                </div> {/* End of card content */}

                {/* --- 曖昧理由選択パネル --- */}
                {isAmbiguousPanelOpen && (
                  <div className="reason-panel-container">
                     <div className="reason-panel">
                       <div className="reason-panel__header">
                         <div className="reason-panel__title">曖昧だった理由を選択してください:</div>
                       </div>
                       <div className="reason-panel__options">
                         {ambiguousReasons.map((reason, index) => (
                           <button
                             key={index}
                             onClick={() => selectAmbiguousReason(question.id, reason)}
                             className="reason-option"
                           >
                             <div className="reason-option__content">
                               <span className="reason-option__dot"></span>
                               <span className="reason-option__text">{reason}</span>
                             </div>
                             <span className="reason-option__badge">8日後</span>
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
