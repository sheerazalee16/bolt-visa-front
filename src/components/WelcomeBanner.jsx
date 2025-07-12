import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Trophy, Target, Banknote, UserCircle } from 'lucide-react';

const WelcomeBanner = ({ user, deals }) => {
  const [totalearnings, setTotalEarnings] = useState(0)
  useEffect(() => {
    if (user) {
      const loginHistory = JSON.parse(localStorage.getItem('bolt_visa_login_history') || '[]');
      const today = new Date().toISOString().split('T')[0];

      const todayLogins = loginHistory.filter(login =>
        login.userId === user.id && login.timestamp.startsWith(today)
      );

      if (todayLogins.length === 0) {
        const loginRecord = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString(),
          date: today
        };

        loginHistory.push(loginRecord);
        localStorage.setItem('bolt_visa_login_history', JSON.stringify(loginHistory));
      }
    }
  }, [user]);
  useEffect(() => {
    let totalEarnings = 0
    deals?.forEach((deal) => {
      deal.payment?.installments?.forEach((item) => {
        const earning = Number(item?.incentive || item?.reward || 0);
        totalEarnings += earning;
        setTotalEarnings(Number(totalEarnings))
      });
    });
  }, [deals])
  const mainDeal = deals.filter((val) => val.dealType == 'Main Deal')
  const subDeal = deals.filter((val) => val.dealType == 'Sub Deal')
  const familyDeal = deals.filter((val) => val.dealType == 'Family Deal')
  console.log('deals welcome ', deals)

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(' ')[0] || 'Champion';

    if (hour < 12) return `Good Morning, ${name}`;
    if (hour < 17) return `Good Afternoon, ${name}`;
    return `Good Evening, ${name}`;
  };

  const motivationalMessages = [
    "Ready to close some amazing deals today?",
    "Your next success story starts now!",
    "Let's make today profitable!",
    "Time to turn opportunities into rewards!",
    "Every deal brings you closer to your goals!",
    "Today is perfect for breaking records!",
    "Your expertise makes dreams come true!",
    "Another day, another opportunity to excel!"
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  console.log('totalEarnings ...', totalearnings)
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="welcome-banner">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {getGreeting()}! 👋
                </h2>
                <p className="text-purple-300 mt-1">{randomMessage}</p>
                <p className="text-purple-400 text-sm mt-1">
                  Welcome back to Bolt Visa Express - Let's make today count!
                </p>
              </div>
            </div>

            {user?.role !== 'dmin' && (
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-2 mx-auto">
                    <Trophy className="h-6 w-6 text-green-400" />
                  </div>
                  <p className="text-sm text-white font-semibold">{mainDeal.length || 0}</p>
                  <p className="text-xs text-purple-300">Main Deals</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2 mx-auto">
                    <Target className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-white font-semibold">{subDeal.length || 0}</p>
                  <p className="text-xs text-purple-300">Reference Deals</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-2 mx-auto">
                    <UserCircle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <p className="text-sm text-white font-semibold">{familyDeal.length || 0}</p>
                  <p className="text-xs text-purple-300">Family Deals</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-2 mx-auto">
                    <Banknote className="h-6 w-6 text-purple-400" />
                  </div>
                  <p className="text-sm text-white font-semibold">{(totalearnings || 0).toLocaleString()}</p>
                  <p className="text-xs text-purple-300">PKR Earned</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeBanner;