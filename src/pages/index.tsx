import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  readingTime: number;
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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  function handlePagination(): void {
    setIsLoading(true)
    if (!nextPage) return

    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        setIsLoading(false)
        const formattedData = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...formattedData]);
        setNextPage(data.next_page);
      });
  }

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  return (
    <div className={commonStyles.contentContainer}>

      {posts && posts.map(post => (
        <Link key={post.uid} href={`/post/${post.uid}`}>
          <a onClick={(e) => setPageLoading(true)} className={styles.postsItem}>
            <h1 className={styles.title}>{post.data.title}</h1>
            <p className={styles.subTitle}>{post.data.subtitle}</p>
            <div className={styles.bottomInfo}>
              <div className={styles.createdAtContainer}>
                <FiCalendar size={20} color="#BBBBBB" />
                <time>{format(
                  new Date(post.first_publication_date),
                  "dd LLL yyyy",
                  {
                    locale: ptBR,
                  }
                )}</time>

              </div>
              <div className={styles.authorContainer}>
                <FiUser size={20} color="#BBBBBB" />
                <span>{post.data.author}</span>
              </div>

              <span className={styles.readingTime}>
                <FiClock size={20} color="#BBBBBB" />
                {post.readingTime} min
              </span>
            </div>
          </a>
        </Link>
      ))}

      {nextPage && (
        <button
          onClick={handlePagination}
          className={styles.loadMore}
        >
          {isLoading
          ? <img className={styles.loadingGif} src="/images/loading.gif" alt="carregando..." />
          : "Carregar mais posts"
          }
        </button>
      )}

      {pageLoading &&
        <div className={styles.overlayLoadingGif}>
          <img src="/images/loading.gif" alt="Página carregando..." />
        </div>
      }
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    pageSize: 2,
    orderings: '[document.first_publication_date desc]',
  });

  const posts = postsResponse.results.map(post => {

    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data['title'],
        author: post.data['author'],
        subtitle: post.data.subtitle
      },
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      }
    },
    revalidate: 60 * 30,
  }
}
