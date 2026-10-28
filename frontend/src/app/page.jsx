'use client';

import HeroSection from '@/components/home/HeroSection';
import BannerSlider from '@/components/home/BannerSlider';
import TopProjects from '@/components/home/TopProjects';
import TopServices from '@/components/home/TopServices';
import CategoriesSection from '@/components/home/CategoriesSection';
import SkillsSection from '@/components/home/SkillsSection';
import StatsSection from '@/components/home/StatsSection';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BannerSlider />
      <TopProjects />
      <TopServices />
      <CategoriesSection />
      <SkillsSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
