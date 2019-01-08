import fs from 'fs';

export default [
  {
    title: 'Overview',
    slug: 'docs-overview',
    source: fs.readFileSync(`${__dirname}/modula.md`, 'utf8')
  },
  {
    title: 'Model',
    slug: 'docs-model',
    source: fs.readFileSync(`${__dirname}/model.md`, 'utf8')
  },
  {
    title: 'Model Side Effects',
    slug: 'docs-model-side-effects',
    source: fs.readFileSync(`${__dirname}/model_side_effects.md`, 'utf8')
  },
  {
    title: 'Model Communications',
    slug: 'docs-model-communications',
    source: fs.readFileSync(`${__dirname}/model_communications.md`, 'utf8')
  },
  {
    title: 'Model Lifecycle',
    slug: 'docs-model-lifecycle',
    source: fs.readFileSync(`${__dirname}/model_lifecycle.md`, 'utf8')
  },
  {
    title: 'Model Services',
    slug: 'docs-model-services',
    source: fs.readFileSync(`${__dirname}/model_services.md`, 'utf8')
  },
  {
    title: 'Store',
    slug: 'docs-store',
    source: fs.readFileSync(`${__dirname}/store.md`, 'utf8')
  },
  {
    title: 'Model API',
    slug: 'docs-model-api',
    source: fs.readFileSync(`${__dirname}/api/model_api.md`, 'utf8')
  },
  {
    title: 'Test Util API',
    slug: 'docs-test-util-api',
    source: fs.readFileSync(`${__dirname}/api/test_util_api.md`, 'utf8')
  }
];
