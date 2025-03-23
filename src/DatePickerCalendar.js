// DatePickerCalendar.js
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

// カレンダーコンポーネント
const DatePickerCalendar = ({ selectedDate, onChange, onClose }) => {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate || new Date());
  
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
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
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
  
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-72 overflow-hidden">
      {/* ヘッダー部分 */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3">
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={() => changeYear(-1)}
            className="text-white hover:bg-indigo-700 rounded-full w-7 h-7 flex items-center justify-center"
          >
            <span className="text-lg">«</span>
          </button>
          
          <div className="font-bold text-white">
            {getJapaneseEraYear(viewDate)}
          </div>
          
          <button 
            onClick={() => changeYear(1)}
            className="text-white hover:bg-indigo-700 rounded-full w-7 h-7 flex items-center justify-center"
          >
            <span className="text-lg">»</span>
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => changeMonth(-1)}
            className="text-white hover:bg-indigo-700 rounded-full w-7 h-7 flex items-center justify-center"
          >
            <span>‹</span>
          </button>
          
          <div className="font-bold text-lg">{getJapaneseMonthName(viewDate)}</div>
          
          <button 
            onClick={() => changeMonth(1)}
            className="text-white hover:bg-indigo-700 rounded-full w-7 h-7 flex items-center justify-center"
          >
            <span>›</span>
          </button>
        </div>
      </div>
      
      {/* カレンダー本体 */}
      <div className="p-2">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`text-center text-xs font-medium py-1 ${
                index === 0 ? 'text-red-600' : 
                index === 6 ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {calendar.map((dateObj, index) => {
            const { day, date, isPrevMonth, isNextMonth } = dateObj;
            const _isToday = isToday(date);
            const _isSelected = isSelected(date);
            
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`
                  w-9 h-9 flex items-center justify-center text-sm rounded-full
                  ${isPrevMonth || isNextMonth ? 'text-gray-400' : 'text-gray-700'}
                  ${_isToday && !_isSelected ? 'border border-indigo-500' : ''}
                  ${_isSelected ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100'}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* フッター部分 */}
      <div className="border-t border-gray-200 p-2 flex justify-between items-center bg-gray-50">
        <button
          onClick={handleClearClick}
          className="text-red-600 text-sm hover:underline font-medium"
        >
          削除
        </button>
        
        <button
          onClick={handleTodayClick}
          className="text-indigo-600 text-sm hover:underline font-medium"
        >
          今日
        </button>
      </div>
    </div>
  );
};

export default DatePickerCalendar;
