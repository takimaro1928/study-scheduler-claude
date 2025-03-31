// src/components/TopNavigation.js
import React, { useState } from 'react';
import { Clock, Calendar, List, Info, BookOpen, Settings, Menu, X } from 'lucide-react';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // メニュー項目 - 画像1の項目と完全に一致させる
  const navItems = [
    { id: 'today', label: '今日の問題', icon: <Clock size={20} className="text-indigo-500" /> },
    { id: 'schedule', label: 'スケジュール', icon: <Calendar size={20} className="text-indigo-500" /> },
    { id: 'all', label: '全問題一覧', icon: <List size={20} className="text-indigo-500" /> },
    { id: 'trends', label: '傾向分析', icon: <Info size={20} className="text-indigo-500" /> },
    { id: 'stats', label: '学習統計', icon: <BookOpen size={20} className="text-indigo-500" /> },
    { id: 'settings', label: '設定', icon: <Settings size={20} className="text-indigo-500" /> },
  ];

  return (
    <>
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="w-full mx-auto">
          <div className="flex items-center justify-between h-12 px-4">
            {/* ロゴ */}
            <div className="flex items-center">
              <span className="text-2xl mr-2">📚</span>
              <h1 className="text-lg font-bold text-gray-800">学習マネージャー</h1>
            </div>

            {/* メニューボタン */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="rounded-md text-gray-600 hover:bg-gray-100 p-2"
              aria-label="メニュー"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* サイドメニュー - 左から表示 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* オーバーレイ背景 - グレーに設定 */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* 左側からのメニュー本体 */}
          <div className="relative flex-1 flex max-w-xs w-full bg-white shadow-xl">
            {/* メニューヘッダー */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              {/* メニューのヘッダー */}
              <div className="flex items-center px-4 mb-3">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-2xl mr-2">📚</span>
                  <h2 className="text-xl font-medium text-gray-900">メインメニュー</h2>
                </div>
              </div>
              
              {/* メニュー項目 */}
              <nav className="mt-5 px-2 space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-md ${
                      activeTab === item.id 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ページコンテンツのための余白 */}
      <div className="h-12"></div>
    </>
  );
};

export default TopNavigation;
