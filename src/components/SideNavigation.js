// src/components/SideNavigation.js
import React from 'react';
import { X, Calendar, Clock, List, Info, ChevronRight } from 'lucide-react';

const SideNavigation = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const navItems = [
    { id: 'today', label: '今日の問題', icon: <Clock /> },
    { id: 'schedule', label: 'スケジュール', icon: <Calendar /> },
    { id: 'all', label: '全問題一覧', icon: <List /> },
    { id: 'trends', label: '傾向分析', icon: <Info /> },
  ];

  return (
    <>
      {/* オーバーレイ背景 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* サイドナビゲーション */}
      <div 
        className={`fixed top-0 left-0 h-full glass-card z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>メニュー</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-3">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === item.id 
                      ? 'bg-primary-light bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    background: activeTab === item.id 
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' 
                      : ''
                  }}
                >
                  <span className="mr-3">
                    {React.cloneElement(item.icon, { 
                      size: 20,
                      className: activeTab === item.id ? 'text-white' : 'text-gray-500' 
                    })}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SideNavigation;
