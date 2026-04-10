import styles from "./media-placeholder.module.css";

type MediaPlaceholderProps = {
  label?: string;
  ratio?: "square" | "landscape" | "portrait";
  className?: string;
};

export function MediaPlaceholder({
  label = "Photo",
  ratio = "square",
  className = "",
}: MediaPlaceholderProps) {
  const classes = [
    styles.placeholder,
    styles[ratio],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} aria-hidden="true">
      <span className={styles.label}>{label}</span>
    </div>
  );
}
