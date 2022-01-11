import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <div className={styles.postsPreviewContainer}>
      <div className={styles.postsItem}>
        <h1 className={styles.title}>Como utilizar Hooks</h1>
        <p className={styles.subTitle}>Pensando em sincronização em vez de ciclos de vida.</p>
        <div className={styles.bottomInfo}>
          <div className={styles.createdAtContainer}>
            <img src="/images/calendar.svg" alt="calendar" />
            <span>15 Mar 2021</span>
          </div>
          <div className={styles.authorContainer}>
            <img src="/images/user.svg" alt="user icon" />
            <span>Joseph Oliveira</span>
          </div>
        </div>
      </div>

      <div className={styles.postsItem}>
        <h1 className={styles.title}>Como utilizar Hooks</h1>
        <p className={styles.subTitle}>Pensando em sincronização em vez de ciclos de vida.</p>
        <div className={styles.bottomInfo}>
          <div className={styles.createdAtContainer}>
            <img src="/images/calendar.svg" alt="calendar" />
            <span>15 Mar 2021</span>
          </div>
          <div className={styles.authorContainer}>
            <img src="/images/user.svg" alt="user icon" />
            <span>Joseph Oliveira</span>
          </div>
        </div>
      </div>

      <div className={styles.postsItem}>
        <h1 className={styles.title}>Como utilizar Hooks</h1>
        <p className={styles.subTitle}>Pensando em sincronização em vez de ciclos de vida.</p>
        <div className={styles.bottomInfo}>
          <div className={styles.createdAtContainer}>
            <img src="/images/calendar.svg" alt="calendar" />
            <span>15 Mar 2021</span>
          </div>
          <div className={styles.authorContainer}>
            <img src="/images/user.svg" alt="user icon" />
            <span>Joseph Oliveira</span>
          </div>
        </div>
      </div>

    </div>
  )
}

//export const getStaticProps = async () => {
//  const prismic = getPrismicClient();
  //const postsResponse = await prismic.query(TODO);

  // TODO
//};
