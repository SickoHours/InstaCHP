import { Zap, Eye, Download } from 'lucide-react';
import { Container } from '@/components/ui';
import AnimatedBackground from '@/components/landing/AnimatedBackground';
import Hero from '@/components/landing/Hero';
import ValuePropositionCard from '@/components/landing/ValuePropositionCard';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative">
        <Container size="lg">
          <Hero />
        </Container>
      </section>

      {/* Value Proposition Section */}
      <section className="relative py-20">
        <Container size="lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValuePropositionCard
              icon={<Zap className="w-12 h-12" />}
              title="Automated Retrieval"
              description="Our system automatically searches CHP portals and downloads reports, eliminating manual work and saving hours of staff time."
            />
            <div style={{ animationDelay: '100ms' }}>
              <ValuePropositionCard
                icon={<Eye className="w-12 h-12" />}
                title="Real-Time Tracking"
                description="Track every request from submission to delivery with live status updates. Always know where your reports are in the process."
              />
            </div>
            <div style={{ animationDelay: '200ms' }}>
              <ValuePropositionCard
                icon={<Download className="w-12 h-12" />}
                title="Instant Downloads"
                description="Get face pages and full reports delivered straight to your dashboard. Download anytime, from any device."
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
