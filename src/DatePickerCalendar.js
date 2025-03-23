// DatePickerCalendar.js
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// カレンダーコンポーネント
const DatePickerCalendar = ({ selectedDate, onChange, onClose }) => {
  // 初期表示する日付
  const initialDate = selectedDate || new Date();
  const [viewDate, setViewDate] = useState(initialDate);
  const [localSelectedDate, setLocalSelectedDate] = useState(initialDate);
  
  // 選択日が変更された時に同期する
  useEffect(() => {
    if (selectedDate) {
      setLocalSelectedDate(selectedDate);
    }
  }, [selectedDate]);
  
  // 月を変更する関数
  const changeMonth = (offset) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + offset);
    setViewDate(newDate);
  };
  
  // 年を変更する関数
  const changeYear = (offset) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(viewDate.getFullYear() + offset);
    setViewDate(newDate);
  };
  
  // カレンダーデータを生成
  const generateCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // 月の最初と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 先月の日を取得（前月の空白を埋めるため）
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const firstWeekday = firstDay.getDay(); // 0=日曜日
    
    const daysInMonth = lastDay.getDate();
    const calendar = [];
    
    // 先月の日を追加
    const prevMonthDays = [];
    for (let i = 0; i < firstWeekday; i++) {
      const day = prevMonthLastDay - firstWeekday + i + 1;
      const date = new Date(year, month - 1, day);
      prevMonthDays.push({ day, date, isPrevMonth: true });
    }
    
    // 今月の日を追加
    const currentMonthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      currentMonthDays.push({ day, date, isCurrentMonth: true });
    }
    
    // 来月の日を追加（次月の空白を埋めるため）
    const nextMonthDays = [];
    const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      nextMonthDays.push({ day, date, isNextMonth: true });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const calendar = generateCalendar();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  
  // カレンダーを週ごとに分割
  const weeks = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }
  
  // 日付が今日かどうかチェック
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // 日付が選択されているかチェック
  const isSelected = (date) => {
    return localSelectedDate && 
           date.getDate() === localSelectedDate.getDate() && 
           date.getMonth() === localSelectedDate.getMonth() && 
           date.getFullYear() === localSelectedDate.getFullYear();
  };
  
  // 各週の月を取得
  const getMonthForWeek = (week) => {
    // 週の中央（水曜日）の日付の月を返す
    const midWeekDate = week[3]?.date;
    if (!midWeekDate) return '';
    return `${midWeekDate.getMonth() + 1}月`;
  };
  
  // 日付選択ハンドラー
  const handleDateSelect = (date) => {
    setLocalSelectedDate(date);
    onChange && onChange(date);
  };
  
  // 「今日」ボタンのハンドラー
  const handleTodayClick = () => {
    const today = new Date();
    setViewDate(today);
    setLocalSelectedDate(today);
    onChange && onChange(today);
  };
  
  // 「削除」ボタンのハンドラー
  const handleClearClick = () => {
    setLocalSelectedDate(null);
    onChange && onChange(null);
  };
  
  // 日本語の月名
  const getJapaneseMonthName = (date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };
  
  // 和暦の年号を取得
  const getJapaneseEraYear = (date) => {
    const year = date.getFullYear();
    if (year >= 2019) return `令和${year - 2018}年`;
    if (year >= 1989) return `平成${year - 1988}年`;
    if (year >= 1926) return `昭和${year - 1925}年`;
    if (year >= 1912) return `大正${year - 1911}年`;
    return `明治${year - 1867}年`;
  };
  
  // 現在表示している月を取得
  const currentMonthName = `${viewDate.getFullYear()}年${viewDate.getMonth() + 1}月`;
  
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 overflow-hidden">
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4">
        <div className="flex justify-between items-center mb-3">
          <button 
            onClick={() => changeYear(-1)}
            className="text-white hover:bg-indigo-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <span className="text-lg font-bold">«</span>
          </button>
          
          <div className="font-bold text-lg">
            {getJapaneseEraYear(viewDate)}
          </div>
          
          <button 
            onClick={() => changeYear(1)}
            className="text-white hover:bg-indigo-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <span className="text-lg font-bold">»</span>
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => changeMonth(-1)}
            className="text-white hover:bg-indigo-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="font-bold text-xl">{currentMonthName}</div>
          
          <button 
            onClick={() => changeMonth(1)}
            className="text-white hover:bg-indigo-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* カレンダー本体 */}
      <div className="p-3">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`text-center py-2 text-sm font-medium rounded ${
                index === 0 ? 'text-red-600 bg-red-50' : 
                index === 6 ? 'text-blue-600 bg-blue-50' : 
                'text-gray-700 bg-gray-50'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 月インジケーター - 曜日の下に表示 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((_, index) => (
            <div key={index} className="text-center py-1 text-xs font-medium text-gray-500">
              {index === 3 && `${viewDate.getMonth() + 1}月`}
            </div>
          ))}
        </div>
        
        {/* 週ごとに日付を表示 */}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {/* 週の最初の日が新しい月の場合、月表示を追加 */}
            {weekIndex > 0 && week[0].date.getDate() <= 7 && week[0].date.getMonth() !== weeks[weekIndex-1][0].date.getMonth() && (
              <div className="grid grid-cols-7 gap-1 my-1">
                <div className="col-span-7 text-center py-1 text-xs font-medium bg-gray-100 rounded text-gray-600">
                  {`${week[0].date.getMonth() + 1}月`}
                </div>
              </div>
            )}
            
            {/* 日付行 */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {week.map((dateObj, index) => {
                const { day, date, isPrevMonth, isNextMonth } = dateObj;
                const _isToday = isToday(date);
                const _isSelected = isSelected(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      h-10 flex items-center justify-center text-sm rounded
                      ${isPrevMonth || isNextMonth ? 'text-gray-400 hover:bg-gray-50' : 'text-gray-800 hover:bg-gray-100'}
                      ${_isToday && !_isSelected ? 'border border-indigo-500' : ''}
                      ${_isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                      transition-colors
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
      
      {/* フッター部分 */}
      <div className="border-t border-gray-200 p-3 flex justify-between items-center bg-gray-50">
        <button
          onClick={handleClearClick}
          className="px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm font-medium transition-colors"
        >
          削除
        </button>
        
        <button
          onClick={handleTodayClick}
          className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm font-medium transition-colors"
        >
          今日
        </button>
      </div>
    </div>
  );
};

export default DatePickerCalendar;
