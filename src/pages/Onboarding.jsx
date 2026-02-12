import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Bike, TrendingUp, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const slides = [
  {
    id: 1,
    title: 'Eat Good.',
    subtitle: 'Order from top campus spots.',
    description: 'Discover the best restaurants near your campus. Fresh, delicious, and delivered fast.',
    icon: Leaf,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    color: '#1A4D2E',
    stat: '285g',
    statLabel: 'CO₂ per solo delivery',
  },
  {
    id: 2,
    title: 'Do Good.',
    subtitle: 'We batch orders to kill CO₂.',
    description: 'Our AI groups nearby orders into single trips. Same food, fraction of the carbon footprint.',
    icon: Bike,
    image: 'https://images.unsplash.com/photo-1609682243212-7b5d77f37ccb?auto=format&fit=crop&w=800&q=80',
    color: '#2A6E45',
    stat: '70%',
    statLabel: 'less emissions with batching',
  },
  {
    id: 3,
    title: 'Feel Good.',
    subtitle: 'Save money & the planet.',
    description: 'Track your carbon savings. Compete on the leaderboard. Be the eco-hero your campus needs.',
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1677568475338-32a3ae62a2b6?auto=format&fit=crop&w=800&q=80',
    color: '#C1F03C',
    stat: '40%',
    statLabel: 'cheaper delivery fees',
  },
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      localStorage.setItem('ecoroute_onboarded', 'true');
      navigate('/login');
    }
  }, [currentSlide, navigate]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('ecoroute_onboarded', 'true');
    navigate('/login');
  }, [navigate]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col overflow-hidden">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleSkip}
          className="text-[#5C6B5F] text-sm font-medium px-4 py-2 rounded-full hover:bg-white/50 transition-colors"
          data-testid="skip-onboarding-btn"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Image section */}
            <div className="relative h-[45vh] overflow-hidden">
              <motion.img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F9F9F7]" />
              
              {/* Floating stat card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute bottom-8 left-4 right-4"
              >
                <div className="glass rounded-2xl p-4 flex items-center gap-4 max-w-xs mx-auto">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: slide.color === '#C1F03C' ? slide.color : `${slide.color}20` }}
                  >
                    <Icon 
                      className="w-6 h-6" 
                      style={{ color: slide.color === '#C1F03C' ? '#1A4D2E' : slide.color }} 
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#122618] font-['Syne']">{slide.stat}</p>
                    <p className="text-xs text-[#5C6B5F]">{slide.statLabel}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Text content */}
            <div className="px-6 py-8 flex-1 flex flex-col">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-[#122618] font-['Syne'] tracking-tight"
              >
                {slide.title}
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-[#1A4D2E] font-semibold mt-2"
              >
                {slide.subtitle}
              </motion.p>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[#5C6B5F] mt-4 leading-relaxed"
              >
                {slide.description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-8 space-y-6">
        {/* Dots indicator */}
        <div className="swipe-indicator">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`swipe-dot ${index === currentSlide ? 'active' : ''}`}
              data-testid={`onboarding-dot-${index}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleNext}
          className={`w-full h-14 rounded-full font-bold text-base btn-press ${
            isLast 
              ? 'bg-[#C1F03C] text-[#1A4D2E] hover:bg-[#B2E030] shadow-[0_4px_14px_rgba(193,240,60,0.4)]' 
              : 'bg-[#1A4D2E] text-white hover:bg-[#143D24]'
          }`}
          data-testid="onboarding-next-btn"
        >
          <span className="flex items-center justify-center gap-2">
            {isLast ? 'Get Started' : 'Continue'}
            {isLast ? <ArrowRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
