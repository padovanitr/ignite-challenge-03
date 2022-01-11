import { GetStaticProps } from 'next';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

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

export default function Home({ posts }) {
  console.log('posts ns home', posts)

  return (
    <div className={styles.postsPreviewContainer}>

      {posts.map(post =>(
        <Link key={post.slug} href={`/posts/${post.slug}`}>
          <a className={styles.postsItem}>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.subTitle}>{post.excerpt}</p>
            <div className={styles.bottomInfo}>
              <div className={styles.createdAtContainer}>
                <img src="/images/calendar.svg" alt="calendar" />
                <time>{post.updatedAt}</time>
              </div>
              <div className={styles.authorContainer}>
                <img src="/images/user.svg" alt="user icon" />
                <span>{post.author}</span>
              </div>
            </div>
          </a>
        </Link>
      ))}

    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.content', 'post.author'],
    pageSize: 100,
  });

  console.log('postsResponse', postsResponse.results)

  const posts = postsResponse.results.map(post => {

    return {
      slug: post.uid,
      title: post.data['title'],
      author: post.data['author'],
      excerpt: post.data.content.map(cont => {
        return cont.body.find(content => content.type === "paragraph")?.text ?? ''
      })[0],
      updatedAt: new Date(post.last_publication_date).toLocaleString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
      })
    }
  })

  return {
    props: {posts},
    revalidate: 60 * 60 * 24, // 24 hours
  }
}
