// src/ScheduleView.jsx
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter, // または closestCorners など
  // DragOverlay // ドラッグ中の見た目をカスタマイズする場合
} from '@dnd-kit/core';
import {
    // SortableContext, // 日付内の並び替えなどに使う場合
    // useSortable,
    // arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core'; // DraggableとDroppableを使う

// --- DraggableQuestion コンポーネント ---
// 各問題を表示し、ドラッグ可能にするコンポーネント
function DraggableQuestion({ question }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: question.id, // ドラッグ可能な要素の一意なID
    data: { // ドラッグ時に渡したいデータ
        questionId: question.id,
        originalDate: question.nextDate // 元の日付を保持（必要に応じて）
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1, // ドラッグ中は半透明に
    cursor: 'grab',
    padding: '2px 4px',
    backgroundColor: '#eef2ff', // bg-indigo-50
    color: '#4f46e5', // text-indigo-700
    borderRadius: '4px', // rounded
    fontSize: '0.75rem', // text-xs
    margin: '2px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    border: '1px solid #c7d2fe', // border-indigo-200
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {question.id} {/* とりあえず問題IDだけ表示 */}
    </div>
  );
}

// --- DroppableDateCell コンポーネント ---
// カレンダーの日付セルをドロップ可能なエリアにするコンポーネント
function DroppableDateCell({ date, children }) {
   // date が Date オブジェクトであることを確認し、無効なら null を返す
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.warn("DroppableDateCell received invalid date:", date);
        return <div className="calendar-cell calendar-cell--empty"></div>; // 空のセルやエラー表示
    }

  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD形式を一意なIDとして使用
  const { isOver, setNodeRef } = useDroppable({
    id: dateString, // ドロップ可能なエリアの一意なID
    data: {
        date: date // ドロップ時に日付情報を渡す
    }
  });

  const style = {
    // ドロップ可能なエリアのスタイル（例）
    minHeight: '80px', // ドラッグ＆ドロップしやすいように最低限の高さを確保
    border: isOver ? '2px dashed #4f46e5' : '1px solid #e5e7eb', // ドラッグオーバー時に枠線を表示
    backgroundColor: isOver ? '#eef2ff' : 'white',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    // 元々のカレンダーセルのスタイルに必要なものは追加
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.375rem', // p-1.5
    borderRadius: '0.5rem', // rounded-lg
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children} {/* 日付番号や質問リストなど */}
    </div>
  );
}


