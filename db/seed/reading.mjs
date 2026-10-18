// Seeds the Reading page: system-design books and foundational ML papers.
// Idempotent: rows are matched on (kind, title) and updated in place. Run with `npm run db:seed:reading`.
import nextEnv from '@next/env';
import pg from 'pg';

nextEnv.loadEnvConfig(process.cwd());

// Covers from Open Library, saved under public/covers/ so they load fast and never depend on archive.org redirects.
const cover = (isbn) => `/covers/${isbn}.jpg`;

const items = [
  // Books, in the order to read them.
  { kind: 'book', title: 'System Design Interview, Volume 1', authors: 'Alex Xu', note: 'Requirements, capacity estimation, API design, high-level architecture and deep dives through worked examples.', identifier: 'ISBN 9781736049112', image_url: cover('9781736049112') },
  { kind: 'book', title: 'System Design Interview, Volume 2', authors: 'Alex Xu, Sahn Lam', note: 'Advanced problems: payment systems, distributed services and aggregation pipelines.' },
  { kind: 'book', title: 'Designing Data-Intensive Applications (2nd ed.)', authors: 'Martin Kleppmann, Chris Riccomini', note: 'Replication, partitioning, consistency, transactions and streaming: the distributed-systems foundation.' },
  { kind: 'book', title: 'Machine Learning System Design Interview', authors: 'Ali Aminian, Alex Xu', note: 'System design for ML: recommendations, ranking, prediction, training data, evaluation and serving.', identifier: 'ISBN 9781736049129', image_url: cover('9781736049129') },
  { kind: 'book', title: 'Generative AI System Design Interview', authors: 'Ali Aminian, Hao Sheng', note: 'LLM applications, RAG systems, inference pipelines and evaluation workflows.', identifier: 'ISBN 9781736049143', image_url: cover('9781736049143') },
  // Papers, in the recommended reading order.
  { kind: 'paper', title: 'Attention Is All You Need', authors: 'Vaswani et al.', venue: 'NeurIPS', year: 2017, identifier: 'arXiv:1706.03762', url: 'https://arxiv.org/abs/1706.03762', note: 'The Transformer: self-attention, multi-head attention, positional encoding.' },
  { kind: 'paper', title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', authors: 'Devlin et al.', venue: 'NAACL', year: 2018, identifier: 'arXiv:1810.04805', url: 'https://arxiv.org/abs/1810.04805', note: 'Masked language modelling and the pretrain-then-fine-tune recipe.' },
  { kind: 'paper', title: 'Language Models are Few-Shot Learners', authors: 'Brown et al.', venue: 'NeurIPS', year: 2020, identifier: 'arXiv:2005.14165', url: 'https://arxiv.org/abs/2005.14165', note: 'GPT-3: scaling and in-context learning.' },
  { kind: 'paper', title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', authors: 'Lewis et al.', venue: 'NeurIPS', year: 2020, identifier: 'arXiv:2005.11401', url: 'https://arxiv.org/abs/2005.11401', note: 'Retriever + generator with non-parametric memory.' },
  { kind: 'paper', title: 'LoRA: Low-Rank Adaptation of Large Language Models', authors: 'Hu et al.', venue: 'ICLR', year: 2021, identifier: 'arXiv:2106.09685', url: 'https://arxiv.org/abs/2106.09685', note: 'Parameter-efficient fine-tuning with low-rank updates.' },
  { kind: 'paper', title: 'Deep Residual Learning for Image Recognition', authors: 'He et al.', venue: 'CVPR', year: 2015, identifier: 'arXiv:1512.03385', url: 'https://arxiv.org/abs/1512.03385', note: 'ResNet: skip connections make very deep networks trainable.' },
  { kind: 'paper', title: 'ImageNet Classification with Deep Convolutional Neural Networks', authors: 'Krizhevsky, Sutskever, Hinton', venue: 'NeurIPS', year: 2012, url: 'https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html', note: 'AlexNet: deep CNNs, ReLU, dropout and GPU training.' },
  { kind: 'paper', title: 'Adam: A Method for Stochastic Optimization', authors: 'Kingma, Ba', venue: 'ICLR', year: 2014, identifier: 'arXiv:1412.6980', url: 'https://arxiv.org/abs/1412.6980', note: 'Adaptive per-parameter learning rates from gradient moments.' },
  { kind: 'paper', title: 'Denoising Diffusion Probabilistic Models', authors: 'Ho, Jain, Abbeel', venue: 'NeurIPS', year: 2020, identifier: 'arXiv:2006.11239', url: 'https://arxiv.org/abs/2006.11239', note: 'Generative modelling by learning to reverse a noising process.' },
  { kind: 'paper', title: 'Playing Atari with Deep Reinforcement Learning', authors: 'Mnih et al.', venue: 'NeurIPS Deep Learning Workshop', year: 2013, identifier: 'arXiv:1312.5602', url: 'https://arxiv.org/abs/1312.5602', note: 'DQN: Q-learning with experience replay from raw pixels.' },
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();
const cols = ['authors', 'note', 'venue', 'year', 'identifier', 'url', 'image_url', 'sort_order'];
for (const [i, it] of items.entries()) {
  const row = { ...it, sort_order: i + 1 };
  const vals = cols.map((c) => row[c] ?? null);
  const set = cols.map((c, j) => `${c} = $${j + 3}`).join(', ');
  const upd = await client.query(`update reading_items set ${set} where kind = $1 and title = $2`, [row.kind, row.title, ...vals]);
  if (!upd.rowCount) {
    await client.query(
      `insert into reading_items (kind, title, status, ${cols.join(', ')}) values ($1, $2, 'want', ${cols.map((_, j) => `$${j + 3}`).join(', ')})`,
      [row.kind, row.title, ...vals],
    );
  }
}
const { rows } = await client.query('select sort_order, kind, title, image_url is not null as cover from reading_items order by sort_order nulls last');
console.table(rows);
await client.end();
