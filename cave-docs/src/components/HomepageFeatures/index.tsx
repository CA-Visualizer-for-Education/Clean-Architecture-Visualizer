import type {ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type ContentItem = {
  p1: string;
  p2: string;
  code: string;
  p3: string;
};

const contentList: ContentItem[] = [
  {
    p1: 'You can ',
    p2: 'You can download the cave package from Github:',
    code: '$ npm install git+https://github.com/paulgries/Clean-Architecture-Visualizer.git',
    p3: 'Second paragraph explaining or following up on the code.',
  },
];

function ContentBlock({p1, code, p2, p3}: ContentItem) {
  return (
    <div className={clsx('col col--8')}>
      <p>{p1}</p>
      <p>{p2}</p>
      <pre><code>{code}</code></pre>
      <p>{p3}</p>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {contentList.map((props, idx) => (
            <ContentBlock key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}