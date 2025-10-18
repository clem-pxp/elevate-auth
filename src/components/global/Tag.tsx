interface TagProps {
  label: string;
}

export default function Tag({ label='Tag' }: TagProps) {
  return (
    <div className="w-fit rounded-full bg-white px-4 py-[0.375rem] shadow-card">
      <span className="text-sm font-medium text-primary leading-tight flex">{label}</span>
    </div>
  );
}
