import { Banner } from "@/components/banner";
import { FeaturedServices } from "@/components/featured-services";
import { HowItWorks } from "@/components/how-it-works";
import { ServiceCategories } from "@/components/service-categories";
import { WhyChooseWedPlan } from "@/components/why-choose-us";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-14">
      <Banner />
      <FeaturedServices />
      <ServiceCategories />
      <WhyChooseWedPlan />
      <HowItWorks />
    </div>
  );
}
