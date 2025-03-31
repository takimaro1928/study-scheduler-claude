// src/components/TopNavigation.js
import React, { useState } from 'react';
import { Clock, Calendar, List, Info, BookOpen, Settings, Menu, X } from 'lucide-react';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // メニュー項目
  const navItems = [
    { id: 'today', label: '今日の問題', icon: <Clock size={20} /> },
    { id: 'schedule', label: 'スケジュール', icon: <Calendar size={20} /> },
    { id: 'all', label: '全問題一覧', icon: <List size={20} /> },
    { id: 'trends', label: '傾向分析', icon: <Info size={20} /> },
    { id: 'stats', label: '学習統計', icon: <BookOpen size={20} /> },
    { id: 'settings', label: '設定', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen">
      {/* サイドナビゲーション - モバイル時は非表示 */}
      <div 
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* メニューヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl mr-2">📚</span>
            <h2 className="text-lg font-medium text-gray-800">メインメニュー</h2>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* メニュー項目 */}
        <nav className="mt-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left ${
                activeTab === item.id 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 opacity-75">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* トップバー */}
        <header className="bg-white border-b border-gray-200 py-2 px-4 flex items-center">
          <button
            className="mr-2 text-gray-600 md:hidden"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center">
            <span className="text-xl mr-2">📚</span>
            <h1 className="text-lg font-bold text-gray-800">学習マネージャー</h1>
          </div>
        </header>
        
        {/* オーバーレイ背景（モバイル時のみ） */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default TopNavigation;
