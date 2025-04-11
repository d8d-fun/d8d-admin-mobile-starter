import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGlobalConfig } from './utils.ts';
import type { GlobalConfig } from '../share/types.ts';
import { Spin } from 'antd';
import './style_amap.css';
import { MapMode, MarkerData } from '../share/types.ts';

// 在线地图配置
export const AMAP_ONLINE_CONFIG = {
  // 高德地图 Web API 密钥
  API_KEY: getGlobalConfig('MAP_CONFIG')?.KEY || '',
  // 主JS文件路径
  MAIN_JS: 'https://webapi.amap.com/maps?v=2.0&key=' + (getGlobalConfig('MAP_CONFIG')?.KEY || ''),
  // 插件列表
  PLUGINS: ['AMap.MouseTool', 'AMap.RangingTool', 'AMap.Scale', 'AMap.ToolBar', 'AMap.MarkerCluster'],
};

export const AMAP_OFFLINE_CONFIG = {
  // 主JS文件路径
  MAIN_JS: '/amap/amap3.js?v=2.0',
  // 插件目录
  PLUGINS_PATH: '/amap/plugins',
  // 插件列表
  PLUGINS: ['AMap.MouseTool', 'AMap.RangingTool', 'AMap.Scale', 'AMap.ToolBar', 'AMap.MarkerCluster'],
};

// 离线瓦片配置
export const TILE_CONFIG = {
  // 瓦片地图基础路径
  BASE_URL: '/amap/tiles',
  // 缩放级别范围
  ZOOMS: [3, 20] as [number, number],
  // 默认中心点
  DEFAULT_CENTER: [108.25910334, 27.94292459] as [number, number],
  // 默认缩放级别
  DEFAULT_ZOOM: 15
} as const;

// 地图控件配置
export const MAP_CONTROLS = {
  scale: true,
  toolbar: true,
  mousePosition: true,
} as const;

export interface AMapProps {
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
  center?: [number, number];
  zoom?: number;
  mode?: MapMode;
  onMarkerClick?: (markerData: MarkerData) => void;
  onClick?: (lnglat: [number, number]) => void;
  markers?: MarkerData[];
  showCluster?: boolean;
  queryKey?: string;
}

export interface MapConfig {
  zoom: number;
  center: [number, number];
  zooms: [number, number];
  resizeEnable: boolean;
  rotateEnable: boolean;
  pitchEnable: boolean;
  defaultCursor: string;
  showLabel: boolean;
  layers?: any[];
}

export interface AMapInstance {
  map: any;
  setZoomAndCenter: (zoom: number, center: [number, number]) => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  destroy: () => void;
  clearMap: () => void;
  getAllOverlays: (type: string) => any[];
  on: (event: string, handler: Function) => void;
} 

declare global {
  interface Window {
    AMap: any;
    CONFIG?: GlobalConfig;
  }
}

