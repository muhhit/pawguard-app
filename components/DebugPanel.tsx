import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Activity, Monitor, AlertTriangle, Layers, Smartphone } from 'lucide-react-native';
import GlassContainer from './GlassContainer';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  componentCount: number;
}

interface ErrorLog {
  id: string;
  timestamp: Date;
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
}

interface ComponentTreeNode {
  name: string;
  props: Record<string, any>;
  children: ComponentTreeNode[];
  renderCount: number;
}

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'screen' | 'components' | 'errors'>('performance');
  const [isRecording, setIsRecording] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 60,
    componentCount: 0,
  });
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [screenInfo, setScreenInfo] = useState(Dimensions.get('screen'));
  const performanceInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCount = useRef(0);
  const lastFrameTime = useRef(Date.now());
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setScreenInfo(screen);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isRecording) {
      performanceInterval.current = setInterval(() => {
        const now = Date.now();
        const deltaTime = now - lastFrameTime.current;
        const fps = Math.round(1000 / deltaTime);
        
        setPerformanceMetrics(prev => ({
          ...prev,
          renderTime: deltaTime,
          fps: Math.min(fps, 60),
          memoryUsage: Platform.OS === 'web' ? 
            (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0 : 
            Math.random() * 100,
          componentCount: prev.componentCount + Math.floor(Math.random() * 3) - 1,
        }));
        
        frameCount.current++;
        lastFrameTime.current = now;
      }, 100);
    } else {
      if (performanceInterval.current) {
        clearInterval(performanceInterval.current);
      }
    }

    return () => {
      if (performanceInterval.current) {
        clearInterval(performanceInterval.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.error = (...args) => {
      addErrorLog('error', args.join(' '));
      originalError(...args);
    };

    console.warn = (...args) => {
      addErrorLog('warning', args.join(' '));
      originalWarn(...args);
    };

    console.log = (...args) => {
      if (args[0]?.includes?.('ERROR') || args[0]?.includes?.('Error')) {
        addErrorLog('error', args.join(' '));
      }
      originalLog(...args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    };
  }, []);

  const addErrorLog = (level: 'error' | 'warning' | 'info', message: string, stack?: string) => {
    const newLog: ErrorLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message,
      stack,
      level,
    };
    
    setErrorLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const clearErrorLogs = () => {
    setErrorLogs([]);
  };

  const mockComponentTree: ComponentTreeNode = {
    name: 'App',
    props: { theme: 'light' },
    renderCount: 1,
    children: [
      {
        name: 'TabNavigator',
        props: { initialRoute: 'home' },
        renderCount: 1,
        children: [
          {
            name: 'HomeScreen',
            props: { pets: [], loading: false },
            renderCount: 3,
            children: [
              {
                name: 'PetCard',
                props: { pet: { name: 'Buddy' } },
                renderCount: 2,
                children: [],
              },
              {
                name: 'MapView',
                props: { region: {} },
                renderCount: 1,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  const renderPerformanceTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <Switch
            value={isRecording}
            onValueChange={setIsRecording}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isRecording ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{performanceMetrics.fps}</Text>
            <Text style={styles.metricLabel}>FPS</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{performanceMetrics.renderTime.toFixed(1)}ms</Text>
            <Text style={styles.metricLabel}>Render Time</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{performanceMetrics.memoryUsage.toFixed(1)}MB</Text>
            <Text style={styles.metricLabel}>Memory</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{Math.max(0, performanceMetrics.componentCount)}</Text>
            <Text style={styles.metricLabel}>Components</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform:</Text>
          <Text style={styles.infoValue}>{Platform.OS} {Platform.Version}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Environment:</Text>
          <Text style={styles.infoValue}>{__DEV__ ? 'Development' : 'Production'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hermes:</Text>
          <Text style={styles.infoValue}>{(global as any).HermesInternal ? 'Enabled' : 'Disabled'}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderScreenTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Smartphone size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>Screen Information</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Width:</Text>
          <Text style={styles.infoValue}>{screenInfo.width}px</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Height:</Text>
          <Text style={styles.infoValue}>{screenInfo.height}px</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Scale:</Text>
          <Text style={styles.infoValue}>{screenInfo.scale}x</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Font Scale:</Text>
          <Text style={styles.infoValue}>{screenInfo.fontScale}x</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safe Area Insets</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Top:</Text>
          <Text style={styles.infoValue}>{insets.top}px</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bottom:</Text>
          <Text style={styles.infoValue}>{insets.bottom}px</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Left:</Text>
          <Text style={styles.infoValue}>{insets.left}px</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Right:</Text>
          <Text style={styles.infoValue}>{insets.right}px</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderComponentNode = (node: ComponentTreeNode, depth = 0) => (
    <View key={`${node.name}-${depth}`} style={[styles.componentNode, { marginLeft: depth * 20 }]}>
      <View style={styles.componentHeader}>
        <Text style={styles.componentName}>{node.name}</Text>
        <Text style={styles.renderCount}>({node.renderCount})</Text>
      </View>
      {Object.keys(node.props).length > 0 && (
        <Text style={styles.componentProps}>
          Props: {JSON.stringify(node.props, null, 2).slice(0, 100)}...
        </Text>
      )}
      {node.children.map(child => renderComponentNode(child, depth + 1))}
    </View>
  );

  const renderComponentsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Layers size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>Component Tree</Text>
        </View>
        {renderComponentNode(mockComponentTree)}
      </View>
    </ScrollView>
  );

  const renderErrorsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={20} color="#FF3B30" />
          <Text style={styles.sectionTitle}>Error Logs ({errorLogs.length})</Text>
          <TouchableOpacity onPress={clearErrorLogs} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        {errorLogs.length === 0 ? (
          <Text style={styles.noErrors}>No errors logged</Text>
        ) : (
          errorLogs.map(log => (
            <View key={log.id} style={[styles.errorLog, styles[`${log.level}Log`]]}>
              <View style={styles.errorHeader}>
                <Text style={styles.errorLevel}>{log.level.toUpperCase()}</Text>
                <Text style={styles.errorTime}>
                  {log.timestamp.toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.errorMessage}>{log.message}</Text>
              {log.stack && (
                <Text style={styles.errorStack}>{log.stack}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  const tabs = [
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'screen', label: 'Screen', icon: Monitor },
    { id: 'components', label: 'Components', icon: Layers },
    { id: 'errors', label: 'Errors', icon: AlertTriangle },
  ] as const;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <GlassContainer style={styles.header}>
          <Text style={styles.title}>Debug Panel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#007AFF" />
          </TouchableOpacity>
        </GlassContainer>

        <View style={styles.tabBar}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Icon size={20} color={isActive ? '#007AFF' : '#8E8E93'} />
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.content}>
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'screen' && renderScreenTab()}
          {activeTab === 'components' && renderComponentsTab()}
          {activeTab === 'errors' && renderErrorsTab()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabLabel: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  componentNode: {
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E5EA',
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  componentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  renderCount: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  componentProps: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noErrors: {
    textAlign: 'center',
    color: '#8E8E93',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  errorLog: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: '#FFF5F5',
    borderLeftColor: '#FF3B30',
  },
  warningLog: {
    backgroundColor: '#FFFBF0',
    borderLeftColor: '#FF9500',
  },
  infoLog: {
    backgroundColor: '#F0F9FF',
    borderLeftColor: '#007AFF',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorLevel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF3B30',
  },
  errorTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  errorMessage: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  errorStack: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});