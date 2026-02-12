import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, TreeDeciduous, Car, TrendingUp, Award, ChevronRight, Share2 } from 'lucide-react';
import CountUp from 'react-countup';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import BottomNav from '../components/BottomNav';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        api.get('/carbon/stats'),
        api.get('/carbon/leaderboard'),
      ]);
      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShare = async () => {
    const text = `I've saved ${((stats?.total_co2_saved || 0) / 1000).toFixed(1)}kg of CO₂ using EcoRoute! Join me in saving the planet while ordering food.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My EcoRoute Impact',
          text: text,
          url: window.location.origin,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(text);
        }
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Impact copied to clipboard!');
  };

  const chartData = stats?.weekly_savings?.map((value, index) => ({
    day: weekDays[index],
    value: value / 1000, // Convert to kg
  })) || weekDays.map(day => ({ day, value: 0 }));

  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  const userRank = leaderboard.findIndex(entry => entry.user_id === user?.id) + 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] pb-24">
        <div className="h-64 bg-[#1A4D2E] rounded-b-[32px]" />
        <div className="px-4 -mt-20 space-y-4">
          <div className="h-40 shimmer rounded-2xl" />
          <div className="h-48 shimmer rounded-2xl" />
          <div className="h-64 shimmer rounded-2xl" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-24">
      {/* Header */}
      <div className="bg-[#1A4D2E] px-4 pt-12 pb-24 rounded-b-[32px]">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-[#C1F03C] text-sm font-medium">Your Impact</p>
            <h1 className="text-white text-2xl font-bold font-['Syne']">Carbon Dashboard</h1>
          </div>
          <Button
            onClick={handleShare}
            size="icon"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20"
            data-testid="share-impact-btn"
          >
            <Share2 className="w-5 h-5 text-white" />
          </Button>
        </motion.div>

        {/* Main stat */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="inline-flex items-baseline gap-2">
            <span className="text-6xl font-bold text-white font-['Syne'] counter-animate">
              <CountUp
                end={(stats?.total_co2_saved || 0) / 1000}
                decimals={1}
                duration={2}
                separator=","
              />
            </span>
            <span className="text-2xl text-[#C1F03C] font-bold">kg</span>
          </div>
          <p className="text-white/80 mt-2">Total CO₂ Saved</p>
        </motion.div>
      </div>

      {/* Stats cards */}
      <div className="px-4 -mt-12 space-y-4">
        {/* Impact metrics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-lg border border-[#E5E7EB]"
        >
          <h3 className="font-bold text-[#122618] mb-4 font-['Syne']">Your Impact Equals</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F9F9F7] rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-[#C1F03C] flex items-center justify-center mb-3">
                <TreeDeciduous className="w-6 h-6 text-[#1A4D2E]" />
              </div>
              <p className="text-2xl font-bold text-[#122618] font-['Syne']">
                <CountUp end={stats?.trees_equivalent || 0} decimals={1} duration={1.5} />
              </p>
              <p className="text-sm text-[#5C6B5F]">Trees planted</p>
            </div>

            <div className="bg-[#F9F9F7] rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-[#1A4D2E] flex items-center justify-center mb-3">
                <Car className="w-6 h-6 text-[#C1F03C]" />
              </div>
              <p className="text-2xl font-bold text-[#122618] font-['Syne']">
                <CountUp end={stats?.km_not_driven || 0} decimals={1} duration={1.5} />
              </p>
              <p className="text-sm text-[#5C6B5F]">km not driven</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-[#1A4D2E] to-[#2A6E45] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C1F03C] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#1A4D2E]" />
              </div>
              <div className="text-white">
                <p className="font-bold">
                  <CountUp end={stats?.orders_this_month || 0} duration={1} /> orders
                </p>
                <p className="text-white/70 text-sm">this month</p>
              </div>
            </div>
            <div className="text-right text-white">
              {userRank > 0 && (
                <>
                  <p className="font-bold text-[#C1F03C]">#{userRank}</p>
                  <p className="text-white/70 text-sm">campus rank</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Weekly chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]"
        >
          <h3 className="font-bold text-[#122618] mb-4 font-['Syne']">Weekly Savings</h3>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#5C6B5F', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#8FA392', fontSize: 10 }}
                  tickFormatter={(value) => `${value}kg`}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.value === maxChartValue ? '#C1F03C' : '#1A4D2E'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#122618] font-['Syne']">Campus Leaderboard</h3>
            <button
              onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
              className="text-[#1A4D2E] text-sm font-medium flex items-center gap-1"
              data-testid="toggle-leaderboard-btn"
            >
              {showFullLeaderboard ? 'Show less' : 'See all'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showFullLeaderboard ? 'rotate-90' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {leaderboard.slice(0, showFullLeaderboard ? 10 : 5).map((entry, index) => {
              const isCurrentUser = entry.user_id === user?.id;
              const getRankStyle = () => {
                if (index === 0) return 'bg-[#FFD700] text-[#1A4D2E]';
                if (index === 1) return 'bg-[#C0C0C0] text-[#1A4D2E]';
                if (index === 2) return 'bg-[#CD7F32] text-white';
                return 'bg-[#F0F2F0] text-[#5C6B5F]';
              };

              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCurrentUser ? 'bg-[#C1F03C]/20 border border-[#C1F03C]' : 'bg-[#F9F9F7]'
                  }`}
                  data-testid={`leaderboard-entry-${index}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle()}`}>
                    {index < 3 ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      entry.rank
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-semibold ${isCurrentUser ? 'text-[#1A4D2E]' : 'text-[#122618]'}`}>
                      {entry.name}
                      {isCurrentUser && <span className="text-xs ml-2 text-[#1A4D2E]">(You)</span>}
                    </p>
                    <p className="text-xs text-[#5C6B5F]">{entry.total_orders} orders</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-[#1A4D2E]">
                      {(entry.total_co2_saved / 1000).toFixed(1)}kg
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[#5C6B5F]">
                      <Leaf className="w-3 h-3 text-[#C1F03C]" />
                      saved
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {userRank > 5 && !showFullLeaderboard && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#C1F03C]/20 border border-[#C1F03C]">
                <div className="w-8 h-8 rounded-full bg-[#F0F2F0] flex items-center justify-center font-bold text-sm text-[#5C6B5F]">
                  {userRank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1A4D2E]">
                    {user?.name} <span className="text-xs">(You)</span>
                  </p>
                  <p className="text-xs text-[#5C6B5F]">{user?.total_orders || 0} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1A4D2E]">
                    {((user?.total_co2_saved || 0) / 1000).toFixed(1)}kg
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => navigate('/')}
            className="w-full h-14 rounded-2xl bg-[#1A4D2E] text-white font-bold btn-press"
            data-testid="order-more-btn"
          >
            <Leaf className="w-5 h-5 mr-2" />
            Order & Save More CO₂
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
