import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Calendar, 
  Target,
  DollarSign,
  X,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react-native';

interface RedditStrategyProps {
  visible: boolean;
  onClose: () => void;
}

interface SubredditTarget {
  name: string;
  members: number;
  conversion: number;
  status: 'researching' | 'participating' | 'posting' | 'completed';
  expectedInstalls: number;
}

interface ContentPhase {
  phase: string;
  duration: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export default function RedditStrategy({ visible, onClose }: RedditStrategyProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'subreddits' | 'content' | 'metrics'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const targetSubs: SubredditTarget[] = [
    { 
      name: 'r/dogs', 
      members: 3500000, 
      conversion: 0.008, 
      status: 'participating',
      expectedInstalls: Math.round(3500000 * 0.008)
    },
    { 
      name: 'r/cats', 
      members: 4200000, 
      conversion: 0.007, 
      status: 'researching',
      expectedInstalls: Math.round(4200000 * 0.007)
    },
    { 
      name: 'r/pets', 
      members: 2800000, 
      conversion: 0.009, 
      status: 'posting',
      expectedInstalls: Math.round(2800000 * 0.009)
    },
    { 
      name: 'r/LostPets', 
      members: 125000, 
      conversion: 0.025, 
      status: 'completed',
      expectedInstalls: Math.round(125000 * 0.025)
    }
  ];

  const contentPhases: ContentPhase[] = [
    {
      phase: 'Community Research',
      duration: 'Week 1-2',
      description: 'Authentic participation, understanding community rules and culture',
      status: 'completed'
    },
    {
      phase: 'Value-First Content',
      duration: 'Week 3-4',
      description: 'Sharing helpful tips, guides, and pet care advice',
      status: 'active'
    },
    {
      phase: 'Success Stories',
      duration: 'Week 5-8',
      description: 'Sharing reunion stories with subtle branding',
      status: 'pending'
    },
    {
      phase: 'Community Building',
      duration: 'Ongoing',
      description: 'Building relationships and establishing thought leadership',
      status: 'pending'
    }
  ];

  const expectedResults = {
    monthlyInstalls: 650,
    cost: 2000, // Community manager salary
    CAC: 3.08,
    timeToROI: '3-4 months',
    organicReach: 85000,
    engagementRate: 0.045
  };

  const handleStartCampaign = useCallback(async (subreddit: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call to start Reddit campaign
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Campaign Started! 🚀',
        `Reddit marketing campaign for ${subreddit} has been initiated. Community manager will begin authentic participation.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'active': case 'posting': case 'participating': return '#F59E0B';
      case 'pending': case 'researching': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="#10B981" size={16} />;
      case 'active': case 'posting': case 'participating': return <Clock color="#F59E0B" size={16} />;
      default: return <Clock color="#6B7280" size={16} />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reddit Marketing Strategy</Text>
        <Text style={styles.sectionDescription}>
          Organic community-driven growth through authentic participation in pet-related subreddits.
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{expectedResults.monthlyInstalls}</Text>
          <Text style={styles.metricLabel}>Monthly Installs</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>${expectedResults.CAC}</Text>
          <Text style={styles.metricLabel}>Cost per Acquisition</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{formatNumber(expectedResults.organicReach)}</Text>
          <Text style={styles.metricLabel}>Organic Reach</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{Math.round(expectedResults.engagementRate * 100)}%</Text>
          <Text style={styles.metricLabel}>Engagement Rate</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target color="#FF6B6B" size={20} />
          <Text style={styles.sectionTitle}>Campaign Status</Text>
        </View>
        
        <View style={styles.statusCard}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Active Subreddits</Text>
            <Text style={styles.statusValue}>{targetSubs.filter(s => s.status === 'participating' || s.status === 'posting' || s.status === 'completed').length}/4</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Total Reach</Text>
            <Text style={styles.statusValue}>{formatNumber(targetSubs.reduce((sum, sub) => sum + sub.members, 0))}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Expected Installs</Text>
            <Text style={styles.statusValue}>{targetSubs.reduce((sum, sub) => sum + sub.expectedInstalls, 0)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSubreddits = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Subreddits</Text>
        <Text style={styles.sectionDescription}>
          Strategic communities with high pet owner engagement and conversion potential.
        </Text>
      </View>

      <View style={styles.subredditsList}>
        {targetSubs.map((sub, index) => (
          <View key={index} style={styles.subredditCard}>
            <View style={styles.subredditHeader}>
              <View>
                <Text style={styles.subredditName}>{sub.name}</Text>
                <Text style={styles.subredditMembers}>{formatNumber(sub.members)} members</Text>
              </View>
              <View style={styles.subredditStatus}>
                {getStatusIcon(sub.status)}
                <Text style={[styles.statusText, { color: getStatusColor(sub.status) }]}>
                  {sub.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.subredditMetrics}>
              <View style={styles.subredditMetric}>
                <Text style={styles.metricValue}>{(sub.conversion * 100).toFixed(1)}%</Text>
                <Text style={styles.metricLabel}>Conversion Rate</Text>
              </View>
              <View style={styles.subredditMetric}>
                <Text style={styles.metricValue}>{sub.expectedInstalls}</Text>
                <Text style={styles.metricLabel}>Expected Installs</Text>
              </View>
            </View>
            
            {sub.status === 'researching' && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleStartCampaign(sub.name)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.actionButtonText}>Start Campaign</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderContent = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Calendar</Text>
        <Text style={styles.sectionDescription}>
          Phased approach to build trust and provide value before promoting the app.
        </Text>
      </View>

      <View style={styles.phasesList}>
        {contentPhases.map((phase, index) => (
          <View key={index} style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseName}>{phase.phase}</Text>
                <Text style={styles.phaseDuration}>{phase.duration}</Text>
              </View>
              <View style={styles.phaseStatus}>
                {getStatusIcon(phase.status)}
              </View>
            </View>
            <Text style={styles.phaseDescription}>{phase.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMetrics = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expected Performance</Text>
        <Text style={styles.sectionDescription}>
          Projected results based on community size, engagement rates, and conversion data.
        </Text>
      </View>

      <View style={styles.performanceCard}>
        <View style={styles.performanceHeader}>
          <BarChart3 color="#FF6B6B" size={24} />
          <Text style={styles.performanceTitle}>Monthly Projections</Text>
        </View>
        
        <View style={styles.performanceMetrics}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>New Installs</Text>
            <Text style={styles.performanceValue}>{expectedResults.monthlyInstalls}</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Marketing Cost</Text>
            <Text style={styles.performanceValue}>${expectedResults.cost}</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Cost per Acquisition</Text>
            <Text style={styles.performanceValue}>${expectedResults.CAC}</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Time to ROI</Text>
            <Text style={styles.performanceValue}>{expectedResults.timeToROI}</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Organic Reach</Text>
            <Text style={styles.performanceValue}>{formatNumber(expectedResults.organicReach)}</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Engagement Rate</Text>
            <Text style={styles.performanceValue}>{Math.round(expectedResults.engagementRate * 100)}%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Reddit Strategy</Text>
            <Text style={styles.subtitle}>Community-driven organic growth</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#64748B" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'subreddits', label: 'Subreddits', icon: Users },
            { key: 'content', label: 'Content', icon: Calendar },
            { key: 'metrics', label: 'Metrics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
                onPress={() => setSelectedTab(tab.key as any)}
              >
                <Icon 
                  color={selectedTab === tab.key ? '#FF6B6B' : '#64748B'} 
                  size={16} 
                />
                <Text style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.content}>
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'subreddits' && renderSubreddits()}
          {selectedTab === 'content' && renderContent()}
          {selectedTab === 'metrics' && renderMetrics()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#FEF2F2',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subredditsList: {
    gap: 16,
  },
  subredditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subredditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subredditName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  subredditMembers: {
    fontSize: 14,
    color: '#64748B',
  },
  subredditStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  subredditMetrics: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  subredditMetric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  phasesList: {
    gap: 16,
  },
  phaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  phaseDuration: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  phaseStatus: {
    marginLeft: 12,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  performanceMetrics: {
    gap: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
});