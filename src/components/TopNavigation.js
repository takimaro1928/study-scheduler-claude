import React, { useState } from 'react';
import { Clock, Calendar, List, Info, BookOpen, Settings, Menu, X } from 'lucide-react';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // メニュー項目
  const navItems = [
    { id: 'today', label: '今日の問題', icon: <Clock size={24} /> },
    { id: 'schedule', label: 'スケジュール', icon: <Calendar size={24} /> },
    { id: 'all', label: '全問題一覧', icon: <List size={24} /> },
    { id: 'trends', label: '傾向分析', icon: <Info size={24} /> },
    { id: 'stats', label: '学習統計', icon: <BookOpen size={24} /> },
    { id: 'settings', label: '設定', icon: <Settings size={24} /> },
  ];

  return (
    <>
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-3 px-4 flex items-center z-40">
        <div className="flex items-center ml-3">
          <span className="text-xl mr-2">📚</span>
          <span className="text-lg font-bold text-gray-800">学習マネージャー</span>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="absolute right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
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
          
          {/* サイドメニュー本体 - 明るいままキープ */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto">
            {/* メニューヘッダー */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-2xl mr-2">📚</span>
                <span className="font-bold text-lg text-gray-700">メインメニュー</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X size={24} />
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
                  className={`w-full flex items-center px-5 py-5 text-left border-b border-gray-100 ${
                    activeTab === item.id 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-4 text-opacity-90" style={{ minWidth: '24px' }}>{item.icon}</span>
                  <span className="font-medium text-base">{item.label}</span>
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
