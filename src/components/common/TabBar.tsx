import React from 'react';
import { Home, GitFork, Users, BookOpen, User } from 'lucide-react';

export type TabType = 'home' | 'tree' | 'directory' | 'stories' | 'profile';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: '首页', icon: Home },
    { id: 'tree' as TabType, label: '族谱', icon: GitFork },
    { id: 'directory' as TabType, label: '家族', icon: Users },
    { id: 'stories' as TabType, label: '故事', icon: BookOpen },
    { id: 'profile' as TabType, label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#E8DFD1] px-2 py-1 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#B83B26] font-semibold scale-105'
                  : 'text-[#666666] hover:text-[#1A1A1A]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#B83B26]" />
                )}
              </div>
              <span className="text-[11px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