// --- ScheduleView 本体 ---
const ScheduleView = ({ subjects, getQuestionsForDate, handleQuestionDateChange, formatDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // ドラッグ中のアイテムを保持（DragOverlayを使う場合）
  // const [activeId, setActiveId] = useState(null);

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  // カレンダーデータ生成ロジック (App.jsから移動 or 再利用)
  const getCalendarData = () => {
    try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        const calendar = [];
        let dayCounter = 1;
        let weekData = [];

        for (let i = 0; i < startDayOfWeek; i++) { weekData.push(null); }
        while (dayCounter <= daysInMonth) {
            const currentDate = new Date(year, month, dayCounter);
             if (isNaN(currentDate.getTime())) {
                 console.error("Invalid date generated in calendar:", year, month, dayCounter);
                 weekData.push(null); // 無効な日付はnullとして扱う
             } else {
                currentDate.setHours(0, 0, 0, 0);
                // getQuestionsForDate を使ってその日の問題を取得
                const questionsForDay = getQuestionsForDate(currentDate);
                weekData.push({ day: dayCounter, date: currentDate, questions: questionsForDay || [] });
             }

            if (weekData.length === 7) { calendar.push(weekData); weekData = []; }
            dayCounter++;
        }
        if (weekData.length > 0) {
            while (weekData.length < 7) { weekData.push(null); }
            calendar.push(weekData);
        }
        return calendar;
    } catch (error) { console.error("カレンダー生成エラー:", error); return []; }
  };

  const calendarWeeks = getCalendarData();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const totalQuestions = subjects.reduce((total, subject) => total + subject.chapters.reduce((chTotal, chapter) => chTotal + chapter.questions.length, 0), 0);

  // ドラッグ＆ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // ドラッグ終了時の処理
  const handleDragEnd = (event) => {
    const { active, over } = event;
    // setActiveId(null); // DragOverlayを使っている場合

    if (over && active.id !== over.id) { // 自分自身の上でなければ
      const questionId = active.id; // ドラッグされた問題のID
      const targetDateString = over.id; // ドロップされた日付セルのID (YYYY-MM-DD)
      const targetDate = new Date(targetDateString); // Dateオブジェクトに変換
       targetDate.setUTCHours(0, 0, 0, 0); // タイムゾーン問題を避けるためUTCに設定

      if (!isNaN(targetDate.getTime())) { // 有効な日付か確認
          // App.jsに渡された関数を呼び出して日付を更新
          handleQuestionDateChange(questionId, targetDate);
      } else {
          console.error("ドロップ先の日付が無効です:", targetDateString);
      }
    }
  };

  // ドラッグ開始時の処理（DragOverlayを使う場合）
  // const handleDragStart = (event) => {
  //   setActiveId(event.active.id);
  // };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // 衝突検出アルゴリズム
      onDragEnd={handleDragEnd}
      // onDragStart={handleDragStart} // DragOverlay使用時
    >
      <div className="p-4 max-w-5xl mx-auto pb-20">
        {/* カレンダーヘッダー (年月ナビゲーション) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            学習スケジュール
          </h2>
          <div className="flex items-center bg-white rounded-full shadow-sm px-2 py-1 mt-2 md:mt-0">
            <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronLeft className="w-5 h-5 text-indigo-600" /> </button>
            <h3 className="text-lg font-bold text-gray-800 mx-2 min-w-[120px] text-center"> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 </h3>
            <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"> <ChevronRight className="w-5 h-5 text-indigo-600" /> </button>
            <div className="ml-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm whitespace-nowrap"> 登録: {totalQuestions}問 </div>
          </div>
        </div>

        {/* カレンダー本体 */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {weekDays.map((day, index) => ( <div key={index} className={`text-center py-1.5 font-bold text-xs sm:text-sm rounded-lg ${ index === 0 ? 'text-red-600 bg-red-50' : index === 6 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 bg-gray-50' }`}> {day} </div> ))}
          </div>
          {/* 日付セル */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
             {calendarWeeks.flat().map((dayData, index) => { // flat()で1次元配列にして処理
                const key = `day-cell-${dayData ? dayData.date.toISOString().split('T')[0] : `empty-${index}`}`;

                if (!dayData || !dayData.date || isNaN(new Date(dayData.date).getTime())) {
                   // dayDataがnull、または日付が無効な場合は空セル
                   return <div key={key} className="aspect-square bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl"></div>;
                }

                const isToday = dayData.date.toDateString() === new Date().toDateString();
                const questionsForThisDay = dayData.questions || [];

                return (
                    // DroppableDateCell で各日付セルをドロップ可能に
                    <DroppableDateCell key={key} date={dayData.date}>
                        {/* 日付表示 */}
                        <div className={`text-right font-bold text-xs sm:text-sm ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                            {dayData.day}
                        </div>
                        {/* 問題リスト表示エリア */}
                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px] flex-grow"> {/* スクロール可能に */}
                            {questionsForThisDay.map(q => (
                                // DraggableQuestion で各問題をドラッグ可能に
                                <DraggableQuestion key={q.id} question={q} />
                            ))}
                        </div>
                    </DroppableDateCell>
                );
             })}
           </div>
        </div>
      </div>
      {/* DragOverlay: ドラッグ中の要素の見た目をカスタマイズする場合 */}
      {/* <DragOverlay>
        {activeId ? <DraggableQuestion question={{id: activeId}} /> : null}
      </DragOverlay> */}
    </DndContext>
  );
};

// Appコンポーネントは変更なし (ただしScheduleViewの定義は削除)
function App() {
    // ... (useState, useEffect, その他の関数定義は変更なし) ...
     const [subjects, setSubjects] = useState([]);
    const [activeTab, setActiveTab] = useState('today');
    const [expandedSubjects, setExpandedSubjects] = useState({});
    const [expandedChapters, setExpandedChapters] = useState({});
    // selectedDate は ScheduleView で管理するため削除
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [bulkEditMode, setBulkEditMode] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    useEffect(() => { /* ... データロード ... */
         const savedData = localStorage.getItem('studyData');
        let dataToSet;
        if (savedData) {
        try {
            dataToSet = JSON.parse(savedData);
            // Dateオブジェクトを復元
            dataToSet.forEach(subject => {
                subject.chapters.forEach(chapter => {
                    chapter.questions.forEach(q => {
                        if (q.lastAnswered) q.lastAnswered = new Date(q.lastAnswered);
                        if (q.nextDate) q.nextDate = new Date(q.nextDate);
                    });
                });
            });
            console.log('保存された学習データを読み込みました');
        } catch (e) {
            console.error('保存データの読み込みに失敗:', e);
            dataToSet = generateInitialData();
            console.log('初期データを生成しました');
        }
        } else {
        dataToSet = generateInitialData();
        console.log('初期データを生成しました');
        }
        setSubjects(dataToSet);
        const initialExpandedSubjects = {};
        dataToSet.forEach(subject => {
        initialExpandedSubjects[subject.id] = false;
        });
        if (dataToSet.length > 0) {
            initialExpandedSubjects[dataToSet[0].id] = true;
        }
        setExpandedSubjects(initialExpandedSubjects);
    }, []);

    useEffect(() => { /* ... データ保存 ... */
         if (subjects.length > 0) {
        // DateオブジェクトをISO 8601 文字列に変換して保存
        const dataToSave = JSON.stringify(subjects, (key, value) => {
            // lastAnswered と nextDate プロパティをチェック
            if ((key === 'lastAnswered' || key === 'nextDate') && value instanceof Date) {
                return value.toISOString(); // ISO文字列に変換
            }
            return value;
        });
        localStorage.setItem('studyData', dataToSave);
        console.log('学習データを保存しました');
        }
    }, [subjects]);

    const getTodayQuestions = () => { /* ... */ };
    const getQuestionsForDate = (date) => { /* ... */ };
    const toggleSubject = (subjectId) => { /* ... */ };
    const toggleChapter = (chapterId) => { /* ... */ };
    const recordAnswer = (questionId, isCorrect, understanding) => { /* ... (修正済みロジック) ... */ };
    const saveQuestionEdit = (questionData) => { /* ... */ };
    const saveBulkEdit = (date) => { /* ... */ };
    const toggleQuestionSelection = (questionId) => { /* ... */ };
    const formatDate = (date) => { /* ... */ };

     // ***追加: ドラッグ&ドロップによる日付更新関数***
    const handleQuestionDateChange = (questionId, newDate) => {
        setSubjects(prevSubjects => {
        const targetDate = new Date(newDate);
        if (isNaN(targetDate.getTime())) {
            console.error("無効なドロップ先の日付:", newDate);
            return prevSubjects; // 無効な日付なら状態を変更しない
        }
        targetDate.setHours(0, 0, 0, 0);
        const targetDateString = targetDate.toISOString();

        // 不変性を保ちながら状態を更新
        const newSubjects = prevSubjects.map(subject => ({
            ...subject,
            chapters: subject.chapters.map(chapter => ({
            ...chapter,
            questions: chapter.questions.map(q => {
                if (q.id === questionId) {
                console.log(`問題 ${questionId} の日付を ${formatDate(targetDate)} に変更`);
                return { ...q, nextDate: targetDateString }; // 日付のみ更新
                }
                return q;
            })
            }))
        }));
        return newSubjects;
        });
    };


    // MainView (ScheduleView呼び出しを修正)
    const MainView = () => {
        switch (activeTab) {
        case 'today':
            return <TodayView
            getTodayQuestions={getTodayQuestions}
            recordAnswer={recordAnswer}
            formatDate={formatDate}
            />;
        case 'schedule':
            // ***変更点: props を渡して外部コンポーネントを呼び出す***
            return <ScheduleView
                    subjects={subjects}
                    getQuestionsForDate={getQuestionsForDate}
                    handleQuestionDateChange={handleQuestionDateChange}
                    formatDate={formatDate}
                 />;
        case 'all':
            return <RedesignedAllQuestionsView
                subjects={subjects}
                expandedSubjects={expandedSubjects}
                expandedChapters={expandedChapters}
                toggleSubject={toggleSubject}
                toggleChapter={toggleChapter}
                setEditingQuestion={setEditingQuestion}
                setBulkEditMode={setBulkEditMode}
                bulkEditMode={bulkEditMode}
                selectedQuestions={selectedQuestions}
                setSelectedQuestions={setSelectedQuestions}
                saveBulkEdit={saveBulkEdit}
                formatDate={formatDate}
                toggleQuestionSelection={toggleQuestionSelection}
            />;
        case 'trends':
            return <AmbiguousTrendsPage subjects={subjects} formatDate={formatDate} />;
        default:
            return <TodayView
                getTodayQuestions={getTodayQuestions}
                recordAnswer={recordAnswer}
                formatDate={formatDate}
            />;
        }
    };

    // App return (変更なし)
    return (
         <div className="min-h-screen bg-gray-50">
            <TopNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            <div>
                <div className="bg-indigo-600 p-4 sm:p-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">学習スケジュール管理</h1>
                    <p className="text-xs text-indigo-100 opacity-90 mt-1">暗記曲線に基づく効率的な学習を実現</p>
                </div>
                </div>
                <div className="p-0 sm:p-4">
                <MainView />
                {editingQuestion && (
                    <QuestionEditModal
                    question={editingQuestion}
                    onSave={saveQuestionEdit}
                    onCancel={() => setEditingQuestion(null)}
                    formatDate={formatDate}
                    />
                )}
                </div>
            </div>
            <div id="notification-area" className="fixed bottom-4 right-4 z-30"></div>
         </div>
    );
}

export default App;