const loadScript = (url: string,plugins:string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url + (plugins.length > 0 ? `&plugin=${plugins.join(',')}` : '');
    script.onerror = (e) => reject(e);
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

export const useAMapLoader = (mode: MapMode = MapMode.ONLINE) => {
  return useQuery({
    queryKey: ['amap-loader', mode],
    queryFn: async () => {
      if (typeof window === 'undefined') return null;
      
      if (!window.AMap) {
        const config = mode === MapMode.OFFLINE ? AMAP_OFFLINE_CONFIG : AMAP_ONLINE_CONFIG;
        await loadScript(config.MAIN_JS,config.PLUGINS);
      }
      
      return window.AMap;
    },
    staleTime: Infinity, // 地图脚本加载后永不过期
    gcTime: Infinity,
    retry: 2,
  });
}; 

export const useAMapClick = (
  map: any,
  onClick?: (lnglat: [number, number]) => void
) => {
  const mouseTool = useRef<any>(null);
  const clickHandlerRef = useRef<((e: any) => void) | null>(null);

  useEffect(() => {
    if (!map) return;

    // 清理旧的点击处理器
    if (clickHandlerRef.current) {
      map.off('click', clickHandlerRef.current);
      clickHandlerRef.current = null;
    }

    // 如果有点击回调，设置新的点击处理器
    if (onClick) {
      clickHandlerRef.current = (e: any) => {
        const lnglat = e.lnglat.getLng ? 
          [e.lnglat.getLng(), e.lnglat.getLat()] as [number, number] :
          [e.lnglat.lng, e.lnglat.lat] as [number, number];
        onClick(lnglat);
      };
      map.on('click', clickHandlerRef.current);
    }

    return () => {
      if (clickHandlerRef.current) {
        map.off('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [map, onClick]);

  return {
    mouseTool: mouseTool.current
  };
}; 

// 定义图标配置的类型
interface MarkerIconConfig {
  size: [number, number];
  content: string;
}

// 默认图标配置
const DEFAULT_MARKER_ICON: MarkerIconConfig = {
  size: [25, 34],
  content: `
    <svg width="25" height="34" viewBox="0 0 25 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 21.875 12.5 34 12.5 34C12.5 34 25 21.875 25 12.5C25 5.59644 19.4036 0 12.5 0ZM12.5 17C10.0147 17 8 14.9853 8 12.5C8 10.0147 10.0147 8 12.5 8C14.9853 8 17 10.0147 17 12.5C17 14.9853 14.9853 17 12.5 17Z" fill="#1890ff"/>
    </svg>
  `
};

interface UseAMapMarkersProps {
  map: any;
  markers: MarkerData[];
  showCluster?: boolean;
  onMarkerClick?: (markerData: MarkerData) => void;
}

export const useAMapMarkers = ({
  map,
  markers,
  showCluster = true,
  onMarkerClick,
}: UseAMapMarkersProps) => {
  const clusterInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 优化经纬度格式化函数
  const toFixedDigit = (num: number, n: number): string => {
    if (typeof num !== "number") return "";
    return Number(num).toFixed(n);
  };

  // 创建标记点
  const createMarker = (markerData: MarkerData) => {
    const { longitude, latitude, title, iconUrl } = markerData;
    
    // 创建标记点
    const marker = new window.AMap.Marker({
      position: [longitude, latitude],
      title: title,
      icon: iconUrl ? new window.AMap.Icon({
        size: DEFAULT_MARKER_ICON.size,
        imageSize: DEFAULT_MARKER_ICON.size,
        image: iconUrl
      }) : new window.AMap.Icon({
        size: DEFAULT_MARKER_ICON.size,
        imageSize: DEFAULT_MARKER_ICON.size,
        image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DEFAULT_MARKER_ICON.content)}`
      }),
      label: title ? {
        content: title,
        direction: 'top'
      } : undefined
    });

    // 添加点击事件
    if (onMarkerClick) {
      marker.on('click', () => onMarkerClick(markerData));
    }

    return marker;
  };

  // 处理聚合点
  const handleCluster = () => {
    if (!map || !markers.length) return;

    const points = markers.map(item => ({
      weight: 1,
      lnglat: [
        toFixedDigit(item.longitude, 5),
        toFixedDigit(item.latitude, 5)
      ],
      ...item
    }));

    if (clusterInstance.current) {
      clusterInstance.current.setData(points);
      return;
    }

    if(window.AMap?.MarkerCluster){
      clusterInstance.current = new window.AMap.MarkerCluster(map, points, {
        gridSize: 60,
        renderMarker: (context: { marker: any; data: MarkerData[] }) => {
          const { marker, data } = context;
          const firstPoint = data[0];
          
          if (firstPoint.iconUrl) {
            marker.setContent(`<img src="${firstPoint.iconUrl}" style="width:${DEFAULT_MARKER_ICON.size[0]}px;height:${DEFAULT_MARKER_ICON.size[1]}px;">`);
          } else {
            marker.setContent(DEFAULT_MARKER_ICON.content);
          }
          marker.setAnchor('bottom-center');
          marker.setOffset(new window.AMap.Pixel(0, 0));

          if (firstPoint.title) {
            marker.setLabel({
              direction: 'top',
              offset: new window.AMap.Pixel(0, -5),
              content: firstPoint.title
            });
          }
        
          marker.on('click', () => onMarkerClick?.(firstPoint));
        }
      });
    }

    // 优化聚合点点击逻辑
    if(clusterInstance.current){
      clusterInstance.current.on('click', (item: any) => {
        if (item.clusterData.length <= 1) return;

        const center = item.clusterData.reduce(
          (acc: number[], curr: any) => [
            acc[0] + Number(curr.lnglat[0]),
            acc[1] + Number(curr.lnglat[1])
          ],
          [0, 0]
        ).map((coord: number) => coord / item.clusterData.length);

        map.setZoomAndCenter(map.getZoom() + 2, center);
      });
    }
  };

  // 处理普通标记点
  const handleMarkers = () => {
    if (!map || !markers.length) return;
    
    // 清除旧的标记点
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 添加新的标记点
    markersRef.current = markers.map(markerData => {
      const marker = createMarker(markerData);
      marker.setMap(map);
      return marker;
    });
  };

  useEffect(() => {
    if (!map || !Array.isArray(markers)) return;

    // 清理旧的标记点和聚合点
    if (clusterInstance.current) {
      clusterInstance.current.setMap(null);
      clusterInstance.current = null;
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 根据配置添加新的标记点
    if (markers.length > 0) {
      if (showCluster) {
        handleCluster();
      } else {
        handleMarkers();
      }
    }

    return () => {
      if (clusterInstance.current) {
        clusterInstance.current.setMap(null);
        clusterInstance.current = null;
      }
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [map, markers, showCluster]);
}; 

const AMapComponent: React.FC<AMapProps> = ({
  width = '100%',
  height = '400px',
  center = TILE_CONFIG.DEFAULT_CENTER as [number, number],
  zoom = TILE_CONFIG.DEFAULT_ZOOM,
  mode = (getGlobalConfig('MAP_CONFIG')?.MAP_MODE as MapMode) || MapMode.ONLINE,
  onMarkerClick,
  onClick,
  markers = [],
  showCluster = true,
  queryKey = 'amap-instance',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<AMapInstance | null>(null);
  const queryClient = useQueryClient();

  // 加载地图脚本
  const { data: AMap, isLoading: isLoadingScript } = useAMapLoader(mode);

  // 初始化地图实例
  const { data: map } = useQuery<AMapInstance>({
    queryKey: [ queryKey ],
    queryFn: async () => {
      if (!AMap || !mapContainer.current) return null;

      const config: MapConfig = {
        zoom,
        center,
        zooms: [3, 20],
        resizeEnable: true,
        rotateEnable: false,
        pitchEnable: false,
        defaultCursor: 'pointer',
        showLabel: true,
      };

      if (mode === 'offline') {
        config.layers = [
          new AMap.TileLayer({
            getTileUrl: (x: number, y: number, z: number) => 
              `${TILE_CONFIG.BASE_URL}/${z}/${x}/${y}.png`,
            zIndex: 100,
          })
        ];
      }

      const newMap = new AMap.Map(mapContainer.current, config);
      mapInstance.current = newMap;
      return newMap;
    },
    enabled: !!AMap && !!mapContainer.current && !isLoadingScript,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  // 处理标记点
  useAMapMarkers({
    map,
    markers,
    showCluster,
    onMarkerClick,
  });

  // 处理点击事件
  useAMapClick(map, onClick);

  // 更新地图视图
  useEffect(() => {
    if (!map) return;
    
    if (center && zoom) {
      map.setZoomAndCenter(zoom, center);
    } else if (center) {
      map.setCenter(center);
    } else if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  // 清理地图实例和查询缓存
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
        // 清理 React Query 缓存
        queryClient.removeQueries({ queryKey: [ queryKey ] });
      }
    };
  }, [queryClient]);

  return (
    <div
      ref={mapContainer}
      style={{
        width,
        height,
        position: 'relative',
      }}
    >
      {isLoadingScript && <div className="w-full h-full flex justify-center items-center"><Spin /></div>}
    </div>
  );
};

export default AMapComponent;
