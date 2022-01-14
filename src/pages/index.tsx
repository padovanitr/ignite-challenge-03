import { GetStaticProps } from 'next';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';

interface Post {
  slug?: string;
  last_publication_date: string | null;
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

  console.log('posts', posts)

  function handlePagination(): void {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.results.map(post => {
          return {
            uid: post.uid,
            last_publication_date: post.last_publication_date,
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

      {posts.map(post =>(
        <Link key={post.slug} href={`/post/${post.slug}`}>
          <a className={styles.postsItem}>
            <h1 className={styles.title}>{post.data.title}</h1>
            <p className={styles.subTitle}>{post.data.subtitle}</p>
            <div className={styles.bottomInfo}>
              <div className={styles.createdAtContainer}>
                <FiCalendar size={20} color="#BBBBBB" />
                <time>{format(
                  parseISO(post.last_publication_date),
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
            </div>
          </a>
        </Link>
      ))}

      {nextPage &&
        <button
          onClick={handlePagination}
          className={styles.loadMore}
        >
          Carregar mais posts
        </button>
      }

    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.content', 'post.author'],
    pageSize: 2,
  });

  const posts = postsResponse.results.map(post => {

    return {
      slug: post.uid,
      last_publication_date: post.last_publication_date,
      data: {
        title: post.data['title'],
        author: post.data['author'],
        subtitle: post.data.content.map(cont => {
          return cont.body.find(content => content.type === "paragraph")?.text ?? ''
        })[0].slice(0, 100) + "...",
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
  }
}
