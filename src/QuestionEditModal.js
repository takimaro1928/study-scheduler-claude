// QuestionEditModal.js
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, Save, ArrowLeft } from 'lucide-react';

// 問題編集モーダルコンポーネント
const QuestionEditModal = ({ question, onSave, onCancel }) => {
  const [editData, setEditData] = useState({ ...question });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  
  // 日付のフォーマット (YYYY-MM-DD)
  const formatDateInput = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };
  
  // 日付のフォーマット (YYYY/MM/DD)
  const formatDateDisplay = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };
  
  // 日付のフォーマット (日本語)
  const formatDateJP = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };
  
  // 次回日付の変更ハンドラー
  const handleDateChange = (e) => {
    setEditData({
      ...editData,
      nextDate: new Date(e.target.value)
    });
  };
  
  // 間隔の変更ハンドラー
  const handleIntervalChange = (e) => {
    setEditData({
      ...editData,
      interval: e.target.value
    });
  };
  
  // 理解度の変更ハンドラー
  const handleUnderstandingChange = (e) => {
    setEditData({
      ...editData,
      understanding: e.target.value
    });
  };
  
  // 正解率の変更ハンドラー
  const handleCorrectRateChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    
    setEditData({
      ...editData,
      correctRate: value
    });
  };
  
  // カレンダーを開く/閉じる
  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };
  
  // カレンダーの外側をクリックしたときに閉じる
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);
  
  // 保存ボタンのハンドラー
  const handleSave = () => {
    onSave(editData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl relative">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-4 rounded-t-xl text-white flex justify-between items-center">
          <h3 className="text-lg font-bold">問題編集</h3>
          <button 
            onClick={onCancel}
            className="text-white hover:bg-indigo-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 問題情報 */}
        <div className="p-6 space-y-6">
          {/* 問題ID (読み取り専用) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              問題ID
            </label>
            <div className="bg-gray-100 p-3 rounded-lg text-gray-800 font-medium border border-gray-200">
              {editData.id}
            </div>
          </div>
          
          {/* 解答回数 (読み取り専用) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              解答回数
            </label>
            <div className="bg-gray-100 p-3 rounded-lg text-gray-800 font-medium border border-gray-200">
              {editData.answerCount}回
            </div>
          </div>
          
          {/* 正解率 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              正解率
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={editData.correctRate}
                onChange={handleCorrectRateChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </div>
            </div>
          </div>
          
          {/* 次回解答日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              次回解答日
            </label>
            <div className="relative">
              <div className="flex">
                <input
                  type="date"
                  value={formatDateInput(editData.nextDate)}
                  onChange={handleDateChange}
                  className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={toggleCalendar}
                  className="px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
              
              {/* 日本語表記の日付 (参考表示) */}
              <div className="mt-1 text-sm text-gray-500">
                {formatDateJP(editData.nextDate)}
              </div>
            </div>
          </div>
          
          {/* 間隔 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              間隔
            </label>
            <select
              value={editData.interval}
              onChange={handleIntervalChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1日">1日</option>
              <option value="3日">3日</option>
              <option value="7日">7日</option>
              <option value="14日">14日</option>
              <option value="1ヶ月">1ヶ月</option>
              <option value="2ヶ月">2ヶ月</option>
            </select>
          </div>
          
          {/* 理解度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              理解度
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="understanding"
                  value="理解○"
                  checked={editData.understanding === "理解○"}
                  onChange={handleUnderstandingChange}
                  className="text-indigo-600"
                />
                <span className="text-gray-800">理解○</span>
              </label>
              <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="understanding"
                  value="曖昧△"
                  checked={editData.understanding === "曖昧△" || editData.understanding.startsWith("曖昧△")}
                  onChange={handleUnderstandingChange}
                  className="text-indigo-600"
                />
                <span className="text-gray-800">曖昧△</span>
              </label>
              <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="understanding"
                  value="理解できていない×"
                  checked={editData.understanding === "理解できていない×"}
                  onChange={handleUnderstandingChange}
                  className="text-indigo-600"
                />
                <span className="text-gray-800">理解×</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* フッター */}
        <div className="border-t border-gray-200 p-4 flex justify-between">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            キャンセル
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-1" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditModal;
