// src/components/TopNavigation.js
import React, { useState } from 'react';
import { Clock, Calendar, List, Info, BookOpen, Settings, Menu, X } from 'lucide-react';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ナビゲーションアイテム
  const navItems = [
    { id: 'today', label: '今日の問題', icon: <Clock size={18} /> },
    { id: 'schedule', label: 'スケジュール', icon: <Calendar size={18} /> },
    { id: 'all', label: '全問題一覧', icon: <List size={18} /> },
    { id: 'trends', label: '傾向分析', icon: <Info size={18} /> },
    { id: 'stats', label: '学習統計', icon: <BookOpen size={18} /> },
    { id: 'settings', label: '設定', icon: <Settings size={18} /> },
  ];

  return (
    <>
      {/* トップバー */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="w-full mx-auto">
          <div className="flex items-center justify-between h-12 px-4">
            {/* ロゴ部分 */}
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                <span className="text-2xl">📚</span>
              </div>
              <h1 className="text-lg font-bold text-gray-800">学習マネージャー</h1>
            </div>

            {/* メニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* サイドメニュー */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* 黒背景オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* メニュー本体 - 位置を右側に変更 */}
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg overflow-y-auto z-50">
            {/* メニューヘッダー */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">メインメニュー</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* メニュー項目 */}
            <div className="py-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-base font-medium ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
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
