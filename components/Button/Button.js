import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  icon = true,
  ...props
}) {
  const classes = `btn btn-${variant} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {icon ? <ArrowRight size={18} strokeWidth={2.2} /> : null}
    </>
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
