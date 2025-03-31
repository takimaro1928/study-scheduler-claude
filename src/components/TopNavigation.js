// src/components/TopNavigation.js
import React, { useState } from 'react';
import { X, Calendar, Clock, List, Info, BookOpen, Settings, Menu, User } from 'lucide-react';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      {/* デスクトップナビゲーション - 上部固定 */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            {/* ロゴ部分 */}
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                <span className="text-2xl">📚</span>
              </div>
              <h1 className="text-lg font-bold text-gray-800">学習マネージャー</h1>
            </div>

            {/* デスクトップメニュー */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* モバイルメニューボタン */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* ユーザー情報 */}
            <div className="hidden md:flex items-center ml-4">
              <div className="flex items-center border-l border-gray-200 pl-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  <User size={16} />
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium text-gray-800">ユーザー</p>
                  <p className="text-xs text-gray-500">初級レベル</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* モバイルメニュー（展開時のみ表示） */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* オーバーレイ背景 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* メニュー内容 */}
          <div className="relative w-full max-w-xs bg-white pt-5 pb-4 flex-1 flex flex-col">
            <div className="px-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl">📚</span>
                <h2 className="ml-2 text-lg font-medium text-gray-800">メインメニュー</h2>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* モバイルナビリンク */}
            <div className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-3 text-base font-medium rounded-md ${
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
            
            {/* モバイルユーザー情報 */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    <User size={20} />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800">ユーザー</p>
                  <p className="text-sm text-gray-500">初級レベル</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ページコンテンツのための余白 */}
      <div className="h-16"></div>
    </>
  );
};

export default TopNavigation;
