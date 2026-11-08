import AdsHeroSection from "@/components/ads/AdsHeroSection";
import AdsObstaclesSection from "@/components/ads/AdsObstaclesSection";
import AdsFunnelSection from "@/components/ads/AdsFunnelSection";
import AdsLeadQualitySection from "@/components/ads/AdsLeadQualitySection";
import AdsCrmIntegrationSection from "@/components/ads/AdsCrmIntegrationSection";
import AdsAdditionalChannelsSection from "@/components/ads/AdsAdditionalChannelsSection";
import AdsCaseStudiesSection from "@/components/ads/AdsCaseStudiesSection";
import AdsStepsSection from "@/components/ads/AdsStepsSection";
import AboutSection from "@/components/AboutSection";
import LocationSection from "@/components/LocationSection";
import AdsDemoBannerSection from "@/components/ads/AdsDemoBannerSection";
import AdsFAQSection from "@/components/ads/AdsFAQSection";
import Footer from "@/components/Footer";

const AdsPage = () => {
  return (
    <>
      <AdsHeroSection />
      <AdsObstaclesSection />
      <AdsFunnelSection />
      <AdsAdditionalChannelsSection />
      <AdsLeadQualitySection />
      <AdsCrmIntegrationSection />
      <AdsCaseStudiesSection />
      <AdsStepsSection />
      <AboutSection />
      <LocationSection />
      <AdsDemoBannerSection />
      <AdsFAQSection />
      <Footer />
    </>
  );
};

export default AdsPage;
