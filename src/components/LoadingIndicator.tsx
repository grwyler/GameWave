import React from "react";
import styles from "../styles/LoadingIndicator.module.css";

const LoadingIndicator = () => {
  return (
    <div className={styles.loadingIndicator}>
      <svg className={styles.spinner} viewBox="0 0 50 50">
        <circle
          className={styles.path}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
};

export default LoadingIndicator;
