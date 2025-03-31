// src/components/SideNavigation.js
import React from 'react';
import { X, Calendar, Clock, List, Info, ChevronRight, BookOpen, Settings, Menu } from 'lucide-react';

const SideNavigation = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const navItems = [
    { id: 'today', label: '今日の問題', icon: <Clock /> },
    { id: 'schedule', label: 'スケジュール', icon: <Calendar /> },
    { id: 'all', label: '全問題一覧', icon: <List /> },
    { id: 'trends', label: '傾向分析', icon: <Info /> },
    { id: 'stats', label: '学習統計', icon: <BookOpen /> },
    { id: 'settings', label: '設定', icon: <Settings /> },
  ];

  return (
    <>
      {/* モバイルメニューボタン - 位置を調整 */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-5 h-5 text-indigo-600" />
      </button>
      
      {/* オーバーレイ背景 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* サイドナビゲーション - スタイリング改善 */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* ヘッダー部分 */}
        <div className="py-6 px-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg mr-3">
              📚
            </div>
            <h2 className="text-lg font-bold text-gray-800">学習マネージャー</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* メニュー部分 */}
        <div className="p-4 mt-2">
          <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider px-3 mb-3">メインメニュー</p>
          <nav className="space-y-2">
            {navItems.slice(0, 4).map(item => (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-3 py-3 rounded-xl text-left transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {React.cloneElement(item.icon, { 
                  size: 20,
                  className: `${activeTab === item.id ? 'text-indigo-600' : 'text-gray-500'} mr-3` 
                })}
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
          
          <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider px-3 mb-3 mt-8">設定</p>
          <nav className="space-y-2">
            {navItems.slice(4).map(item => (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-3 py-3 rounded-xl text-left transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {React.cloneElement(item.icon, { 
                  size: 20,
                  className: `${activeTab === item.id ? 'text-indigo-600' : 'text-gray-500'} mr-3` 
                })}
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* ユーザー情報部分 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
              U
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">ユーザー</p>
              <p className="text-xs text-gray-500">初級レベル</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ用のパディング */}
      <div className="hidden md:block w-72"></div>
    </>
  );
};

export default SideNavigation;
