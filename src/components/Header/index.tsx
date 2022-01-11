import styles from './header.module.scss';

export function Header() {
  // TODO
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="spacetraveling logo" />
        <h1>spacetraveling</h1>
        <span>.</span>
      </div>
    </header>
  )
}
