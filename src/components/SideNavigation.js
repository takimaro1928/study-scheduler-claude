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
      {/* モバイルメニューボタン */}
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
      
      {/* サイドナビゲーション */}
      <div 
        className={`fixed top-0 left-0 h-full glass z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">学習マネージャー</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-3 mt-4">
          <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider ml-3 mb-2">メインメニュー</p>
          <nav className="space-y-1">
            {navItems.slice(0, 4).map(item => (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`nav-item-modern w-full ${
                  activeTab === item.id ? 'active' : ''
                }`}
              >
                {React.cloneElement(item.icon, { 
                  size: 20,
                  className: `mr-3 ${activeTab === item.id ? 'text-white' : 'text-gray-500'}` 
                })}
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
          
          <p className="text-xs uppercase text-gray-500 font-semibold tracking-wider ml-3 mb-2 mt-8">設定</p>
          <nav className="space-y-1">
            {navItems.slice(4).map(item => (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`nav-item-modern w-full ${
                  activeTab === item.id ? 'active' : ''
                }`}
              >
                {React.cloneElement(item.icon, { 
                  size: 20,
                  className: `mr-3 ${activeTab === item.id ? 'text-white' : 'text-gray-500'}` 
                })}
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              U
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">ユーザー</p>
              <p className="text-xs text-gray-500">初級レベル</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ用のパディング（サイドメニュー用） */}
      <div className="hidden md:block w-72"></div>
    </>
  );
};

export default SideNavigation;
