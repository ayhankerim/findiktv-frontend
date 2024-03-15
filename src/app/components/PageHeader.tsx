interface PageHeaderProps {
  heading: string;
  text?: string;
}

export default function PageHeader({ heading, text }: PageHeaderProps) {
  return (
    <div className="my-16 w-full text-center">
      <h1 className="text-xxl my-4 lg:text-xxl font-bold font-heading">
        {heading}
      </h1>
      {text && <span className="text-violet-400 font-bold">{text}</span>}
    </div>
  );
}
