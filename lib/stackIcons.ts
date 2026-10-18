import {
  siApacheairflow, siApachekafka, siDocker, siFastapi, siHuggingface, siKubernetes, siLangchain, siLanggraph, siMeta,
  siMistralai, siMlflow, siMongodb, siNestjs, siNextdotjs, siNodedotjs, siNumpy, siOllama, siPandas, siPostgresql,
  siPython, siPytorch, siQdrant, siQwen, siReact, siRedis, siScikitlearn, siTemporal, siVllm,
} from 'simple-icons';

export interface StackIcon { path: string; hex: string }

// Brand marks (Simple Icons, bundled at build time) for the Stack tiles. Anything not listed, including brands
// Simple Icons no longer ships (Azure, AWS, OpenAI), renders as a lettered tile.
export const STACK_ICONS: Record<string, StackIcon> = {
  Python: siPython, FastAPI: siFastapi, 'Node.js': siNodedotjs, NestJS: siNestjs, React: siReact, 'Next.js': siNextdotjs,
  PostgreSQL: siPostgresql, MongoDB: siMongodb, Redis: siRedis, Temporal: siTemporal, Kafka: siApachekafka,
  PyTorch: siPytorch, 'scikit-learn': siScikitlearn, 'Hugging Face Transformers': siHuggingface, pandas: siPandas, NumPy: siNumpy,
  Docker: siDocker, Kubernetes: siKubernetes, MLflow: siMlflow, 'Apache Airflow': siApacheairflow,
  'LLaMA 2/3': siMeta, Qwen: siQwen, Mistral: siMistralai, vLLM: siVllm, Ollama: siOllama, LangChain: siLangchain,
  LangGraph: siLanggraph, Qdrant: siQdrant,
};
