import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { 
  HomeIcon, 
  UserIcon, 
  NewspaperIcon, 
  BellIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks.tsx';
import { formatRelativeTime } from '../utils.ts';

interface BannerItem {
  id: number;
  title: string;
  image: string;
  link: string;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  publish_date: string;
  cover?: string;
  category: string;
}

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

// 首页组件
const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [activeTab, setActiveTab] = useState('news');
  
  // 模拟加载数据
  useEffect(() => {
    // 模拟API请求
    setTimeout(() => {
      // 模拟轮播图数据
      setBanners([
        { 
          id: 1, 
          title: '欢迎使用移动端应用', 
          image: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cG9ydGZvbGlvJTIwYmFja2dyb3VuZHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
          link: '/welcome'
        },
        { 
          id: 2, 
          title: '新功能上线了', 
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cG9ydGZvbGlvJTIwYmFja2dyb3VuZHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
          link: '/new-features'
        }
      ]);
      
      // 模拟新闻数据
      setNews([
        {
          id: 1,
          title: '用户体验升级，新版本发布',
          summary: '我们很高兴地宣布，新版本已经发布，带来了更好的用户体验和更多新功能。',
          publish_date: '2023-05-01T08:30:00',
          cover: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHRlY2h8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          category: '产品更新'
        },
        {
          id: 2,
          title: '新的数据分析功能上线',
          summary: '新的数据分析功能让您更深入地了解您的业务数据，提供更好的决策支持。',
          publish_date: '2023-04-25T14:15:00',
          cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGNoYXJ0fGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          category: '功能介绍'
        },
        {
          id: 3,
          title: '如何提高工作效率的5个小技巧',
          summary: '这篇文章分享了5个可以立即实施的小技巧，帮助您提高日常工作效率。',
          publish_date: '2023-04-20T09:45:00',
          category: '使用技巧'
        }
      ]);
      
      // 模拟通知数据
      setNotices([
        {
          id: 1,
          title: '系统维护通知',
          content: '我们将于本周六凌晨2点至4点进行系统维护，期间系统可能会出现短暂不可用。',
          created_at: '2023-05-02T10:00:00',
          is_read: false
        },
        {
          id: 2,
          title: '您的账户信息已更新',
          content: '您的账户信息已成功更新，如非本人操作，请及时联系客服。',
          created_at: '2023-05-01T16:30:00',
          is_read: true
        }
      ]);
      
      setLoading(false);
    }, 800);
  }, []);
  
  // 处理轮播图点击
  const handleBannerClick = (link: string) => {
    navigate(link);
  };
  
  // 处理新闻点击
  const handleNewsClick = (id: number) => {
    navigate(`/news/${id}`);
  };
  
  // 处理通知点击
  const handleNoticeClick = (id: number) => {
    navigate(`/notices/${id}`);
  };
  
  return (
    <div className="pb-16">
      {/* 顶部用户信息 */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user?.nickname || user?.username || '用户'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium">
                {user ? `您好，${user.nickname || user.username}` : '您好，游客'}
              </h2>
              <p className="text-sm text-white/80">
                {user ? '欢迎回来' : '请登录体验更多功能'}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <BellIcon className="w-6 h-6" />
            {notices.some(notice => !notice.is_read) && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        </div>
      </div>
      
      {/* 轮播图 */}
      {!loading && banners.length > 0 && (
        <div className="relative w-full h-40 overflow-hidden mt-2">
          <div className="flex transition-transform duration-300" 
               style={{ transform: `translateX(-${0 * 100}%)` }}>
            {banners.map((banner) => (
              <div 
                key={banner.id}
                className="w-full h-40 flex-shrink-0 relative"
                onClick={() => handleBannerClick(banner.link)}
              >
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <h3 className="text-white font-medium">{banner.title}</h3>
                </div>
              </div>
            ))}
          </div>
          
          {/* 指示器 */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
            {banners.map((_, index) => (
              <span 
                key={index}
                className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`}
              ></span>
            ))}
          </div>
        </div>
      )}
      
      {/* 快捷入口 */}
      <div className="grid grid-cols-4 gap-2 p-4 bg-white rounded-lg shadow mt-4 mx-2">
        {[
          { icon: <HomeIcon className="w-6 h-6" />, name: '首页', path: '/' },
          { icon: <NewspaperIcon className="w-6 h-6" />, name: '资讯', path: '/news' },
          { icon: <BellIcon className="w-6 h-6" />, name: '通知', path: '/notices' },
          { icon: <UserIcon className="w-6 h-6" />, name: '我的', path: '/profile' }
        ].map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center justify-center p-2"
            onClick={() => navigate(item.path)}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1">
              {item.icon}
            </div>
            <span className="text-sm">{item.name}</span>
          </div>
        ))}
      </div>
      
      {/* 内容标签页 */}
      <div className="mt-4 mx-2">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 text-center ${activeTab === 'news' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('news')}
          >
            最新资讯
          </button>
          <button
            className={`flex-1 py-2 text-center ${activeTab === 'notices' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('notices')}
          >
            通知公告
          </button>
        </div>
        
        <div className="mt-2">
          {activeTab === 'news' ? (
            loading ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white p-3 rounded-lg shadow flex items-start space-x-3"
                    onClick={() => handleNewsClick(item.id)}
                  >
                    {item.cover && (
                      <img 
                        src={item.cover} 
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className={item.cover ? '' : 'w-full'}>
                      <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(item.publish_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            loading ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white p-3 rounded-lg shadow"
                    onClick={() => handleNoticeClick(item.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className={`font-medium ${item.is_read ? 'text-gray-700' : 'text-blue-600'}`}>
                        {!item.is_read && (
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        )}
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.content}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      
      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
        {[
          { icon: <HomeIcon className="w-6 h-6" />, name: '首页', path: '/' },
          { icon: <NewspaperIcon className="w-6 h-6" />, name: '资讯', path: '/news' },
          { icon: <BellIcon className="w-6 h-6" />, name: '通知', path: '/notices' },
          { icon: <UserIcon className="w-6 h-6" />, name: '我的', path: '/profile' }
        ].map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center"
            onClick={() => navigate(item.path)}
          >
            <div className={`${location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}>
              {item.icon}
            </div>
            <span className={`text-xs mt-1 ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 