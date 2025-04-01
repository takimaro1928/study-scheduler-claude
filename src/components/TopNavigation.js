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

  // 画面操作を禁止するスタイル（メニュー表示時）
  const bodyStyle = isMenuOpen 
    ? { overflow: 'hidden', height: '100vh' } 
    : {};

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
        <>
          {/* オーバーレイ（背景）*/}
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-20 z-40" 
            onClick={() => setIsMenuOpen(false)}
            style={{ backdropFilter: 'blur(2px)' }}
          ></div>
          
          {/* サイドメニュー（左側メニュー）*/}
          <div 
            className="fixed top-0 left-0 h-full bg-white z-50 shadow-xl"
            style={{
              width: '280px',
              transition: 'transform 0.3s ease-in-out',
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
              overflowY: 'auto'
            }}
          >
            {/* メニューヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-xl mr-2">📚</span>
                <span className="text-base font-medium">メインメニュー</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* メニュー項目リスト */}
            <div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3.5 border-b border-gray-100 text-left
                    ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <div className="mr-3 opacity-75">{item.icon}</div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* メインコンテンツの余白調整 */}
      <div className="pt-14" style={bodyStyle}></div>
    </>
  );
};

export default TopNavigation;
