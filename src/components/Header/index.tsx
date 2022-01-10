import styles from './header.module.scss';
import common from '../../styles/common.module.scss';

export function Header() {
  // TODO
  return (
    <header className={common.container}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="spacetraveling logo" />
        <h1>spacetraveling.</h1>
      </div>
    </header>
  )
}
