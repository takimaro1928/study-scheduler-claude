// AmbiguousTrendsPage.js
import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, Info } from 'lucide-react';

// 曖昧問題傾向表示ページ
const AmbiguousTrendsPage = ({ subjects }) => {
  // 理由と科目によるフィルタリング状態
  const [filter, setFilter] = useState({
    reason: 'all',
    subject: 'all',
    period: 'all',
  });
  
  // ソート状態
  const [sort, setSort] = useState({
    by: 'date',
    order: 'desc',
  });
  
  // フィルターパネルの表示/非表示
  const [showFilters, setShowFilters] = useState(false);
  
  // 各理由ごとの展開/折りたたみ状態
  const [expandedReasons, setExpandedReasons] = useState({});
  
  // 各科目ごとの展開/折りたたみ状態
  const [expandedSubjects, setExpandedSubjects] = useState({});
  
  // 曖昧な問題データを取得
  const ambiguousQuestions = getAmbiguousQuestions(subjects);
  
  // 自動更新用のuseEffect（シンプル版）
  useEffect(() => {
    console.log("曖昧問題データが更新されました - subjects変更検知");
    // subjects が変更されるたびにコンポーネントが再レンダリングされ、
    // ambiguousQuestions = getAmbiguousQuestions(subjects) が再実行されるため
    // 特別な処理は必要ありません
  }, [subjects]);
  
  // 理由別にグループ化
  const reasonGroups = groupByReason(ambiguousQuestions);
  
  // 理由を切り替える
  const toggleReason = (reason) => {
    setExpandedReasons(prev => ({
      ...prev,
      [reason]: !prev[reason]
    }));
  };
  
  // 理由内の科目を切り替える
  const toggleSubject = (reason, subject) => {
    const key = `${reason}-${subject}`;
    setExpandedSubjects(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // 曖昧な問題を抽出する関数
  function getAmbiguousQuestions(subjects) {
    const ambiguousQuestions = [];
    
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        chapter.questions.forEach(question => {
          // 曖昧△を含む問題を抽出
          if (question.understanding && question.understanding.startsWith('曖昧△')) {
            // 理由を抽出
            let reason = '理由なし';
            if (question.understanding.includes(':')) {
              reason = question.understanding.split(':')[1];
            }
            
            ambiguousQuestions.push({
              id: question.id,
              subjectId: subject.id,
              subjectName: subject.name,
              chapterId: chapter.id,
              chapterName: chapter.name,
              reason: reason,
              correctRate: question.correctRate,
              lastAnswered: question.lastAnswered,
              nextDate: question.nextDate,
              answerCount: question.answerCount,
            });
          }
        });
      });
    });
    
    return ambiguousQuestions;
  }
  
  // 理由ごとにグループ化する関数
  function groupByReason(questions) {
    const groups = {};
    
    // 主な曖昧理由を定義
    const mainReasons = [
      '偶然正解した',
      '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった',
      '合っていたが、別の理由を思い浮かべていた',
      'その他'
    ];
    
    // 各理由ごとにグループを初期化
    mainReasons.forEach(reason => {
      groups[reason] = {
        questions: [],
        subjects: {}
      };
    });
    
    // その他の理由をキャッチするグループ
    groups['その他の理由'] = {
      questions: [],
      subjects: {}
    };
    
    // 各問題を適切なグループに振り分け
    questions.forEach(question => {
      // 理由を標準化（表記揺れを吸収）
      let standardReason = question.reason;

      if (question.reason.includes('偶然正解')) {
        standardReason = '偶然正解した';
      } else if (question.reason.includes('他の選択肢の意味') || question.reason.includes('選択肢')) {
        standardReason = '正解の選択肢は理解していたが、他の選択肢の意味が分かっていなかった';
      } else if (question.reason.includes('別の理由') || question.reason.includes('思い浮かべ')) {
        standardReason = '合っていたが、別の理由を思い浮かべていた';
      } else if (!mainReasons.includes(question.reason)) {
        standardReason = 'その他';
      }
      
      // 理由が主要理由に含まれるか確認
      const targetGroup = mainReasons.includes(standardReason) ? 
        standardReason : 'その他の理由';
      
      // グループに問題を追加
      groups[targetGroup].questions.push({...question, reason: standardReason});
      
      // 科目別のサブグループに追加
      if (!groups[targetGroup].subjects[question.subjectName]) {
        groups[targetGroup].subjects[question.subjectName] = [];
      }
      groups[targetGroup].subjects[question.subjectName].push({...question, reason: standardReason});
    });
    
    // 質問がない理由グループを削除
    Object.keys(groups).forEach(reason => {
      if (groups[reason].questions.length === 0) {
        delete groups[reason];
      }
    });
    
    return groups;
  }

  // フィルタリングとソートを適用した問題リストを取得
  function getFilteredAndSortedQuestions(questions) {
    // フィルターを適用
    let filtered = [...questions];
    
    if (filter.subject !== 'all') {
      filtered = filtered.filter(q => q.subjectName === filter.subject);
    }
    
    if (filter.period !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filter.period) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(q => new Date(q.lastAnswered) >= cutoffDate);
    }
    
    // ソートを適用
    filtered.sort((a, b) => {
      switch (sort.by) {
        case 'date':
          return sort.order === 'desc' ?
            new Date(b.lastAnswered) - new Date(a.lastAnswered) :
            new Date(a.lastAnswered) - new Date(b.lastAnswered);
        case 'correctRate':
          return sort.order === 'desc' ?
            b.correctRate - a.correctRate :
            a.correctRate - b.correctRate;
        case 'id':
          return sort.order === 'desc' ?
            b.id.localeCompare(a.id) :
            a.id.localeCompare(b.id);
        default:
          return 0;
      }
    });
    
    return filtered;
  }
  
  // 日付のフォーマット
  function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  }
  
  // 全ての科目名の配列を作成
  const allSubjects = [...new Set(ambiguousQuestions.map(q => q.subjectName))];
  
  // 理由ごとの問題数を取得
  const getQuestionCountByReason = (reason) => {
    return reasonGroups[reason].questions.length;
  };
  
  // 科目ごとの問題数を取得
  const getQuestionCountBySubject = (reason, subject) => {
    return reasonGroups[reason].subjects[subject].length;
  };
  
  // 各理由のコードカラー
  const reasonColors = {
    '他の選択肢の意味がわからなかった': 'bg-purple-100 border-purple-300 text-purple-800',
    'たまたま当ててしまった': 'bg-green-100 border-green-300 text-green-800',
    '合っていたけど違う答えを思い浮かべてた': 'bg-blue-100 border-blue-300 text-blue-800',
    'その他': 'bg-gray-100 border-gray-300 text-gray-800',
    'その他の理由': 'bg-orange-100 border-orange-300 text-orange-800',
  };
  
  // ページのロード時に最初の理由を展開
  useEffect(() => {
    if (Object.keys(reasonGroups).length > 0) {
      const firstReason = Object.keys(reasonGroups)[0];
      setExpandedReasons({ [firstReason]: true });
      
      // 最初の理由の中の最初の科目も展開
      const firstSubject = Object.keys(reasonGroups[firstReason].subjects)[0];
      if (firstSubject) {
        setExpandedSubjects({ [`${firstReason}-${firstSubject}`]: true });
      }
    }
  }, []);
  
  return (
    <div className="p-4 max-w-5xl mx-auto pb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Info className="w-5 h-5 mr-2 text-indigo-500" />
        曖昧問題傾向分析
      </h2>
      
      {/* フィルターボタン */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Filter className="w-4 h-4 mr-2" />
          フィルター・並べ替え
          {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </button>
        
        {/* フィルターパネル */}
        {showFilters && (
          <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 科目フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                <select
                  value={filter.subject}
                  onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">全ての科目</option>
                  {allSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              {/* 期間フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
                <select
                  value={filter.period}
                  onChange={(e) => setFilter({ ...filter, period: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">全期間</option>
                  <option value="week">直近1週間</option>
                  <option value="month">直近1ヶ月</option>
                  <option value="quarter">直近3ヶ月</option>
                </select>
              </div>
              
              {/* ソート */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">並べ替え</label>
                <div className="flex gap-2">
                  <select
                    value={sort.by}
                    onChange={(e) => setSort({ ...sort, by: e.target.value })}
                    className="flex-grow p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="date">解答日</option>
                    <option value="correctRate">正答率</option>
                    <option value="id">問題ID</option>
                  </select>
                  <select
                    value={sort.order}
                    onChange={(e) => setSort({ ...sort, order: e.target.value })}
                    className="w-24 p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="desc">降順</option>
                    <option value="asc">昇順</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 理由ごとのグループ表示 */}
      {Object.keys(reasonGroups).length > 0 ? (
        <div className="space-y-4">
          {Object.keys(reasonGroups).map(reason => (
            <div key={reason} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* 理由ヘッダー */}
              <div 
                className={`p-4 cursor-pointer flex justify-between items-center ${reasonColors[reason] || 'bg-gray-100 border-gray-300'}`}
                onClick={() => toggleReason(reason)}
              >
                <div>
                  <h3 className="font-bold">
                    {reason}
                  </h3>
                  <p className="text-sm mt-1">
                    {getQuestionCountByReason(reason)}問
                  </p>
                </div>
                <div className={`transition-transform duration-200 ${expandedReasons[reason] ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
              
              {/* 理由内容（展開時） */}
              {expandedReasons[reason] && (
                <div className="p-4">
                  {/* 科目ごとのサブグループ */}
                  <div className="space-y-3">
                    {Object.keys(reasonGroups[reason].subjects).map(subject => (
                      <div key={subject} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* 科目ヘッダー */}
                        <div 
                          className="bg-gray-50 p-3 cursor-pointer flex justify-between items-center"
                          onClick={() => toggleSubject(reason, subject)}
                        >
                          <div className="font-medium text-gray-700">{subject}</div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">
                              {getQuestionCountBySubject(reason, subject)}問
                            </span>
                            <div className={`transition-transform duration-200 ${expandedSubjects[`${reason}-${subject}`] ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            </div>
                          </div>
                        </div>
                        
                        {/* 科目内の問題一覧 */}
                        {expandedSubjects[`${reason}-${subject}`] && (
                          <div className="p-3">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">問題ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">章</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">正答率</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">解答回数</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終解答日</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次回予定日</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {getFilteredAndSortedQuestions(reasonGroups[reason].subjects[subject]).map(question => (
                                    <tr key={question.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{question.id}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{question.chapterName}</td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                          <div 
                                            className={`h-2.5 rounded-full ${
                                              question.correctRate >= 80 ? 'bg-green-500' :
                                              question.correctRate >= 60 ? 'bg-lime-500' :
                                              question.correctRate >= 40 ? 'bg-yellow-500' :
                                              question.correctRate >= 20 ? 'bg-orange-500' :
                                              'bg-red-500'
                                            }`}
                                            style={{ width: `${question.correctRate}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1 block">{question.correctRate}%</span>
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{question.answerCount}回</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(question.lastAnswered)}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(question.nextDate)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">曖昧と評価された問題がありません</p>
          <p className="text-sm text-gray-400 mt-2">問題を解いて「曖昧△」評価をつけると、ここに表示されます</p>
        </div>
      )}
    </div>
  );
};

export default AmbiguousTrendsPage;
