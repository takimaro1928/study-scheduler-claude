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
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-40">
        <div className="flex items-center">
          <span className="text-xl mr-2">📚</span>
          <span className="text-lg font-bold text-gray-800">学習マネージャー</span>
        </div>
        
        {/* デスクトップメニュー - 768px以上で表示 */}
        <div className="hidden md:flex items-center space-x-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-2 opacity-85">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* モバイルのハンバーガーメニューボタン */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="md:hidden p-1 text-gray-600 rounded-md hover:bg-gray-100"
          aria-label="メインメニューを開く"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* サイドメニュー */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex">
          {/* サイドメニュー本体 */}
          <div className="w-72 bg-white h-full shadow-lg overflow-auto flex flex-col">
            {/* メニューヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-xl mr-2">📚</span>
                <span className="text-base font-medium">メインメニュー</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* メニューリスト */}
            <div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3.5 text-left border-b border-gray-100 transition-colors ${
                    activeTab === item.id 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3 opacity-85">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* オーバーレイ部分（クリックするとメニューを閉じる） */}
          <div
            className="flex-grow cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
      )}

      {/* メインコンテンツの余白調整 */}
      <div className="pt-14"></div>
    </>
  );
};

export default TopNavigation;
