import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';
import * as prismicH from '@prismicio/helpers';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';

interface Post {
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  readingTime: number;
}

export default function Post({ post, readingTime }: PostProps) {
    const router = useRouter();

    if (router.isFallback) {
      return <div>Carregando...</div>
    }

    return (
     <>
      <Head>
        <title>{post.data.title} | Space Traveling</title>
      </Head>

      {post.data.banner.url && (
        <section className={styles.banner}>
          <img src={post.data.banner.url} alt="Banner" />
        </section>
      )}

      <main className={styles.content}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.postInfo}>
            <span>
              <FiCalendar size={20} color="#BBBBBB" />
              {format(
                parseISO(post.last_publication_date),
                "dd LLL yyyy",
                {
                  locale: ptBR,
                }
              )}
            </span>

            <span>
              <FiUser size={20} color="#BBBBBB" />
              {post.data.author}
            </span>

            <span>
              <FiClock size={20} color="#BBBBBB" />
              {readingTime} min
            </span>
          </div>

          <div className={styles.postContent}>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                {heading && <h2>{heading}</h2>}

                <div
                  className={styles.postSection}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
     </>
   )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  }

  const amountBody = prismicH.asText(
    post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length;

  const amountHeading = post.data.content.reduce((acc, data) => {
    if (data.heading) {
      return [...acc, data.heading.split(' ')]
    }

    return [...acc]
  },[]).length;

  const readingTime = Math.ceil((amountBody + amountHeading) / 200)

  return {
    props: {
      post,
      readingTime
    }
  }
};
