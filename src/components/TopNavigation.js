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
    <>
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between z-40">
        <div className="flex items-center">
          <span className="text-xl mr-2">📚</span>
          <span className="text-lg font-bold text-gray-800">学習マネージャー</span>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="メインメニューを開く"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* サイドメニュー + オーバーレイ */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* 暗いオーバーレイ - メニュー以外の部分をクリックで閉じる */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30" 
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* サイドメニュー本体 - 2枚目画像のスタイルに近づける */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 overflow-y-auto menu-slide-in">
            {/* メニューヘッダー */}
            <div className="flex items-center justify-between py-2 px-3 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-lg mr-1">📚</span>
                <span className="font-medium text-gray-800">メインメニュー</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* メニュー項目 - 2枚目画像のスタイルを再現 */}
            <nav className="py-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left border-b border-gray-100 ${
                    activeTab === item.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3 opacity-80">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* メインコンテンツの余白調整 */}
      <div className="pt-14"></div>
    </>
  );
};

export default TopNavigation;
