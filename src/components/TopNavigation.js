// src/components/TopNavigation.js
import React, { useState } from 'react';
import { Clock, Calendar, List, Info, BookOpen, Settings, Menu, X } from 'lucide-react';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // メニュー項目の定義
  const navItems = [
    { id: 'today', label: '今日の問題', icon: <Clock size={20} /> },
    { id: 'schedule', label: 'スケジュール', icon: <Calendar size={20} /> },
    { id: 'all', label: '全問題一覧', icon: <List size={20} /> },
    { id: 'trends', label: '傾向分析', icon: <Info size={20} /> },
    { id: 'stats', label: '学習統計', icon: <BookOpen size={20} /> },
    { id: 'settings', label: '設定', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* ハンバーガーメニューとタイトル */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-2 px-4 flex items-center z-30">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="メインメニューを開く"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center ml-3">
          <span className="text-xl mr-2">📚</span>
          <span className="text-lg font-bold text-gray-800">学習マネージャー</span>
        </div>
      </header>

      {/* メニューオーバーレイ */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-40 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* サイドメニュー */}
      <div 
        className={`fixed top-0 left-0 w-64 bg-white shadow-xl z-50 transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ height: 'auto', maxHeight: '100vh' }}
      >
        {/* メニューヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl mr-2">📚</span>
            <span className="font-medium text-gray-800">メインメニュー</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* メニュー項目 */}
        <nav>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-left border-b border-gray-100 ${
                activeTab === item.id 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ヘッダー分の余白 */}
      <div className="h-12"></div>
    </>
  );
};

export default TopNavigation;
