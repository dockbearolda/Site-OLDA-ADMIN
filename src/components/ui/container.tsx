import type { HTMLAttributes, ReactNode } from "react";

import styles from "./container.module.css";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Container({
  children,
  className = "",
  ...props
}: ContainerProps) {
  const classes = `${styles.container} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
