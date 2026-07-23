import FeatureCard from "../ui/FeatureCard";

const features = [
  {
    title: "Teach Skills",
    description: "Help others by sharing your expertise.",
  },
  {
    title: "Learn Anything",
    description: "Find mentors and discover new skills.",
  },
  {
    title: "Smart Matching",
    description: "Get matched with the perfect learning partner.",
  },
  {
    title: "Book Sessions",
    description: "Schedule one-on-one learning sessions.",
  },
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto py-20 px-6">
      <h2 className="text-4xl font-bold text-center mb-14">
        Everything you need
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}