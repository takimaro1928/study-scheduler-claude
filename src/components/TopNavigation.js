// src/components/TopNavigation.js
import React, { useState } from 'react';

const TopNavigation = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ナビゲーションアイテム
  const navItems = [
    { id: 'today', label: '今日の問題', icon: '🕒' },
    { id: 'schedule', label: 'スケジュール', icon: '📅' },
    { id: 'all', label: '全問題一覧', icon: '📋' },
    { id: 'trends', label: '傾向分析', icon: 'ℹ️' },
    { id: 'stats', label: '学習統計', icon: '📚' },
    { id: 'settings', label: '設定', icon: '⚙️' },
  ];

  return (
    <>
      {/* デスクトップナビゲーション */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '64px' 
          }}>
            {/* ロゴ部分 */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', marginRight: '8px' }}>📚</span>
              <h1 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#1f2937'
              }}>学習マネージャー</h1>
            </div>

            {/* ナビゲーションリンク */}
            <nav style={{ 
              display: 'flex', 
              gap: '4px',
              '@media (max-width: 768px)': {
                display: 'none'
              }
            }}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: activeTab === item.id ? '#eef2ff' : 'transparent',
                    color: activeTab === item.id ? '#4f46e5' : '#4b5563',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ marginRight: '6px' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'none',
                '@media (max-width: 768px)': {
                  display: 'block'
                }
              }}
            >
              ☰
            </button>

            {/* ユーザー情報 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginLeft: '16px',
              '@media (max-width: 768px)': {
                display: 'none'
              }
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                borderLeft: '1px solid #e5e7eb', 
                paddingLeft: '12px' 
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                  fontWeight: 'bold'
                }}>
                  U
                </div>
                <div style={{ marginLeft: '8px' }}>
                  <p style={{ 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: '#1f2937',
                    margin: 0 
                  }}>ユーザー</p>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    margin: 0 
                  }}>初級レベル</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* モバイルメニュー（展開時のみ表示） */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 40,
          padding: '8px'
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: activeTab === item.id ? '#eef2ff' : 'transparent',
                color: activeTab === item.id ? '#4f46e5' : '#4b5563',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: '4px'
              }}
            >
              <span style={{ marginRight: '12px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* ページコンテンツのための余白 */}
      <div style={{ height: '64px' }}></div>
    </>
  );
};

export default TopNavigation;
