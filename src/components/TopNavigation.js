import React, { useState } from 'react';
import { Clock, Calendar, List, Info, BookOpen, Settings, Menu, X, User } from 'lucide-react';

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

  // メニューを閉じる関数
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* 固定ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between z-40">
        {/* 左側：アプリロゴとタイトル */}
        <div className="flex items-center">
          <span className="text-xl mr-2">📚</span>
          <span className="text-lg font-bold text-gray-800">学習マネージャー</span>
        </div>
        
        {/* 右側：ハンバーガーメニューボタン */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-gray-600 hover:text-gray-800 p-1 rounded focus:outline-none"
          aria-label="メインメニューを開く"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* サイドメニュー（オーバーレイ込み） */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* 背景オーバーレイ */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={closeMenu}
          ></div>
          
          {/* サイドメニュー本体 */}
          <div className="relative w-64 max-w-xs bg-white h-full overflow-y-auto">
            {/* メニューヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-xl mr-2">📚</span>
                <span className="font-medium text-gray-700">メインメニュー</span>
              </div>
              <button 
                onClick={closeMenu}
                className="text-gray-500 hover:text-gray-700 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* メニュー項目 */}
            <nav className="py-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    closeMenu();
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left ${
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
        </div>
      )}

      {/* メインコンテンツの余白調整 */}
      <div className="pt-14"></div>
    </>
  );
};

export default TopNavigation;
