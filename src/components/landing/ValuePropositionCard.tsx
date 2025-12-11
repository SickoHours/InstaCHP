import { Card } from '@/components/ui';

interface ValuePropositionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function ValuePropositionCard({
  icon,
  title,
  description
}: ValuePropositionCardProps) {
  return (
    <Card variant="glass" padding="lg" hover>
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-4 text-teal-400" aria-hidden="true">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}
