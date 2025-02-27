import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import React from 'react';

import styles from './index.module.css';

export function HomepageHeader(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles['heroBanner'])}>
      <div className='container'>
        <h1 className='hero__title'>{siteConfig.title}</h1>
        <p className='hero__subtitle'>{siteConfig.tagline}</p>
        <div className={styles['buttons']}>
          <Link
            // eslint-disable-next-line react/forbid-component-props
            className={'button button--secondary button--lg'}
            to='/docs/intro'
          >
            {'Docusaurus Tutorial - 5min ⏱️'}
          </Link>
        </div>
      </div>
    </header>
  );
}
