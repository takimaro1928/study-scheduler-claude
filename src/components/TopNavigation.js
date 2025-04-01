// src/components/TopNavigation.js
import React, { useState } from 'react';
import { Clock, Calendar, List, Info, BookOpen, Settings, Menu, X } from 'lucide-react';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  // メニューの開閉状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // メニューアイテム定義
  const navItems = [
    { id: 'today', label: '今日の問題', icon: <Clock size={20} /> },
    { id: 'schedule', label: 'スケジュール', icon: <Calendar size={20} /> },
    { id: 'all', label: '全問題一覧', icon: <List size={20} /> },
    { id: 'trends', label: '傾向分析', icon: <Info size={20} /> },
    { id: 'stats', label: '学習統計', icon: <BookOpen size={20} /> },
    { id: 'settings', label: '設定', icon: <Settings size={20} /> },
  ];
  
  // タブ切り替えとメニューを閉じる
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* ハンバーガーボタンとヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm h-14 flex items-center px-4 z-40">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="メニューを開く"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        
        <div className="ml-3 flex items-center">
          <span className="text-xl mr-2">📚</span>
          <h1 className="font-bold text-gray-800">学習マネージャー</h1>
        </div>
      </header>
      
      {/* モバイルメニュー (オーバーレイ) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
      
      {/* サイドナビゲーション */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* メニューヘッダー */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl mr-2">📚</span>
            <h2 className="font-medium text-gray-800">メインメニュー</h2>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)} 
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="メニューを閉じる"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* メニュー項目 */}
        <nav className="mt-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* メインコンテンツのためのスペーサー */}
      <div className="h-14"></div>
    </>
  );
};

export default TopNavigation;
