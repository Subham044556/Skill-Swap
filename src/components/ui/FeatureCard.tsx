interface Props {
  title: string;
  description: string;
}

export default function FeatureCard({
  title,
  description,
}: Props) {
  return (
    <div className="border rounded-xl p-6 hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-3">
        {title}
      </h3>

      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}